import { z } from "zod";

const text = z.string().trim().min(1);
const textArray = z.array(text);
const score = z.number().int().min(0).max(100);

export const resumeAnalysisSchema = z.object({
  overallScore: score, technicalScore: score, experienceScore: score,
  seniorityScore: score, atsScore: score,
  applicationStatus: z.enum(["apply_now", "adjust_first", "deprioritize"]),
  applicationStatusReason: text,
  keywordsFound: textArray, keywordsMissing: textArray,
  suggestedSummary: text, currentSummary: text,
  strengths: textArray.min(1), weaknesses: textArray.min(1), fixes: textArray.min(1),
  interviewQuestions: textArray.min(1),
  studyPlan: z.object({ essential: textArray, niceToHave: textArray, later: textArray }),
  recruiterMessage: text,
  alternativeRoles: textArray,
  experienceSuggestions: z.array(z.object({
    role: z.string(), company: z.string(), current: z.string(), suggested: z.string(),
  })),
  atsChecklist: z.array(z.object({
    key: z.enum(["formatting", "clarity", "keywords", "results", "seniority", "links"]),
    label: text, description: text, status: z.enum(["pass", "warning", "fail"]),
  })).length(6),
}).passthrough();

export const structuredResumeSchema = z.object({
  contact: z.object({
    name: z.string(), email: z.string(), phone: z.string(), location: z.string(),
    linkedin: z.string(), github: z.string(), portfolio: z.string(),
  }),
  education: z.array(z.object({ institution: z.string(), degree: z.string(), period: z.string() })),
  skills: z.array(z.string()),
  languages: z.array(z.object({ language: z.string(), level: z.string() })),
  certifications: z.array(z.string()),
  experiences: z.array(z.object({
    role: z.string(), company: z.string(), period: z.string(), description: z.string(),
  })),
});

export const profileSuggestionsSchema = z.object({
  suggestions: z.array(z.object({
    type: z.enum(["course", "certification", "book"]), title: text, provider: text,
    priceLabel: text, impactScore: score, impactReason: text, url: z.string().optional(),
    // Qual lacuna/objetivo específico o item resolve (para explicar o porquê ao usuário).
    gapAddressed: z.string().optional(),
    // Só faz sentido para "course": "online" | "presencial" | "híbrido". Livre para a IA omitir.
    modality: z.string().optional(),
  })).min(1),
});
