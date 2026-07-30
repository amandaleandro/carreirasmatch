/**
 * Catálogo comercial inicial do Plano Mestre 2026.
 *
 * Este arquivo descreve a regra de produto em um único lugar. A autorização
 * efetiva ainda deve ser aplicada no backend por PlanEntitlement/UsageRecord;
 * componentes não devem transformar esses valores em regras próprias.
 */

export const COMMERCIAL_PLAN_KEYS = ["free", "essential", "pro", "complete", "sprint"] as const;
export type CommercialPlanKey = (typeof COMMERCIAL_PLAN_KEYS)[number];

export const COMMERCIAL_FEATURE_KEYS = {
  aiSimpleAction: "ai.simple_action",
  analysisFull: "analysis.job.full",
  resumeByJob: "resume.by_job",
  interviewComplete: "interview.complete",
  githubAnalysis: "profile.github.analysis",
  universitySubjectInsight: "university.subject.insight",
  careerGrowthPlan: "career.growth.plan.generate",
  jobApplications: "job.application.create",
} as const;

export type CommercialFeatureKey = (typeof COMMERCIAL_FEATURE_KEYS)[keyof typeof COMMERCIAL_FEATURE_KEYS];

export type PlanLimit = number | null;

export type CommercialPlan = {
  key: CommercialPlanKey;
  name: string;
  priceCents: number;
  recurring: boolean;
  highlighted?: boolean;
  durationDays?: number;
  limits: Record<CommercialFeatureKey, PlanLimit>;
};

const unlimited = null;

const baseLimits = {
  [COMMERCIAL_FEATURE_KEYS.aiSimpleAction]: 5,
  [COMMERCIAL_FEATURE_KEYS.analysisFull]: 0,
  [COMMERCIAL_FEATURE_KEYS.resumeByJob]: 0,
  [COMMERCIAL_FEATURE_KEYS.interviewComplete]: 0,
  [COMMERCIAL_FEATURE_KEYS.githubAnalysis]: 0,
  [COMMERCIAL_FEATURE_KEYS.universitySubjectInsight]: 0,
  [COMMERCIAL_FEATURE_KEYS.careerGrowthPlan]: 0,
  [COMMERCIAL_FEATURE_KEYS.jobApplications]: 5,
} satisfies Record<CommercialFeatureKey, PlanLimit>;

export const COMMERCIAL_PLANS: Record<CommercialPlanKey, CommercialPlan> = {
  free: {
    key: "free",
    name: "Gratuito",
    priceCents: 0,
    recurring: false,
    limits: baseLimits,
  },
  essential: {
    key: "essential",
    name: "Essencial",
    priceCents: 1490,
    recurring: true,
    limits: {
      ...baseLimits,
      [COMMERCIAL_FEATURE_KEYS.aiSimpleAction]: 30,
      [COMMERCIAL_FEATURE_KEYS.analysisFull]: 5,
      [COMMERCIAL_FEATURE_KEYS.resumeByJob]: 2,
      [COMMERCIAL_FEATURE_KEYS.interviewComplete]: 2,
      [COMMERCIAL_FEATURE_KEYS.universitySubjectInsight]: 2,
      [COMMERCIAL_FEATURE_KEYS.careerGrowthPlan]: 1,
      [COMMERCIAL_FEATURE_KEYS.jobApplications]: unlimited,
    },
  },
  pro: {
    key: "pro",
    name: "Pro",
    priceCents: 2990,
    recurring: true,
    highlighted: true,
    limits: {
      ...baseLimits,
      [COMMERCIAL_FEATURE_KEYS.aiSimpleAction]: 120,
      [COMMERCIAL_FEATURE_KEYS.analysisFull]: 20,
      [COMMERCIAL_FEATURE_KEYS.resumeByJob]: 15,
      [COMMERCIAL_FEATURE_KEYS.interviewComplete]: 10,
      [COMMERCIAL_FEATURE_KEYS.githubAnalysis]: 10,
      [COMMERCIAL_FEATURE_KEYS.universitySubjectInsight]: 10,
      [COMMERCIAL_FEATURE_KEYS.careerGrowthPlan]: 3,
      [COMMERCIAL_FEATURE_KEYS.jobApplications]: unlimited,
    },
  },
  complete: {
    key: "complete",
    name: "Completo",
    priceCents: 4990,
    recurring: true,
    limits: {
      ...baseLimits,
      [COMMERCIAL_FEATURE_KEYS.aiSimpleAction]: 300,
      [COMMERCIAL_FEATURE_KEYS.analysisFull]: 50,
      [COMMERCIAL_FEATURE_KEYS.resumeByJob]: 40,
      [COMMERCIAL_FEATURE_KEYS.interviewComplete]: 25,
      [COMMERCIAL_FEATURE_KEYS.githubAnalysis]: 25,
      [COMMERCIAL_FEATURE_KEYS.universitySubjectInsight]: 25,
      [COMMERCIAL_FEATURE_KEYS.careerGrowthPlan]: 10,
      [COMMERCIAL_FEATURE_KEYS.jobApplications]: unlimited,
    },
  },
  sprint: {
    key: "sprint",
    name: "Sprint 7 dias",
    priceCents: 1490,
    recurring: false,
    durationDays: 7,
    limits: {
      ...baseLimits,
      [COMMERCIAL_FEATURE_KEYS.aiSimpleAction]: 30,
      [COMMERCIAL_FEATURE_KEYS.analysisFull]: 5,
      [COMMERCIAL_FEATURE_KEYS.resumeByJob]: 5,
      [COMMERCIAL_FEATURE_KEYS.interviewComplete]: 3,
      [COMMERCIAL_FEATURE_KEYS.universitySubjectInsight]: 3,
      [COMMERCIAL_FEATURE_KEYS.careerGrowthPlan]: 1,
      [COMMERCIAL_FEATURE_KEYS.jobApplications]: unlimited,
    },
  },
};

export function getCommercialPlan(key: string | null | undefined): CommercialPlan {
  if (key && key in COMMERCIAL_PLANS) return COMMERCIAL_PLANS[key as CommercialPlanKey];
  return COMMERCIAL_PLANS.free;
}

export function getFeatureLimit(planKey: string | null | undefined, featureKey: CommercialFeatureKey): PlanLimit {
  return getCommercialPlan(planKey).limits[featureKey];
}

