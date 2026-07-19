import { afterEach, describe, expect, it } from "vitest";

import {
  compactAiUserMessage,
  dailyTokenBudget,
  estimateAiCostUsd,
  filterAvailableEndpoints,
  isProviderAvailable,
  markProviderCooldown,
  orderEndpointsForRouting,
  recordProviderUsage,
  retryAfterMs,
  rotateEndpoints,
  utcDayKey,
  type AiEndpoint,
} from "@/lib/ai-providers";

describe("compactAiUserMessage", () => {
  it("preserva mensagens dentro do limite", () => {
    expect(compactAiUserMessage("currículo curto", 100)).toBe("currículo curto");
  });

  it("limita entradas gigantes preservando começo e instruções finais", () => {
    const message = `INÍCIO-${"a".repeat(500)}-${"b".repeat(500)}-SCHEMA-FINAL`;
    const compacted = compactAiUserMessage(message, 300);

    expect(compacted.length).toBe(300);
    expect(compacted.startsWith("INÍCIO-")).toBe(true);
    expect(compacted.endsWith("SCHEMA-FINAL")).toBe(true);
    expect(compacted).toContain("conteúdo intermediário reduzido");
  });
});

describe("estimateAiCostUsd", () => {
  it("calcula custo do gpt-4.1-nano por tokens de entrada e saída", () => {
    expect(estimateAiCostUsd("openai", "gpt-4.1-nano", 1_000_000, 1_000_000))
      .toBeCloseTo(0.5);
  });

  it("aplica o preço reduzido aos tokens de entrada em cache", () => {
    expect(estimateAiCostUsd("openai", "gpt-4.1-nano", 1_000_000, 0, 1_000_000))
      .toBeCloseTo(0.025);
  });

  it("retorna null para preço desconhecido em vez de inventar custo", () => {
    expect(estimateAiCostUsd("groq", "modelo-desconhecido", 1000, 1000)).toBeNull();
  });
});

describe("rotateEndpoints", () => {
  const endpoints = ["groq", "gemini", "openai"].map((id) => ({
    id,
    label: id,
    baseURL: `https://${id}.example`,
    apiKey: "test",
    model: "test-model",
  })) satisfies AiEndpoint[];

  it("alterna o provedor inicial preservando todos como fallback", () => {
    expect(rotateEndpoints(endpoints, 0).map((endpoint) => endpoint.id))
      .toEqual(["groq", "gemini", "openai"]);
    expect(rotateEndpoints(endpoints, 1).map((endpoint) => endpoint.id))
      .toEqual(["gemini", "openai", "groq"]);
    expect(rotateEndpoints(endpoints, 2).map((endpoint) => endpoint.id))
      .toEqual(["openai", "groq", "gemini"]);
  });

  it("normaliza índices acima do tamanho da lista", () => {
    expect(rotateEndpoints(endpoints, 4).map((endpoint) => endpoint.id))
      .toEqual(["gemini", "openai", "groq"]);
  });
});

describe("orderEndpointsForRouting", () => {
  const endpoint = (id: string): AiEndpoint => ({
    id,
    label: id,
    baseURL: `https://${id}.example`,
    apiKey: "test",
    model: "test-model",
  });
  const endpoints = [
    endpoint("groq"),
    endpoint("cerebras"),
    endpoint("gemini"),
    endpoint("openai"),
    endpoint("together"),
    endpoint("deepinfra"),
  ];

  it("rotaciona cotas gratuitas e deixa OpenAI paga por último no modo free_first", () => {
    expect(orderEndpointsForRouting(endpoints, "free_first", 1).map((item) => item.id))
      .toEqual(["cerebras", "gemini", "groq", "deepinfra", "together", "openai"]);
  });

  it("mantém round_robin completo quando solicitado", () => {
    expect(orderEndpointsForRouting(endpoints, "round_robin", 1).map((item) => item.id))
      .toEqual(["cerebras", "gemini", "openai", "together", "deepinfra", "groq"]);
  });

  it("mantém ordem fixa quando solicitado", () => {
    expect(orderEndpointsForRouting(endpoints, "priority", 3).map((item) => item.id))
      .toEqual(endpoints.map((item) => item.id));
  });
});

describe("disponibilidade por provedor", () => {
  const now = Date.UTC(2026, 6, 19, 12, 0, 0);
  const endpoint = (id: string): AiEndpoint => ({
    id,
    label: id,
    baseURL: `https://${id}.example`,
    apiKey: "test",
    model: "test-model",
  });

  afterEach(() => {
    delete process.env.AI_DAILY_TOKEN_BUDGET;
    delete process.env.AI_DAILY_TOKEN_BUDGET_GROQ;
  });

  it("trata orçamento diário: específico > global > ilimitado", () => {
    expect(dailyTokenBudget("groq")).toBe(0);
    process.env.AI_DAILY_TOKEN_BUDGET = "1000";
    expect(dailyTokenBudget("groq")).toBe(1000);
    process.env.AI_DAILY_TOKEN_BUDGET_GROQ = "5000";
    expect(dailyTokenBudget("groq")).toBe(5000);
  });

  it("marca indisponível quando o consumo diário atinge o orçamento", () => {
    process.env.AI_DAILY_TOKEN_BUDGET_GROQ = "100";
    expect(isProviderAvailable("groq", now)).toBe(true);
    recordProviderUsage("groq", 100, now);
    expect(isProviderAvailable("groq", now)).toBe(false);
    // O consumo zera na virada do dia UTC.
    const nextDay = now + 24 * 60 * 60_000;
    expect(isProviderAvailable("groq", nextDay)).toBe(true);
  });

  it("mantém a reserva paga (openai) sempre disponível como rede de segurança", () => {
    process.env.AI_DAILY_TOKEN_BUDGET = "10";
    recordProviderUsage("openai", 999_999, now);
    markProviderCooldown("openai", 60 * 60_000, now);
    expect(isProviderAvailable("openai", now)).toBe(true);
    const endpoints = [endpoint("openai")];
    expect(filterAvailableEndpoints(endpoints, now).map((e) => e.id)).toEqual(["openai"]);
  });

  it("pausa o provedor durante o cooldown de um 429", () => {
    markProviderCooldown("cerebras", 60_000, now);
    expect(isProviderAvailable("cerebras", now + 30_000)).toBe(false);
    expect(isProviderAvailable("cerebras", now + 61_000)).toBe(true);
  });

  it("remove indisponíveis mas volta à lista original se todos caírem", () => {
    process.env.AI_DAILY_TOKEN_BUDGET_GROQ = "10";
    recordProviderUsage("groq", 10, now);
    const endpoints = [endpoint("groq"), endpoint("gemini")];
    expect(filterAvailableEndpoints(endpoints, now).map((e) => e.id)).toEqual(["gemini"]);

    markProviderCooldown("gemini", 60_000, now);
    expect(filterAvailableEndpoints(endpoints, now).map((e) => e.id)).toEqual(["groq", "gemini"]);
  });

  it("lê retry-after (segundos) e retry-after-ms dos headers do erro", () => {
    expect(retryAfterMs({ headers: { "retry-after": "2" } })).toBe(2000);
    expect(retryAfterMs({ headers: { "retry-after-ms": "500" } })).toBe(500);
    expect(retryAfterMs({ headers: new Headers({ "retry-after": "3" }) })).toBe(3000);
    expect(retryAfterMs({ status: 429 })).toBeNull();
  });

  it("gera chave de dia UTC estável", () => {
    expect(utcDayKey(now)).toBe("2026-07-19");
  });
});
