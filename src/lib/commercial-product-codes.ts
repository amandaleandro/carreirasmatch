const AVULSO_PRODUCT_CODE_BY_PLAN_KEY: Record<string, { monthly: string; annual: string }> = {
  essential: { monthly: "plan.essential.monthly", annual: "plan.essential.annual" },
  pro: { monthly: "plan.pro.monthly", annual: "plan.pro.annual" },
  complete: { monthly: "plan.complete.monthly", annual: "plan.complete.annual" },
};

export function avulsoProductCode(planKey: string, cycle: "monthly" | "annual"): string {
  const codes = AVULSO_PRODUCT_CODE_BY_PLAN_KEY[planKey] ?? AVULSO_PRODUCT_CODE_BY_PLAN_KEY.pro;
  return codes[cycle];
}
