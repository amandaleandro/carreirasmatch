import { prisma } from "@/lib/prisma";
import { hasFullAccessUserId } from "@/lib/full-access-users";
import { isInfluencerUser } from "@/lib/influencer";
import { normalizeCareerSegment } from "@/lib/career-segments";
import { CAREER_OFFER_BY_SEGMENT } from "@/lib/career-offers";
import { randomUUID } from "node:crypto";

// Must match SUBSCRIPTION_PERIOD_DAYS in src/app/api/billing/webhook/route.ts, which sets
// currentPeriodEnd 30 days out on each renewal.
const SUBSCRIPTION_PERIOD_DAYS = 30;

async function getActiveSubscription(userId: string) {
  const subscription = await prisma.subscription.findUnique({ where: { userId } });
  if (!subscription || subscription.status !== "active") return null;
  if (subscription.currentPeriodEnd && subscription.currentPeriodEnd < new Date()) return null;
  return subscription;
}

/** Whether the user has an active, non-expired subscription. Also unlocks the rest of the app's paid tools. */
export async function hasActiveSubscriptionAccess(userId: string): Promise<boolean> {
  if (await hasFullAccessUserId(userId)) return true;
  // Influenciadores (donos de cupom) têm acesso total ao sistema sem pagar.
  if (await isInfluencerUser(userId)) return true;
  return !!(await getActiveSubscription(userId));
}

/** Creating an analysis (the simple, score-only result) is always free. */
export async function hasAnalysisCredit(): Promise<boolean> {
  return true;
}

/**
 * Active subscription unlocks the full diagnostic for free up to the segment's
 * `monthlyAnalysisLimit` (the Nth-earliest analyses created in the current billing period,
 * null = unlimited). Beyond that, or without a subscription, a paid "diagnostic" payment tied
 * to this specific analysis unlocks it.
 */
export async function canViewFullDiagnostic(userId: string, analysisId: string): Promise<boolean> {
  if (await hasFullAccessUserId(userId)) return true;
  if (await isInfluencerUser(userId)) return true;

  const subscription = await getActiveSubscription(userId);
  if (subscription) {
    const segment = normalizeCareerSegment(subscription.segment);
    const limit = segment ? CAREER_OFFER_BY_SEGMENT[segment].monthlyAnalysisLimit : null;

    if (limit === null) return true;

    const periodEnd = subscription.currentPeriodEnd ?? new Date();
    const periodStart = new Date(periodEnd.getTime() - SUBSCRIPTION_PERIOD_DAYS * 24 * 60 * 60 * 1000);

    const coveredAnalyses = await prisma.analysis.findMany({
      where: { resume: { userId }, createdAt: { gte: periodStart } },
      orderBy: { createdAt: "asc" },
      select: { id: true },
      take: limit,
    });
    if (coveredAnalyses.some((a) => a.id === analysisId)) return true;
  }

  const unlock = await prisma.payment.findFirst({
    where: { userId, kind: "diagnostic", status: "paid", analysisId },
  });
  if (unlock) return true;

  // A PRIMEIRA análise criada por qualquer usuário é 100% GRATUITA e completa!
  // Isso reduz o atrito, gera engajamento imediato e estimula o compartilhamento do Card.
  const firstAnalysis = await prisma.analysis.findFirst({
    where: { resume: { userId } },
    orderBy: { createdAt: "asc" },
    select: { id: true },
  });
  if (firstAnalysis && firstAnalysis.id === analysisId) {
    return true;
  }

  // Verifica se o usuário possui créditos de diagnóstico obtidos indicando 3 amigos
  const referralUnlock = await prisma.$transaction(async (tx) => {
    const consumed = await tx.user.updateMany({
      where: { id: userId, unlockedFullDiagnosticCredits: { gt: 0 } },
      data: { unlockedFullDiagnosticCredits: { decrement: 1 } },
    });
    if (consumed.count === 0) return false;

    await tx.payment.create({
      data: {
        userId,
        kind: "diagnostic",
        segment: "referral_reward",
        amount: 0,
        status: "paid",
        mpPaymentId: `referral:${analysisId}:${randomUUID()}`,
        analysisId,
        paidAt: new Date(),
        source: "referral",
      },
    });
    return true;
  });
  if (referralUnlock) return true;

  return false;
}
