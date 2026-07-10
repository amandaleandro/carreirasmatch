import { describe, expect, it } from "vitest";
import { toAnalysisTeaser } from "@/lib/analysis-teaser";
import type { Analysis } from "@/components/analysis-display";

function makeAnalysis(overrides: Partial<Analysis> = {}): Analysis {
  return {
    overallScore: 80,
    technicalScore: 70,
    experienceScore: 75,
    seniorityScore: 60,
    atsScore: 90,
    applicationStatus: "apply_now",
    applicationStatusReason: "Boa aderência.",
    keywordsFound: ["react", "typescript"],
    keywordsMissing: ["docker"],
    suggestedSummary: "Resumo sugerido.",
    strengths: ["A", "B", "C", "D"],
    weaknesses: ["W1", "W2", "W3", "W4"],
    fixes: ["fix1"],
    interviewQuestions: ["q1"],
    studyPlan: { essential: [], niceToHave: [], later: [] },
    recruiterMessage: "Mensagem para recrutador.",
    alternativeRoles: [],
    ...overrides,
  };
}

describe("toAnalysisTeaser", () => {
  it("only exposes the teaser fields", () => {
    const teaser = toAnalysisTeaser(makeAnalysis());
    expect(Object.keys(teaser).sort()).toEqual(
      [
        "overallScore",
        "atsScore",
        "applicationStatus",
        "applicationStatusReason",
        "keywordsFound",
        "keywordsMissing",
        "strengths",
        "weaknesses",
      ].sort()
    );
  });

  it("does not leak paid-only fields like suggestedSummary or recruiterMessage", () => {
    const teaser = toAnalysisTeaser(makeAnalysis());
    expect(teaser).not.toHaveProperty("suggestedSummary");
    expect(teaser).not.toHaveProperty("recruiterMessage");
    expect(teaser).not.toHaveProperty("fixes");
  });

  it("truncates strengths and weaknesses to at most 3 items", () => {
    const teaser = toAnalysisTeaser(makeAnalysis());
    expect(teaser.strengths).toHaveLength(3);
    expect(teaser.weaknesses).toHaveLength(3);
    expect(teaser.strengths).toEqual(["A", "B", "C"]);
  });

  it("keeps fewer than 3 items unchanged", () => {
    const teaser = toAnalysisTeaser(makeAnalysis({ strengths: ["only-one"] }));
    expect(teaser.strengths).toEqual(["only-one"]);
  });
});
