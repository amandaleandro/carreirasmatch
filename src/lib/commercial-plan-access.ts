import {
  getCommercialPlan,
  getFeatureLimit,
  type CommercialFeatureKey,
  type CommercialPlanKey,
  type PlanLimit,
} from "@/lib/commercial-plan-catalog";

export type FeatureAccessDecision = {
  allowed: boolean;
  limit: PlanLimit;
  used: number;
  requested: number;
  remaining: PlanLimit;
  reason: "allowed" | "invalid_quantity" | "limit_reached";
};

/**
 * Decide acesso sem efeitos colaterais. O serviço transacional de consumo deve
 * chamar esta função depois de ler o UsageRecord e antes de reservar o uso.
 */
export function decideFeatureAccess(
  planKey: CommercialPlanKey | string | null | undefined,
  featureKey: CommercialFeatureKey,
  used: number,
  requested = 1,
): FeatureAccessDecision {
  const limit = getFeatureLimit(planKey, featureKey);
  const safeUsed = Number.isFinite(used) && used >= 0 ? Math.floor(used) : 0;
  const safeRequested = Number.isFinite(requested) ? Math.floor(requested) : 0;

  if (safeRequested < 1) {
    return {
      allowed: false,
      limit,
      used: safeUsed,
      requested: safeRequested,
      remaining: limit === null ? null : Math.max(0, limit - safeUsed),
      reason: "invalid_quantity",
    };
  }

  if (limit === null) {
    return {
      allowed: true,
      limit,
      used: safeUsed,
      requested: safeRequested,
      remaining: null,
      reason: "allowed",
    };
  }

  const remaining = Math.max(0, limit - safeUsed);
  const allowed = safeUsed + safeRequested <= limit;
  return {
    allowed,
    limit,
    used: safeUsed,
    requested: safeRequested,
    remaining,
    reason: allowed ? "allowed" : "limit_reached",
  };
}

export function planHasFeature(
  planKey: CommercialPlanKey | string | null | undefined,
  featureKey: CommercialFeatureKey,
): boolean {
  return getCommercialPlan(planKey).limits[featureKey] !== 0;
}

