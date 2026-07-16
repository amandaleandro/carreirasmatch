import OpenAI from "openai";

/**
 * Camada de IA multi-provedor. Todos os provedores abaixo são compatíveis com a
 * API OpenAI (mesmo formato de chat.completions), então usamos um único cliente
 * e só trocamos baseURL / apiKey / model.
 *
 * Um endpoint só entra na fila se a chave dele estiver setada. Os provedores são
 * tentados por PRIORIDADE (a ordem do registro abaixo, Groq primeiro por ser o
 * mais rápido); se um falhar (limite, erro), a chamada cai para o próximo
 * automaticamente. Cada resultado é logado com provedor/modelo/tempo para dar
 * pra comparar qual é o melhor.
 *
 * Para ligar um provedor, basta definir a chave (e, opcional, o modelo) no .env:
 *   GROQ_API_KEY, CEREBRAS_API_KEY, GEMINI_API_KEY, TOGETHER_API_KEY,
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
      model: process.env.CEREBRAS_MODEL || "llama-3.3-70b",
    },
    {
      id: "gemini",
      label: "Gemini",
      baseURL: "https://generativelanguage.googleapis.com/v1beta/openai/",
      apiKey: process.env.GEMINI_API_KEY,
      model: process.env.GEMINI_MODEL || "gemini-2.0-flash",
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
  validate?: (value: unknown) => void
): Promise<string> {
  const endpoints = getConfiguredEndpoints(groqModel);
  if (endpoints.length === 0) {
    throw new Error("Nenhum provedor de IA configurado (defina ao menos GROQ_API_KEY).");
  }

  // Regra global de estilo: nada de travessão/meia-risca (cara de texto de IA).
  const systemWithStyle = `${systemPrompt}\n\nESTILO: escreva em português natural. Nunca use pontuação em forma de traço longo; use vírgula, ponto, dois-pontos ou parênteses no lugar.`;

  // Prioridade: tenta sempre na ordem do registro (Groq primeiro, que é o mais
  // rápido) e só cai para o próximo provedor se o atual falhar.
  const ordered = endpoints;

  const retries = Math.max(0, Math.min(3, Number(process.env.AI_MAX_RETRIES ?? 2) || 0));
  const timeout = Math.max(5_000, Number(process.env.AI_REQUEST_TIMEOUT_MS ?? 45_000) || 45_000);
  let lastErr: unknown;
  for (const e of ordered) {
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
            { role: "user", content: userMessage },
          ],
        }, { timeout, maxRetries: 0 });

        const choice = completion.choices[0];
        const content = choice?.message?.content;
        if (!content) throw new Error("resposta vazia do provedor");
        if (choice.finish_reason === "length") throw new Error("resposta truncada por max_tokens");
        const json = extractJson(content);
        const parsed: unknown = JSON.parse(json);
        validate?.(parsed);
        console.log(`[AI] ok provider=${e.id} model=${e.model} attempt=${attempt + 1} ms=${Date.now() - t0}`);
        return json;
      } catch (err) {
        lastErr = err;
        const retry = attempt < retries && isRetryable(err);
        console.warn(`[AI] falha provider=${e.id} model=${e.model} attempt=${attempt + 1} ms=${Date.now() - t0} status=${statusOf(err)}${retry ? ", repetindo" : ", tentando próximo"}`);
        if (!retry) break;
        await sleep(500 * 2 ** attempt + Math.floor(Math.random() * 250));
      }
    }
  }
  throw lastErr;
}
