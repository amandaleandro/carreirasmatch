import { describe, expect, it } from "vitest";

import {
  compactAiUserMessage,
  estimateAiCostUsd,
  orderEndpointsForRouting,
  rotateEndpoints,
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
