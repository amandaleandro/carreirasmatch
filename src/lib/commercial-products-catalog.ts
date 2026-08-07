export const COMMERCIAL_PRODUCTS = {
  firstAnalysis: { code: "analysis.first", name: "Primeira análise", kind: "first_analysis", priceCents: 4900 },
  fullAnalysis: { code: "analysis.full", name: "Plano de Candidatura", kind: "diagnostic", priceCents: 990 },
  analysisCredits: { code: "credits.analysis.5", name: "5 análises completas", kind: "credit_pack", priceCents: 3990, creditType: "analysis.job.full", creditQuantity: 5 },
  essentialMonthly: { code: "plan.essential.monthly", name: "Essencial mensal (30 dias)", kind: "subscription_monthly", priceCents: 1490 },
  essentialAnnual: { code: "plan.essential.annual", name: "Essencial anual (365 dias)", kind: "subscription_annual", priceCents: 14900 },
  proMonthly: { code: "plan.pro.monthly", name: "Pro mensal (30 dias)", kind: "subscription_monthly", priceCents: 2990 },
  proAnnual: { code: "plan.pro.annual", name: "Pro anual (365 dias)", kind: "subscription_annual", priceCents: 29900 },
  completeMonthly: { code: "plan.complete.monthly", name: "Completo mensal (30 dias)", kind: "subscription_monthly", priceCents: 4990 },
  completeAnnual: { code: "plan.complete.annual", name: "Completo anual (365 dias)", kind: "subscription_annual", priceCents: 49900 },
} as const;

export type CommercialProductCode = string;
