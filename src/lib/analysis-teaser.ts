import type { Analysis } from "@/components/analysis-display";

export type AnalysisTeaser = Pick<
  Analysis,
  | "overallScore"
  | "atsScore"
  | "applicationStatus"
  | "applicationStatusReason"
  | "keywordsFound"
  | "keywordsMissing"
  | "strengths"
  | "weaknesses"
>;

export function toAnalysisTeaser(analysis: Analysis): AnalysisTeaser {
  return {
    overallScore: analysis.overallScore,
    atsScore: analysis.atsScore,
    applicationStatus: analysis.applicationStatus,
    applicationStatusReason: analysis.applicationStatusReason,
    keywordsFound: analysis.keywordsFound,
    keywordsMissing: analysis.keywordsMissing,
    strengths: analysis.strengths.slice(0, 3),
    weaknesses: analysis.weaknesses.slice(0, 3),
  };
}
