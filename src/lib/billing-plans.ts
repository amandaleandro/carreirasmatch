import { prisma } from "@/lib/prisma";
import { parseBRLToCents } from "@/lib/pricing";
import { CAREER_OFFER_BY_SEGMENT } from "@/lib/career-offers";
import type { CareerSegment } from "@/lib/career-segments";

/**
 * Planos de assinatura pagos como PAGAMENTO ÚNICO (via Payment Brick, aceita
 * cartão E Pix), que concedem um período de acesso em vez de recorrência
 * automática. Diferente do cartão recorrente (Preapproval), aqui não há débito
 * automático: a pessoa paga e ganha 30 ou 365 dias, e renova manualmente.
 *
 * - subscription_monthly: 30 dias, preço = 1 mensalidade. Serve para quem quer
 *   pagar no Pix (o cartão recorrente não aceita Pix).
 * - subscription_annual: 365 dias, preço = 10 mensalidades (2 meses grátis).
 */
export const PERIOD_PLAN_KINDS = ["subscription_monthly", "subscription_annual"] as const;
export type PeriodPlanKind = (typeof PERIOD_PLAN_KINDS)[number];

export const PERIOD_PLAN_DAYS: Record<PeriodPlanKind, number> = {
  subscription_monthly: 30,
  subscription_annual: 365,
};

export function isPeriodPlanKind(kind: string): kind is PeriodPlanKind {
  return (PERIOD_PLAN_KINDS as readonly string[]).includes(kind);
}

/** Preço do plano em centavos: mensal = 1 mensalidade; anual = 10 mensalidades (2 grátis). */
export function periodPlanAmountCents(segment: CareerSegment, kind: PeriodPlanKind): number {
  const monthlyCents = parseBRLToCents(CAREER_OFFER_BY_SEGMENT[segment].monthlyPrice);
  return kind === "subscription_annual" ? monthlyCents * 10 : monthlyCents;
}

export function periodPlanProductName(kind: PeriodPlanKind): string {
  return kind === "subscription_annual" ? "Assinatura anual (2 meses grátis)" : "Assinatura mensal (30 dias)";
}

const DAY_MS = 24 * 60 * 60 * 1000;

/**
 * Concede/estende o acesso de assinatura por N dias. Se a assinatura ainda está
 * ativa, estende a partir do fim atual (não perde dias); senão, a partir de agora.
 * Retorna a nova data de término.
 */
export async function grantSubscriptionPeriod(
  userId: string,
  segment: CareerSegment,
  days: number,
  paymentId: string
): Promise<Date> {
  const now = new Date();
  const existing = await prisma.subscription.findUnique({ where: { userId } });
  const base =
    existing?.status === "active" && existing.currentPeriodEnd && existing.currentPeriodEnd > now
      ? existing.currentPeriodEnd
      : now;
  const currentPeriodEnd = new Date(base.getTime() + days * DAY_MS);

  await prisma.subscription.upsert({
    where: { userId },
    create: { userId, segment, status: "active", currentPeriodEnd, lastPaymentId: paymentId },
    update: { segment, status: "active", currentPeriodEnd, lastPaymentId: paymentId },
  });

  return currentPeriodEnd;
}
