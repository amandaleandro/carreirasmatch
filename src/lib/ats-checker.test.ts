import { describe, expect, it, vi } from "vitest";
import { analyzeAtsStandalone } from "@/lib/ats-checker";
import * as groqModule from "@/lib/groq";

describe("ats-checker", () => {
  it("executes analyzeAtsStandalone and attaches extractedTextPreview", async () => {
    const mockResponse = {
      atsReadabilityScore: 85,
      resumeQualityScore: 78,
      summary: "Currículo com boa legibilidade e estrutura clara.",
      detectedContactInfo: {
        name: "Amanda Carmo",
        email: "amanda@example.com",
        phone: "(11) 99999-9999",
        location: "São Paulo, SP",
        linkedin: "linkedin.com/in/amanda",
        experiencesCount: 3,
        skillsCount: 12,
      },
      formattingIssues: [
        {
          severity: "warning" as const,
          title: "Uso de duas colunas",
          description: "O layout utiliza duas colunas que podem confundir robôs antigos.",
          suggestion: "Utilize layout de coluna única.",
        },
      ],
      qualityFixes: [
        {
          category: "verbs" as const,
          issue: "Verbos no passivo",
          action: "Substitua por verbos de ação na primeira pessoa ou infinitivo.",
          example: "Liderei a migração de servidores.",
        },
      ],
      atsChecklist: [
        {
          key: "formatting",
          label: "Formatação",
          status: "pass" as const,
          description: "Estrutura limpa e legível.",
        },
      ],
      actionPlan: ["Ajustar layout para coluna única", "Adicionar métricas nas experiências"],
    };

    vi.spyOn(groqModule, "runJsonPrompt").mockResolvedValueOnce(mockResponse);

    const resumeText = "Amanda Carmo\nEngenheira DevOps\nExperiência em AWS e Docker.";
    const result = await analyzeAtsStandalone(resumeText);

    expect(result.atsReadabilityScore).toBe(85);
    expect(result.resumeQualityScore).toBe(78);
    expect(result.detectedContactInfo.name).toBe("Amanda Carmo");
    expect(result.extractedTextPreview).toBe(resumeText);
  });
});
