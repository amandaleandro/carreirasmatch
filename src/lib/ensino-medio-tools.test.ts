import { describe, it, expect } from "vitest";

describe("Ensino Médio Tools Types & Structure", () => {
  it("should validate evaluation structure expectations", () => {
    const mockCompetencies = [
      { number: 1, name: "Norma Culta", score: 160, feedback: "Muito bom" },
      { number: 2, name: "Repertório", score: 160, feedback: "Excelente" },
      { number: 3, name: "Argumentação", score: 160, feedback: "Coerente" },
      { number: 4, name: "Coesão", score: 160, feedback: "Bons conectivos" },
      { number: 5, name: "Proposta", score: 200, feedback: "Completa" },
    ];
    const total = mockCompetencies.reduce((acc, c) => acc + c.score, 0);
    expect(total).toBe(840);
  });
});
