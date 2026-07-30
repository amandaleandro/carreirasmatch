import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAuth } from "@/lib/require-auth";
import { hasActiveSubscriptionAccess } from "@/lib/entitlements";
import {
  getFeatureLimit,
  type CommercialFeatureKey,
  type CommercialPlanKey,
} from "@/lib/commercial-plan-catalog";

/**
 * Núcleo de autorização/consumo do Plano Mestre 2026 (seções 15-16): resolve o
 * plano efetivo do usuário, checa e consome limite por feature dentro do ciclo
 * corrente, com reserva/cancelamento pra nunca cobrar uma chamada de IA que falhou.
 *
 * Simplificações conscientes em relação à especificação original (documentadas
 * pra não serem confundidas com o sistema completo):
 * - O catálogo de planos/limites (`CommercialFeatureKey`/`CommercialPlanKey`) já
 *   existe como código em `commercial-plan-catalog.ts` — não duplicado aqui como
 *   tabela `FeatureDefinition`/`PlanEntitlement`; é dado estático, não dinâmico.
 * - `resolveEffectivePlan` hoje só sabe distinguir "tem assinatura ativa" (→ pro)
 *   de "não tem" (→ free), porque a `Subscription` real ainda não tem múltiplos
 *   tiers (ver limitação documentada no Plano Mestre: seção 14, precificação).
 *   Quando a precificação em camadas existir de verdade, é só trocar esta função.
 * - O ciclo (`UsagePeriod`) usa mês calendário (dia 1 a dia 1), não aniversário da
 *   assinatura — mais simples de implementar e auditar; ajustar depois se a régua
 *   de billing exigir precisão por aniversário.
 * - Não existe `CreditWallet`/crédito avulso aqui — feature sem limite (null) é
 *   ilimitada, feature com limite esgotado bloqueia até o próximo ciclo.
 */

export async function resolveEffectivePlan(userId: string): Promise<CommercialPlanKey> {
  return (await hasActiveSubscriptionAccess(userId)) ? "pro" : "free";
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

async function getUsageCount(periodId: string, featureKey: CommercialFeatureKey): Promise<number> {
  const record = await prisma.featureUsageRecord.findUnique({
    where: { periodId_featureKey: { periodId, featureKey } },
  });
  return record?.count ?? 0;
}

export type FeatureAccessResult = { allowed: boolean; plan: CommercialPlanKey; used: number; limit: number | null };

/** Só checa, não consome — útil pra exibir "3/10 usados" na UI sem gastar cota. */
export async function checkFeatureAccess(userId: string, featureKey: CommercialFeatureKey): Promise<FeatureAccessResult> {
  const plan = await resolveEffectivePlan(userId);
  const limit = getFeatureLimit(plan, featureKey);
  if (limit === null) return { allowed: true, plan, used: 0, limit: null };

  const period = await getOrCreateCurrentPeriod(userId);
  const used = await getUsageCount(period.id, featureKey);
  return { allowed: used < limit, plan, used, limit };
}

/**
 * Reserva (consome) uma unidade da feature ANTES de rodar a operação cara (ex:
 * chamada de IA). Se a operação falhar, chame `cancelReservation` pra devolver a
 * cota — assim o usuário nunca é cobrado por uma tentativa que não deu resultado.
 * `confirmReservation` existe só por simetria com a spec (reservar → executar →
 * confirmar); aqui o consumo já acontece na reserva, então confirmar é no-op.
 */
export async function reserveFeature(userId: string, featureKey: CommercialFeatureKey): Promise<FeatureAccessResult> {
  const plan = await resolveEffectivePlan(userId);
  const limit = getFeatureLimit(plan, featureKey);
  if (limit === null) return { allowed: true, plan, used: 0, limit: null };

  const period = await getOrCreateCurrentPeriod(userId);

  return prisma.$transaction(async (tx) => {
    const existing = await tx.featureUsageRecord.findUnique({
      where: { periodId_featureKey: { periodId: period.id, featureKey } },
    });
    const used = existing?.count ?? 0;
    if (used >= limit) return { allowed: false, plan, used, limit };

    await tx.featureUsageRecord.upsert({
      where: { periodId_featureKey: { periodId: period.id, featureKey } },
      create: { periodId: period.id, featureKey, count: 1 },
      update: { count: { increment: 1 } },
    });
    return { allowed: true, plan, used: used + 1, limit };
  });
}

export async function confirmReservation(_userId: string, _featureKey: CommercialFeatureKey): Promise<void> {
  // No-op: ver comentário de reserveFeature. Mantido pra o call site expressar a
  // intenção (reservar → executar → confirmar) mesmo sem estado extra a mudar.
}

/** Devolve a cota reservada quando a operação cara falhou depois da reserva. */
export async function cancelReservation(userId: string, featureKey: CommercialFeatureKey): Promise<void> {
  const period = await getOrCreateCurrentPeriod(userId);
  await prisma.featureUsageRecord.updateMany({
    where: { periodId: period.id, featureKey, count: { gt: 0 } },
    data: { count: { decrement: 1 } },
  });
}

/**
 * Helper de rota: reserva a feature e já devolve a resposta 402/429 pronta se
 * não tiver cota, ou 401 se não estiver logado. Uso típico numa API route:
 *
 *   const { session, response, release } = await reserveFeatureForRoute(req, "career.growth.plan.generate");
 *   if (!session) return response!;
 *   try { ...chamada de IA...; await release.confirm(); }
 *   catch (e) { await release.cancel(); throw e; }
 */
export async function reserveFeatureForRoute(featureKey: CommercialFeatureKey) {
  const { session, response } = await requireAuth();
  if (!session) return { session: null, response, release: null };

  const result = await reserveFeature(session.user.id, featureKey);
  if (!result.allowed) {
    return {
      session: null,
      response: NextResponse.json(
        {
          error:
            result.plan === "free"
              ? "Assine um plano pago para usar esta ferramenta."
              : `Você atingiu o limite deste mês (${result.limit}). Ele renova no próximo ciclo.`,
        },
        { status: result.plan === "free" ? 402 : 429 }
      ),
      release: null,
    };
  }

  return {
    session,
    response: null,
    release: {
      confirm: () => confirmReservation(session.user.id, featureKey),
      cancel: () => cancelReservation(session.user.id, featureKey),
    },
  };
}
