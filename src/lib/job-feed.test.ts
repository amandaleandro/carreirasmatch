import { describe, expect, it } from "vitest";
import { applyProfileAlignment } from "./job-feed";

function baseMatch(overrides: Partial<{ fitScore: number; area: string; jobTitle: string; jobText: string; subarea: string }> = {}) {
  return {
    fitScore: overrides.fitScore ?? 90,
    reason: "IA achou o texto parecido.",
    job: {
      jobTitle: overrides.jobTitle ?? "SDR - Sales Development Representative",
      jobText: overrides.jobText ?? "Prospecção ativa, cold call, qualificação de leads.",
      area: overrides.area ?? "Vendas",
      subarea: overrides.subarea ?? "",
    },
  };
}

describe("applyProfileAlignment", () => {
  it("derruba forte uma vaga de Vendas/SDR pra um perfil de Tecnologia, mesmo com nota alta da IA", () => {
    const result = applyProfileAlignment(baseMatch({ fitScore: 90 }), {
      areas: ["Tecnologia"],
      roles: ["DevOps/SRE"],
    });
    expect(result.fitScore).toBeLessThan(60);
  });

  it("não trata vaga genérica de atendimento ao cliente (área 'TI & Suporte') como TI de verdade", () => {
    const result = applyProfileAlignment(
      baseMatch({
        fitScore: 85,
        area: "TI & Suporte",
        jobTitle: "Atendente de Call Center",
        jobText: "Atendimento ao cliente via telefone e chat, sem exigência técnica.",
      }),
      { areas: ["Tecnologia"], roles: ["DevOps/SRE"] }
    );
    // Sem sinal de área confiável pro atendimento genérico, a nota fica neutra
    // (não é mais tratada como garantidamente alinhada à área do perfil).
    expect(result.fitScore).toBeLessThan(78);
  });

  it("mantém vaga de suporte técnico de TI de verdade alinhada a um perfil de Tecnologia", () => {
    const result = applyProfileAlignment(
      baseMatch({
        fitScore: 85,
        area: "TI & Suporte",
        jobTitle: "Analista de Suporte Técnico N2",
        jobText: "Suporte técnico de infraestrutura de TI, service desk, administrador de rede.",
      }),
      { areas: ["Tecnologia"], roles: [] }
    );
    expect(result.fitScore).toBeGreaterThanOrEqual(78);
  });

  it("sem área/cargo no perfil, não mexe na nota", () => {
    const match = baseMatch({ fitScore: 77 });
    const result = applyProfileAlignment(match, { areas: [], roles: [] });
    expect(result.fitScore).toBe(77);
  });
});
