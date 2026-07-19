import OpenAI from "openai";
import { createHash } from "node:crypto";
import {
  aiCacheEvents,
  aiEstimatedCostUsd,
  aiProviderCalls,
  aiProviderDuration,
  aiTokensTotal,
} from "@/lib/metrics";

/**
 * Camada de IA multi-provedor. Todos os provedores abaixo são compatíveis com a
 * API OpenAI (mesmo formato de chat.completions), então usamos um único cliente
 * e só trocamos baseURL / apiKey / model.
 *
 * Um endpoint só entra na fila se a chave dele estiver setada. As chamadas são
 * distribuídas em round-robin entre os provedores configurados. Se o provedor
 * escolhido falhar (limite, erro), a chamada cai para o próximo automaticamente.
 *
 * Para ligar um provedor, basta definir a chave (e, opcional, o modelo) no .env:
 *   OPENAI_API_KEY, GROQ_API_KEY, CEREBRAS_API_KEY, GEMINI_API_KEY, TOGETHER_API_KEY,
 *   DEEPINFRA_API_KEY, OPENROUTER_API_KEY
 */

export type AiEndpoint = {
  id: string;
  label: string;
  baseURL: string;
  apiKey: string | undefined;
  model: string;
};

function buildRegistry(groqModel: string): AiEndpoint[] {
  return [
    {
      id: "groq",
      label: "Groq",
      baseURL: "https://api.groq.com/openai/v1",
      apiKey: process.env.GROQ_API_KEY,
      model: groqModel,
    },
    {
      id: "cerebras",
      label: "Cerebras",
      baseURL: "https://api.cerebras.ai/v1",
      apiKey: process.env.CEREBRAS_API_KEY,
      model: process.env.CEREBRAS_MODEL || "gpt-oss-120b",
    },
    {
      id: "gemini",
      label: "Gemini",
      baseURL: "https://generativelanguage.googleapis.com/v1beta/openai/",
      apiKey: process.env.GEMINI_API_KEY,
      model: process.env.GEMINI_MODEL || "gemini-3.1-flash-lite",
    },
    {
      id: "openai",
      label: "OpenAI",
      baseURL: "https://api.openai.com/v1",
      apiKey: process.env.OPENAI_API_KEY,
      model: process.env.OPENAI_MODEL || "gpt-4.1-nano",
    },
    {
      id: "together",
      label: "Together",
      baseURL: "https://api.together.xyz/v1",
      apiKey: process.env.TOGETHER_API_KEY,
      model: process.env.TOGETHER_MODEL || "meta-llama/Llama-3.3-70B-Instruct-Turbo",
    },
    {
      id: "deepinfra",
      label: "DeepInfra",
      baseURL: "https://api.deepinfra.com/v1/openai",
      apiKey: process.env.DEEPINFRA_API_KEY,
      model: process.env.DEEPINFRA_MODEL || "meta-llama/Llama-3.3-70B-Instruct",
    },
    {
      id: "openrouter",
      label: "OpenRouter",
      baseURL: "https://openrouter.ai/api/v1",
      apiKey: process.env.OPENROUTER_API_KEY,
      model: process.env.OPENROUTER_MODEL || "meta-llama/llama-3.3-70b-instruct",
    },
  ];
}

/** Endpoints com chave configurada, na ordem base do registro. */
export function getConfiguredEndpoints(groqModel: string): AiEndpoint[] {
  return buildRegistry(groqModel).filter((e) => e.apiKey && e.apiKey.trim());
}

let rotationCursor = 0;
const FREE_FIRST_PROVIDER_IDS = new Set(["groq", "cerebras", "gemini"]);
const PAID_RESERVE_PROVIDER_IDS = new Set(["openai"]);

/** Rotaciona sem remover nenhum endpoint; a ordem restante serve como fallback. */
export function rotateEndpoints(endpoints: AiEndpoint[], startIndex: number): AiEndpoint[] {
  if (endpoints.length <= 1) return [...endpoints];
  const normalizedIndex = ((startIndex % endpoints.length) + endpoints.length) % endpoints.length;
  return [...endpoints.slice(normalizedIndex), ...endpoints.slice(0, normalizedIndex)];
}

export function orderEndpointsForRouting(
  endpoints: AiEndpoint[],
  mode: string | undefined,
  startIndex: number
): AiEndpoint[] {
  if (mode === "priority" || endpoints.length <= 1) return [...endpoints];
  if (mode === "round_robin") return rotateEndpoints(endpoints, startIndex);

  const free = endpoints.filter((endpoint) => FREE_FIRST_PROVIDER_IDS.has(endpoint.id));
  const secondary = endpoints.filter(
    (endpoint) =>
      !FREE_FIRST_PROVIDER_IDS.has(endpoint.id) &&
      !PAID_RESERVE_PROVIDER_IDS.has(endpoint.id)
  );
  const paidReserve = endpoints.filter((endpoint) => PAID_RESERVE_PROVIDER_IDS.has(endpoint.id));

  return [
    ...rotateEndpoints(free, startIndex),
    ...rotateEndpoints(secondary, startIndex),
    ...rotateEndpoints(paidReserve, startIndex),
  ];
}

function endpointsForRequest(endpoints: AiEndpoint[]): AiEndpoint[] {
  const ordered = orderEndpointsForRouting(endpoints, process.env.AI_ROUTING_MODE, rotationCursor);
  rotationCursor = (rotationCursor + 1) % endpoints.length;
  return ordered;
}

const clients = new Map<string, OpenAI>();
function clientFor(e: AiEndpoint): OpenAI {
  let c = clients.get(e.id);
  if (!c) {
    c = new OpenAI({ apiKey: e.apiKey, baseURL: e.baseURL });
    clients.set(e.id, c);
  }
  return c;
}

function statusOf(err: unknown): string {
  if (err && typeof err === "object" && "status" in err) return String((err as { status: unknown }).status);
  return err instanceof Error ? err.message.slice(0, 80) : "erro";
}

function numericStatus(err: unknown): number | null {
  if (!err || typeof err !== "object" || !("status" in err)) return null;
  const value = Number((err as { status: unknown }).status);
  return Number.isFinite(value) ? value : null;
}

function isRetryable(err: unknown): boolean {
  const status = numericStatus(err);
  return status === null || status === 408 || status === 409 || status === 429 || status >= 500;
}

function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

const DEFAULT_MAX_INPUT_CHARS = 50_000;
const DEFAULT_RESULT_CACHE_TTL_MS = 5 * 60_000;
const DEFAULT_RESULT_CACHE_MAX_ENTRIES = 100;
const TRUNCATION_MARKER = "\n\n[... conteúdo intermediário reduzido para controlar o custo ...]\n\n";

type CachedResult = { value: string; expiresAt: number };
const completedResults = new Map<string, CachedResult>();
const inFlightResults = new Map<string, Promise<string>>();

type TokenPrice = {
  inputPerMillion: number;
  cachedInputPerMillion: number;
  outputPerMillion: number;
};
const TOKEN_PRICES_USD: Record<string, TokenPrice> = {
  "openai:gpt-4.1-nano": {
    inputPerMillion: 0.1,
    cachedInputPerMillion: 0.025,
    outputPerMillion: 0.4,
  },
  "openai:gpt-4.1-mini": {
    inputPerMillion: 0.4,
    cachedInputPerMillion: 0.1,
    outputPerMillion: 1.6,
  },
  "openai:gpt-4o-mini": {
    inputPerMillion: 0.15,
    cachedInputPerMillion: 0.075,
    outputPerMillion: 0.6,
  },
};

export function estimateAiCostUsd(
  provider: string,
  model: string,
  inputTokens: number,
  outputTokens: number,
  cachedInputTokens = 0
): number | null {
  const price = TOKEN_PRICES_USD[`${provider}:${model}`];
  if (!price) return null;
  const cached = Math.min(Math.max(0, cachedInputTokens), Math.max(0, inputTokens));
  const uncached = Math.max(0, inputTokens) - cached;
  return (
    (uncached * price.inputPerMillion +
      cached * price.cachedInputPerMillion +
      Math.max(0, outputTokens) * price.outputPerMillion) /
    1_000_000
  );
}

function boundedEnvNumber(name: string, fallback: number, min: number, max: number): number {
  const configured = Number(process.env[name]);
  if (!Number.isFinite(configured)) return fallback;
  return Math.max(min, Math.min(max, Math.floor(configured)));
}

/**
 * Proteção global contra entradas acidentalmente gigantes. Preserva o começo,
 * onde normalmente estão currículo/edital, e o final, onde ficam instruções e
 * schemas JSON. Limites específicos das ferramentas continuam sendo aplicados
 * antes deste último cinto de segurança.
 */
export function compactAiUserMessage(message: string, maxChars = DEFAULT_MAX_INPUT_CHARS): string {
  if (message.length <= maxChars) return message;
  const usable = Math.max(0, maxChars - TRUNCATION_MARKER.length);
  const headLength = Math.floor(usable * 0.8);
  const tailLength = usable - headLength;
  return `${message.slice(0, headLength)}${TRUNCATION_MARKER}${message.slice(-tailLength)}`;
}

function requestCacheKey(
  endpoints: AiEndpoint[],
  systemPrompt: string,
  userMessage: string,
  temperature: number,
  maxTokens: number
): string {
  return createHash("sha256")
    .update(endpoints.map((endpoint) => `${endpoint.id}:${endpoint.model}`).join("|"))
    .update("\0")
    .update(String(temperature))
    .update("\0")
    .update(String(maxTokens))
    .update("\0")
    .update(systemPrompt)
    .update("\0")
    .update(userMessage)
    .digest("hex");
}

function pruneCompletedResults(now: number, maxEntries: number): void {
  for (const [key, cached] of completedResults) {
    if (cached.expiresAt <= now) completedResults.delete(key);
  }
  while (completedResults.size >= maxEntries) {
    const oldestKey = completedResults.keys().next().value;
    if (!oldestKey) break;
    completedResults.delete(oldestKey);
  }
}

/**
 * Normaliza a resposta para JSON puro. Alguns provedores/modelos ignoram o
 * response_format e devolvem o JSON dentro de cerca de código markdown
 * (```json ... ```) ou com texto ao redor. Remove a cerca e, se ainda houver
 * ruído, recorta do primeiro "{" ao último "}".
 */
function extractJson(raw: string): string {
  let s = raw.trim();
  if (s.startsWith("```")) {
    s = s.replace(/^```(?:json)?\s*/i, "").replace(/\s*```$/, "").trim();
  }
  if (!s.startsWith("{")) {
    const first = s.indexOf("{");
    const last = s.lastIndexOf("}");
    if (first !== -1 && last > first) s = s.slice(first, last + 1);
  }
  return s;
}

/**
 * Executa um prompt JSON tentando os provedores configurados por prioridade
 * (ordem do registro); cai para o próximo em qualquer falha. Retorna o conteúdo
 * bruto (string JSON). Lança se todos falharem ou se nenhum estiver configurado.
 */
export async function runJsonAcrossProviders(
  systemPrompt: string,
  userMessage: string,
  temperature: number,
  maxTokens: number,
  groqModel: string,
  validate?: (value: unknown) => void,
  operation = "other"
): Promise<string> {
  const endpoints = getConfiguredEndpoints(groqModel);
  if (endpoints.length === 0) {
    throw new Error(
      "Nenhum provedor de IA configurado (defina OPENAI_API_KEY, GROQ_API_KEY ou outra chave suportada)."
    );
  }

  // Regra global de estilo: nada de travessão/meia-risca (cara de texto de IA).
  const systemWithStyle = `${systemPrompt}\n\nESTILO: escreva em português natural. Nunca use pontuação em forma de traço longo; use vírgula, ponto, dois-pontos ou parênteses no lugar.`;
  const maxInputChars = boundedEnvNumber(
    "AI_MAX_INPUT_CHARS",
    DEFAULT_MAX_INPUT_CHARS,
    10_000,
    200_000
  );
  const compactedUserMessage = compactAiUserMessage(userMessage, maxInputChars);

  const cacheKey = requestCacheKey(
    endpoints,
    systemWithStyle,
    compactedUserMessage,
    temperature,
    maxTokens
  );
  const now = Date.now();
  const cached = completedResults.get(cacheKey);
  if (cached && cached.expiresAt > now) {
    aiCacheEvents.inc({ operation, result: "hit" });
    console.log("[AI] cache=hit");
    return cached.value;
  }
  if (cached) completedResults.delete(cacheKey);

  const inFlight = inFlightResults.get(cacheKey);
  if (inFlight) {
    aiCacheEvents.inc({ operation, result: "in_flight" });
    console.log("[AI] cache=in-flight");
    return inFlight;
  }
  aiCacheEvents.inc({ operation, result: "miss" });

  const orderedEndpoints = endpointsForRequest(endpoints);
  console.log(`[AI] routing=${process.env.AI_ROUTING_MODE || "free_first"} order=${orderedEndpoints.map((endpoint) => endpoint.id).join(",")}`);

  const requestPromise = (async () => {
    const retries = boundedEnvNumber("AI_MAX_RETRIES", 2, 0, 3);
    const timeout = boundedEnvNumber("AI_REQUEST_TIMEOUT_MS", 45_000, 5_000, 120_000);
    let lastErr: unknown;
    for (const e of orderedEndpoints) {
      for (let attempt = 0; attempt <= retries; attempt++) {
        const t0 = Date.now();
        try {
          const completion = await clientFor(e).chat.completions.create({
            model: e.model,
            temperature,
            max_tokens: maxTokens,
            response_format: { type: "json_object" },
            messages: [
              { role: "system", content: systemWithStyle },
              { role: "user", content: compactedUserMessage },
            ],
          }, { timeout, maxRetries: 0 });

          const choice = completion.choices[0];
          const content = choice?.message?.content;
          if (!content) throw new Error("resposta vazia do provedor");
          if (choice.finish_reason === "length") throw new Error("resposta truncada por max_tokens");
          const json = extractJson(content);
          const parsed: unknown = JSON.parse(json);
          validate?.(parsed);
          const usage = completion.usage;
          const inputTokens = usage?.prompt_tokens ?? 0;
          const outputTokens = usage?.completion_tokens ?? 0;
          const cachedInputTokens = usage?.prompt_tokens_details?.cached_tokens ?? 0;
          aiProviderCalls.inc({ provider: e.id, model: e.model, operation, outcome: "success" });
          aiProviderDuration.observe(
            { provider: e.id, model: e.model, operation, outcome: "success" },
            (Date.now() - t0) / 1000
          );
          if (inputTokens > 0) {
            aiTokensTotal.inc(
              { provider: e.id, model: e.model, operation, direction: "input" },
              inputTokens
            );
          }
          if (outputTokens > 0) {
            aiTokensTotal.inc(
              { provider: e.id, model: e.model, operation, direction: "output" },
              outputTokens
            );
          }
          if (cachedInputTokens > 0) {
            aiTokensTotal.inc(
              { provider: e.id, model: e.model, operation, direction: "cached_input" },
              cachedInputTokens
            );
          }
          const estimatedCost = estimateAiCostUsd(
            e.id,
            e.model,
            inputTokens,
            outputTokens,
            cachedInputTokens
          );
          if (estimatedCost !== null && estimatedCost > 0) {
            aiEstimatedCostUsd.inc({ provider: e.id, model: e.model, operation }, estimatedCost);
          }
          console.log(
            `[AI] ok provider=${e.id} model=${e.model} attempt=${attempt + 1} ms=${Date.now() - t0}` +
            ` input_tokens=${usage?.prompt_tokens ?? "?"} output_tokens=${usage?.completion_tokens ?? "?"}` +
            ` total_tokens=${usage?.total_tokens ?? "?"}`
          );
          return json;
        } catch (err) {
          lastErr = err;
          aiProviderCalls.inc({ provider: e.id, model: e.model, operation, outcome: "error" });
          aiProviderDuration.observe(
            { provider: e.id, model: e.model, operation, outcome: "error" },
            (Date.now() - t0) / 1000
          );
          const retry = attempt < retries && isRetryable(err);
          console.warn(`[AI] falha provider=${e.id} model=${e.model} attempt=${attempt + 1} ms=${Date.now() - t0} status=${statusOf(err)}${retry ? ", repetindo" : ", tentando próximo"}`);
          if (!retry) break;
          await sleep(500 * 2 ** attempt + Math.floor(Math.random() * 250));
        }
      }
    }
    throw lastErr;
  })();

  inFlightResults.set(cacheKey, requestPromise);
  try {
    const result = await requestPromise;
    // Só respostas de baixa temperatura são reutilizadas depois de concluídas.
    // Chamadas criativas continuam protegidas contra duplicidade simultânea,
    // mas uma solicitação posterior pode gerar uma nova variação.
    if (temperature <= 0.3) {
      const ttl = boundedEnvNumber(
        "AI_RESULT_CACHE_TTL_MS",
        DEFAULT_RESULT_CACHE_TTL_MS,
        0,
        60 * 60_000
      );
      const maxEntries = boundedEnvNumber(
        "AI_RESULT_CACHE_MAX_ENTRIES",
        DEFAULT_RESULT_CACHE_MAX_ENTRIES,
        1,
        1_000
      );
      if (ttl > 0) {
        pruneCompletedResults(Date.now(), maxEntries);
        completedResults.set(cacheKey, { value: result, expiresAt: Date.now() + ttl });
      }
    }
    return result;
  } finally {
    inFlightResults.delete(cacheKey);
  }
}
