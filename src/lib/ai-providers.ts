import OpenAI from "openai";

/**
 * Camada de IA multi-provedor. Todos os provedores abaixo são compatíveis com a
 * API OpenAI (mesmo formato de chat.completions), então usamos um único cliente
 * e só trocamos baseURL / apiKey / model.
 *
 * Um endpoint só entra na rotação se a chave dele estiver setada. A cada
 * requisição a ordem é rotacionada (round-robin) para espalhar o uso entre os
 * provedores — e, se um falhar (limite, erro), a chamada cai para o próximo
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

// Contador de rotação (round-robin) — em memória, por instância. Espalha o
// ponto de partida entre requisições para não sobrecarregar sempre o mesmo.
let rotationCounter = 0;

function statusOf(err: unknown): string {
  if (err && typeof err === "object" && "status" in err) return String((err as { status: unknown }).status);
  return err instanceof Error ? err.message.slice(0, 80) : "erro";
}

/**
 * Executa um prompt JSON tentando os provedores configurados em ordem
 * rotacionada; cai para o próximo em qualquer falha. Retorna o conteúdo bruto
 * (string JSON). Lança se todos falharem ou se nenhum provedor estiver configurado.
 */
export async function runJsonAcrossProviders(
  systemPrompt: string,
  userMessage: string,
  temperature: number,
  maxTokens: number,
  groqModel: string
): Promise<string> {
  const endpoints = getConfiguredEndpoints(groqModel);
  if (endpoints.length === 0) {
    throw new Error("Nenhum provedor de IA configurado (defina ao menos GROQ_API_KEY).");
  }

  const start = rotationCounter++ % endpoints.length;
  const ordered = [...endpoints.slice(start), ...endpoints.slice(0, start)];

  let lastErr: unknown;
  for (const e of ordered) {
    const t0 = Date.now();
    try {
      const completion = await clientFor(e).chat.completions.create({
        model: e.model,
        temperature,
        max_tokens: maxTokens,
        response_format: { type: "json_object" },
        messages: [
          { role: "system", content: systemPrompt },
          { role: "user", content: userMessage },
        ],
      });

      const choice = completion.choices[0];
      const content = choice?.message?.content;
      if (!content) throw new Error("resposta vazia do provedor");
      if (choice.finish_reason === "length") {
        console.error(`[AI] ${e.id}/${e.model} resposta truncada por max_tokens; campos podem faltar.`);
      }
      console.log(`[AI] ok provider=${e.id} model=${e.model} ms=${Date.now() - t0}`);
      return content;
    } catch (err) {
      lastErr = err;
      console.warn(`[AI] falha provider=${e.id} model=${e.model} ms=${Date.now() - t0} status=${statusOf(err)} — tentando próximo`);
      continue;
    }
  }
  throw lastErr;
}
