import { prisma } from "@/lib/prisma";

export const REFERRALS_NEEDED_FOR_REWARD = 3;

import { hasActiveSubscriptionAccess } from "@/lib/entitlements";

/**
 * Obtém as métricas de indicação do usuário:
 * - quantidade de amigos indicados
 * - indicações necessárias para o próximo prêmio
 * - quantos créditos de diagnóstico completo disponíveis
 * - se possui assinatura mensal ativa
 */
export async function getUserReferralStats(userId: string) {
  const [user, totalReferrals, hasSubscription] = await Promise.all([
    prisma.user.findUnique({
      where: { id: userId },
      select: { unlockedFullDiagnosticCredits: true },
    }),
    prisma.user.count({
      where: { referredById: userId },
    }),
    // Intentional exception: referral perk display gated on "has any paid plan", not usage
    // against a single feature's monthly limit — no natural catalog featureKey for it.
    hasActiveSubscriptionAccess(userId),
  ]);

  const credits = user?.unlockedFullDiagnosticCredits ?? 0;
  const currentTierReferrals = totalReferrals % REFERRALS_NEEDED_FOR_REWARD;
  const neededForNext = REFERRALS_NEEDED_FOR_REWARD - currentTierReferrals;

  return {
    totalReferrals,
    currentTierReferrals,
    neededForNext,
    credits,
    referralsNeeded: REFERRALS_NEEDED_FOR_REWARD,
    hasActiveSubscription: hasSubscription,
  };
}

/**
 * Associa uma nova indicação e verifica se atingiu 3 indicações para conceder um crédito
 */
export async function registerUserReferral(newUserId: string, referrerUserId: string) {
  if (newUserId === referrerUserId) return null;

  // Evita re-associar se já possuir indicação
  const currentUser = await prisma.user.findUnique({
    where: { id: newUserId },
    select: { referredById: true },
  });

  if (currentUser?.referredById) return null;

  // Atualiza o usuário para marcar quem indicou
  await prisma.user.update({
    where: { id: newUserId },
    data: { referredById: referrerUserId },
  });

  // Conta total de indicações do indicador
  const count = await prisma.user.count({
    where: { referredById: referrerUserId },
  });

  // A cada múltiplo de 3 indicações (ex: 3, 6, 9), adiciona +1 crédito de diagnóstico completo
  if (count > 0 && count % REFERRALS_NEEDED_FOR_REWARD === 0) {
    await prisma.user.update({
      where: { id: referrerUserId },
      data: { unlockedFullDiagnosticCredits: { increment: 1 } },
    });
    return { rewardUnlocked: true };
  }

  return { rewardUnlocked: false, count };
}

/**
 * Consome um crédito de diagnóstico completo se disponível
 */
export async function consumeReferralCredit(userId: string): Promise<boolean> {
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: { unlockedFullDiagnosticCredits: true },
  });

  if (!user || user.unlockedFullDiagnosticCredits <= 0) {
    return false;
  }

  await prisma.user.update({
    where: { id: userId },
    data: { unlockedFullDiagnosticCredits: { decrement: 1 } },
  });

  return true;
}
