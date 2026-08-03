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
  /** Ferramentas de estudo/concurso/vestibular que geram conteúdo por IA (simulado,
   * plano de estudo, mapa de prova, nota de corte, etc.) — corresponde à linha
   * "Estudos" da matriz de planos do Plano Mestre (seção 15), como um bucket único
   * em vez de uma key por ferramenta. */
  studyTool: "study.tool.use",
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
  // 1 (não 0): preserva o "experimente de graça uma vez" que já existia via
  // authorizeFreeAiTool antes desta migração — só que agora renova por ciclo em
  // vez de ser 1 única vez pra sempre (mais generoso, não uma regressão de UX).
  [COMMERCIAL_FEATURE_KEYS.interviewComplete]: 1,
  [COMMERCIAL_FEATURE_KEYS.githubAnalysis]: 0,
  [COMMERCIAL_FEATURE_KEYS.universitySubjectInsight]: 0,
  [COMMERCIAL_FEATURE_KEYS.careerGrowthPlan]: 0,
  [COMMERCIAL_FEATURE_KEYS.jobApplications]: 5,
  [COMMERCIAL_FEATURE_KEYS.studyTool]: 10,
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
      [COMMERCIAL_FEATURE_KEYS.studyTool]: 40,
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
      [COMMERCIAL_FEATURE_KEYS.studyTool]: 150,
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
      [COMMERCIAL_FEATURE_KEYS.studyTool]: unlimited,
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
      [COMMERCIAL_FEATURE_KEYS.studyTool]: 40,
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

const FEATURE_LABELS: Record<CommercialFeatureKey, string> = {
  [COMMERCIAL_FEATURE_KEYS.analysisFull]: "análises completas de vaga por mês",
  [COMMERCIAL_FEATURE_KEYS.resumeByJob]: "currículos adaptados por vaga por mês",
  [COMMERCIAL_FEATURE_KEYS.interviewComplete]: "simulados de entrevista completos por mês",
  [COMMERCIAL_FEATURE_KEYS.githubAnalysis]: "análises de perfil GitHub por mês",
  [COMMERCIAL_FEATURE_KEYS.universitySubjectInsight]: "insights de disciplina universitária por mês",
  [COMMERCIAL_FEATURE_KEYS.careerGrowthPlan]: "planos de evolução de carreira por mês",
  [COMMERCIAL_FEATURE_KEYS.jobApplications]: "candidaturas registradas",
  [COMMERCIAL_FEATURE_KEYS.studyTool]: "usos de ferramentas de estudo por mês",
  [COMMERCIAL_FEATURE_KEYS.aiSimpleAction]: "ações rápidas de IA por mês",
};

/** Lista legível do que o plano inclui, derivada dos limites reais (nunca hardcoded por fora do catálogo). */
export function getPlanFeatureList(planKey: string | null | undefined): string[] {
  const plan = getCommercialPlan(planKey);
  return (Object.keys(FEATURE_LABELS) as CommercialFeatureKey[])
    .filter((featureKey) => (plan.limits[featureKey] ?? 0) !== 0)
    .map((featureKey) => {
      const limit = plan.limits[featureKey];
      const quantity = limit === null ? "Ilimitadas" : limit;
      return `${quantity} ${FEATURE_LABELS[featureKey]}`;
    });
}

