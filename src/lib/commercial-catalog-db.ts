import { prisma } from "@/lib/prisma";
import {
  COMMERCIAL_FEATURE_KEYS,
  COMMERCIAL_PLANS,
  type CommercialFeatureKey,
  type CommercialPlanKey,
} from "@/lib/commercial-plan-catalog";

const FEATURE_NAMES: Record<CommercialFeatureKey, string> = {
  [COMMERCIAL_FEATURE_KEYS.aiSimpleAction]: "Ações simples de IA",
  [COMMERCIAL_FEATURE_KEYS.analysisFull]: "Análises completas",
  [COMMERCIAL_FEATURE_KEYS.resumeByJob]: "Currículo por vaga",
  [COMMERCIAL_FEATURE_KEYS.interviewComplete]: "Entrevistas completas",
  [COMMERCIAL_FEATURE_KEYS.githubAnalysis]: "Análise de GitHub",
  [COMMERCIAL_FEATURE_KEYS.universitySubjectInsight]: "Insight de disciplina",
  [COMMERCIAL_FEATURE_KEYS.careerGrowthPlan]: "Plano de crescimento profissional",
  [COMMERCIAL_FEATURE_KEYS.jobApplications]: "Candidaturas",
  [COMMERCIAL_FEATURE_KEYS.studyTool]: "Ferramentas de estudo",
};

let catalogReady: Promise<void> | undefined;

/** Sincroniza o catálogo versionado em código para as tabelas operacionais. */
export function ensureCommercialCatalog(): Promise<void> {
  catalogReady ??= syncCommercialCatalog().catch((error) => {
    catalogReady = undefined;
    throw error;
  });
  return catalogReady;
}

async function syncCommercialCatalog() {
  const features = await Promise.all(
    Object.entries(FEATURE_NAMES).map(([key, name]) =>
      prisma.featureDefinition.upsert({ where: { key }, create: { key, name }, update: { name, active: true } }),
    ),
  );
  const featureByKey = new Map(features.map((feature) => [feature.key, feature.id]));

  for (const plan of Object.values(COMMERCIAL_PLANS)) {
    const persisted = await prisma.plan.upsert({
      where: { key: plan.key },
      create: {
        key: plan.key,
        name: plan.name,
        priceCents: plan.priceCents,
        recurring: plan.recurring,
        durationDays: plan.durationDays,
        highlighted: plan.highlighted ?? false,
      },
      update: {
        name: plan.name,
        priceCents: plan.priceCents,
        recurring: plan.recurring,
        durationDays: plan.durationDays,
        highlighted: plan.highlighted ?? false,
        active: true,
      },
    });

    for (const [featureKey, limit] of Object.entries(plan.limits)) {
      const featureDefinitionId = featureByKey.get(featureKey);
      if (!featureDefinitionId) continue;
      await prisma.planEntitlement.upsert({
        where: { planId_featureDefinitionId: { planId: persisted.id, featureDefinitionId } },
        create: { planId: persisted.id, featureDefinitionId, limit },
        update: { limit, active: true },
      });
    }
  }
}

export async function getPersistedFeatureLimit(planKey: CommercialPlanKey, featureKey: CommercialFeatureKey) {
  await ensureCommercialCatalog();
  const entitlement = await prisma.planEntitlement.findFirst({
    where: { plan: { key: planKey, active: true }, featureDefinition: { key: featureKey, active: true }, active: true },
    select: { limit: true },
  });
  return entitlement?.limit ?? COMMERCIAL_PLANS[planKey].limits[featureKey];
}
