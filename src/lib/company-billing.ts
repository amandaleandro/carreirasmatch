import { prisma } from "@/lib/prisma";

/** Plano recorrente: vagas e triagens ilimitadas por assinatura mensal. */
export const COMPANY_PLAN = {
  kind: "company_subscription",
  label: "Plano Ilimitado",
  priceCents: 19900,
  periodDays: 30,
};

/** True se a empresa tem o plano recorrente ativo (dentro do período pago). */
export function hasActiveCompanyPlan(company: { planStatus: string; planCurrentPeriodEnd: Date | null }): boolean {
  return (
    company.planStatus === "active" &&
    company.planCurrentPeriodEnd != null &&
    company.planCurrentPeriodEnd.getTime() > Date.now()
  );
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
 * para "paid". Retorna o novo `currentPeriodEnd`, ou null se o pagamento já
 * estava pago (nada a fazer).
 */
export async function activateCompanyPlan(companyPaymentId: string): Promise<Date | null> {
  return prisma.$transaction(async (tx) => {
    const payment = await tx.companyPayment.findUnique({ where: { id: companyPaymentId } });
    if (!payment || payment.status === "paid") return null;

    await tx.companyPayment.update({
      where: { id: payment.id },
      data: { status: "paid", paidAt: new Date() },
    });
    const currentPeriodEnd = new Date(Date.now() + COMPANY_PLAN.periodDays * 24 * 60 * 60 * 1000);
    await tx.company.update({
      where: { id: payment.companyId },
      data: { planStatus: "active", planCurrentPeriodEnd: currentPeriodEnd },
    });
    return currentPeriodEnd;
  });
}
