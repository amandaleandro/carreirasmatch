import { NextResponse } from "next/server";
import { randomUUID } from "node:crypto";
import { prisma } from "@/lib/prisma";
import { requireAuth } from "@/lib/require-auth";
import { hasActiveSubscriptionAccess } from "@/lib/entitlements";
import { getCommercialPlan, type CommercialFeatureKey, type CommercialPlanKey } from "@/lib/commercial-plan-catalog";
import { ensureCommercialCatalog, getPersistedFeatureLimit } from "@/lib/commercial-catalog-db";

export async function resolveEffectivePlan(userId: string): Promise<CommercialPlanKey> {
  if (!(await hasActiveSubscriptionAccess(userId))) return "free";
  const subscription = await prisma.subscription.findUnique({ where: { userId }, select: { planKey: true } });
  return getCommercialPlan(subscription?.planKey).key;
}

function currentCalendarPeriod(now = new Date()) {
  const periodStart = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), 1));
  const periodEnd = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth() + 1, 1));
  return { periodStart, periodEnd };
}

async function getOrCreateCurrentPeriod(userId: string) {
  const { periodStart, periodEnd } = currentCalendarPeriod();
  return prisma.featureUsagePeriod.upsert({
    where: { userId_periodStart: { userId, periodStart } },
    create: { userId, periodStart, periodEnd },
    update: {},
  });
}

export type FeatureAccessResult = { allowed: boolean; plan: CommercialPlanKey; used: number; limit: number | null };
type ReservationHandle = { id: string; confirm: () => Promise<void>; cancel: () => Promise<void> };
type ReservedFeatureAccess = FeatureAccessResult & { reservation?: ReservationHandle };

export async function checkFeatureAccess(userId: string, featureKey: CommercialFeatureKey): Promise<FeatureAccessResult> {
  const plan = await resolveEffectivePlan(userId);
  const limit = await getPersistedFeatureLimit(plan, featureKey);
  if (limit === null) return { allowed: true, plan, used: 0, limit: null };
  const period = await getOrCreateCurrentPeriod(userId);
  const record = await prisma.featureUsageRecord.findUnique({ where: { periodId_featureKey: { periodId: period.id, featureKey } } });
  const used = record?.count ?? 0;
  return { allowed: used < limit, plan, used, limit };
}

/** Reserve exactly once for an idempotency key. The reservation is confirmed only after the operation succeeds. */
export async function reserveFeature(userId: string, featureKey: CommercialFeatureKey, idempotencyKey = randomUUID()): Promise<ReservedFeatureAccess> {
  const plan = await resolveEffectivePlan(userId);
  await ensureCommercialCatalog();
  const limit = await getPersistedFeatureLimit(plan, featureKey);
  const period = await getOrCreateCurrentPeriod(userId);

  return prisma.$transaction(async (tx) => {
    const existingReservation = await tx.featureUsageReservation.findUnique({ where: { userId_idempotencyKey: { userId, idempotencyKey } } });
    if (existingReservation) {
      return reservationResult(existingReservation, plan, limit);
    }

    const record = await tx.featureUsageRecord.findUnique({ where: { periodId_featureKey: { periodId: period.id, featureKey } } });
    const used = record?.count ?? 0;
    if (limit !== null && used >= limit) {
      const wallet = await tx.creditWallet.findUnique({ where: { userId_creditType: { userId, creditType: featureKey } } });
      if (!wallet || wallet.balance < 1) return { allowed: false, plan, used, limit };
      const updatedWallet = await tx.creditWallet.update({ where: { id: wallet.id }, data: { balance: { decrement: 1 } } });
      const creditTransaction = await tx.creditTransaction.create({
        data: {
          userId,
          walletId: wallet.id,
          creditType: featureKey,
          quantity: -1,
          balanceAfter: updatedWallet.balance,
          type: "consume",
          source: "feature_reservation",
          idempotencyKey: `reservation:${idempotencyKey}`,
        },
      });
      const reservation = await tx.featureUsageReservation.create({
        data: { userId, periodId: period.id, featureKey, idempotencyKey, quantity: 1, creditTransactionId: creditTransaction.id },
      });
      return { allowed: true, plan, used, limit, reservation: handleFor(reservation.id) };
    }

    const reservation = await tx.featureUsageReservation.create({
      data: { userId, periodId: period.id, featureKey, idempotencyKey, quantity: 1 },
    });
    // O contador representa uso reservado ou confirmado. Isso impede que duas
    // chamadas concorrentes atravessem o mesmo limite; cancelamento faz a reversão.
    await tx.featureUsageRecord.upsert({
      where: { periodId_featureKey: { periodId: period.id, featureKey } },
      create: { periodId: period.id, featureKey, count: 1 },
      update: { count: { increment: 1 } },
    });
    return {
      allowed: true,
      plan,
      used: limit === null ? 0 : used + 1,
      limit,
      reservation: handleFor(reservation.id),
    };
  }, { isolationLevel: "Serializable" });
}

function reservationResult(reservation: { id: string; status: string; quantity: number }, plan: CommercialPlanKey, limit: number | null): ReservedFeatureAccess {
  return { allowed: reservation.status !== "cancelled", plan, used: 0, limit, reservation: handleFor(reservation.id) };
}

function handleFor(id: string): ReservationHandle {
  return { id, confirm: () => confirmReservation(id), cancel: () => cancelReservation(id) };
}

export async function confirmReservation(reservationId: string): Promise<void> {
  const reservation = await prisma.featureUsageReservation.findUnique({ where: { id: reservationId } });
  if (!reservation || reservation.status !== "reserved") return;
  await prisma.$transaction(async (tx) => {
    const updated = await tx.featureUsageReservation.updateMany({ where: { id: reservationId, status: "reserved" }, data: { status: "confirmed" } });
    if (updated.count === 0) return;
  });
}

export async function cancelReservation(reservationId: string): Promise<void> {
  await prisma.$transaction(async (tx) => {
    const reservation = await tx.featureUsageReservation.findUnique({ where: { id: reservationId } });
    if (!reservation || reservation.status !== "reserved") return;
    await tx.featureUsageReservation.update({ where: { id: reservationId }, data: { status: "cancelled" } });
    if (reservation.creditTransactionId) {
      const wallet = await tx.creditWallet.findUnique({ where: { userId_creditType: { userId: reservation.userId, creditType: reservation.featureKey } } });
      if (wallet) {
        const updatedWallet = await tx.creditWallet.update({ where: { id: wallet.id }, data: { balance: { increment: reservation.quantity } } });
        await tx.creditTransaction.create({
          data: {
            userId: reservation.userId,
            walletId: wallet.id,
            creditType: reservation.featureKey,
            quantity: reservation.quantity,
            balanceAfter: updatedWallet.balance,
            type: "reverse",
            source: `reservation:${reservation.id}`,
            idempotencyKey: `reverse:${reservation.id}`,
          },
        });
      }
      return;
    }
    await tx.featureUsageRecord.updateMany({
      where: { periodId: reservation.periodId, featureKey: reservation.featureKey, count: { gte: reservation.quantity } },
      data: { count: { decrement: reservation.quantity } },
    });
  }, { isolationLevel: "Serializable" });
}

export async function reserveFeatureForRoute(featureKey: CommercialFeatureKey) {
  const { session, response } = await requireAuth();
  if (!session) return { session: null, response, release: null };
  const result = await reserveFeature(session.user!.id!, featureKey);
  if (!result.allowed) {
    return { session: null, response: NextResponse.json({ error: result.plan === "free" ? "Assine um plano pago para usar esta ferramenta." : `Você atingiu o limite deste mês (${result.limit}). Ele renova no próximo ciclo.` }, { status: result.plan === "free" ? 402 : 429 }), release: null };
  }
  return { session, response: null, release: { confirm: () => result.reservation?.confirm() ?? Promise.resolve(), cancel: () => result.reservation?.cancel() ?? Promise.resolve() } };
}

export async function reserveFeatureForSession(userId: string, featureKey: CommercialFeatureKey) {
  const result = await reserveFeature(userId, featureKey);
  if (!result.allowed) {
    return { allowed: false as const, response: NextResponse.json({ error: result.plan === "free" ? "Assine um plano pago para usar esta ferramenta." : `Você atingiu o limite deste mês (${result.limit}). Ele renova no próximo ciclo.` }, { status: result.plan === "free" ? 402 : 429 }), release: null };
  }
  return { allowed: true as const, response: null, release: { confirm: () => result.reservation?.confirm() ?? Promise.resolve(), cancel: () => result.reservation?.cancel() ?? Promise.resolve() } };
}
