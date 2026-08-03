import { prisma } from "@/lib/prisma";

export type CompanyPlanKind = "starter" | "pro";

export type CompanyPlan = {
  kind: string;
  planKind: CompanyPlanKind;
  label: string;
  priceCents: number;
  periodDays: number;
  /** Triagens com IA incluídas por ciclo de 30 dias. */
  screeningsIncluded: number;
};

/** Planos recorrentes: vagas ilimitadas + cota mensal de triagens com IA. */
export const COMPANY_PLANS: Record<CompanyPlanKind, CompanyPlan> = {
  starter: {
    kind: "company_subscription_starter",
    planKind: "starter",
    label: "Plano Starter",
    priceCents: 9900,
    periodDays: 30,
    screeningsIncluded: 30,
  },
  pro: {
    kind: "company_subscription_pro",
    planKind: "pro",
    label: "Plano Pro",
    priceCents: 19900,
    periodDays: 30,
    screeningsIncluded: 150,
  },
};

export function getCompanyPlan(planKind: CompanyPlanKind): CompanyPlan {
  return COMPANY_PLANS[planKind];
}

function planKindFromPaymentKind(kind: string): CompanyPlanKind {
  return kind === COMPANY_PLANS.starter.kind ? "starter" : "pro";
}

/** True se a empresa tem o plano recorrente ativo (dentro do período pago). */
export function hasActiveCompanyPlan(company: { planStatus: string; planCurrentPeriodEnd: Date | null }): boolean {
  return (
    company.planStatus === "active" &&
    company.planCurrentPeriodEnd != null &&
    company.planCurrentPeriodEnd.getTime() > Date.now()
  );
}

/** Triagens ainda disponíveis na cota do plano ativo neste ciclo (0 se não há plano ativo). */
export function remainingPlanScreenings(company: {
  planStatus: string;
  planCurrentPeriodEnd: Date | null;
  planKind: string | null;
  planScreeningsUsed: number;
}): number {
  if (!hasActiveCompanyPlan(company) || !company.planKind) return 0;
  const plan = COMPANY_PLANS[company.planKind as CompanyPlanKind];
  return Math.max(0, plan.screeningsIncluded - company.planScreeningsUsed);
}

/** Pacotes de créditos de triagem que a empresa pode comprar. */
export type ScreeningPack = {
  kind: string;
  label: string;
  credits: number;
  priceCents: number;
};

export const SCREENING_PACKS: ScreeningPack[] = [
  { kind: "screening_pack_10", label: "10 triagens", credits: 10, priceCents: 4900 },
  { kind: "screening_pack_50", label: "50 triagens", credits: 50, priceCents: 19900 },
  { kind: "screening_pack_200", label: "200 triagens", credits: 200, priceCents: 59900 },
];

export function findScreeningPack(kind: string): ScreeningPack | undefined {
  return SCREENING_PACKS.find((p) => p.kind === kind);
}

/**
 * Concede créditos a uma empresa de forma idempotente por pagamento: só credita
 * na primeira transição do CompanyPayment para "paid". Retorna o novo saldo, ou
 * null se o pagamento já estava pago (nada a fazer).
 */
export async function grantScreeningCredits(companyPaymentId: string): Promise<number | null> {
  return prisma.$transaction(async (tx) => {
    const payment = await tx.companyPayment.findUnique({ where: { id: companyPaymentId } });
    if (!payment || payment.status === "paid") return null;

    await tx.companyPayment.update({
      where: { id: payment.id },
      data: { status: "paid", paidAt: new Date() },
    });
    const company = await tx.company.update({
      where: { id: payment.companyId },
      data: { screeningCredits: { increment: payment.credits } },
      select: { screeningCredits: true },
    });
    return company.screeningCredits;
  });
}

/**
 * Ativa (ou renova) o plano recorrente da empresa de forma idempotente por
 * pagamento: só estende o período na primeira transição do CompanyPayment
 * para "paid". Zera a cota de triagens usadas no novo ciclo. Retorna o novo
 * `currentPeriodEnd`, ou null se o pagamento já estava pago (nada a fazer).
 */
export async function activateCompanyPlan(companyPaymentId: string): Promise<Date | null> {
  return prisma.$transaction(async (tx) => {
    const payment = await tx.companyPayment.findUnique({ where: { id: companyPaymentId } });
    if (!payment || payment.status === "paid") return null;

    await tx.companyPayment.update({
      where: { id: payment.id },
      data: { status: "paid", paidAt: new Date() },
    });
    const planKind = planKindFromPaymentKind(payment.kind);
    const plan = COMPANY_PLANS[planKind];
    const currentPeriodEnd = new Date(Date.now() + plan.periodDays * 24 * 60 * 60 * 1000);
    await tx.company.update({
      where: { id: payment.companyId },
      data: { planStatus: "active", planKind, planScreeningsUsed: 0, planCurrentPeriodEnd: currentPeriodEnd },
    });
    return currentPeriodEnd;
  });
}
