import { prisma } from "@/lib/prisma";
import { COMMERCIAL_PLANS } from "@/lib/commercial-plan-catalog";

export const COMMERCIAL_PRODUCTS = {
  firstAnalysis: { code: "analysis.first", name: "Primeira análise", kind: "first_analysis", priceCents: 4900 },
  fullAnalysis: { code: "analysis.full", name: "Análise completa", kind: "diagnostic", priceCents: 990 },
  analysisCredits: { code: "credits.analysis.5", name: "5 análises completas", kind: "credit_pack", priceCents: 3990, creditType: "analysis.job.full", creditQuantity: 5 },
  proMonthly: { code: "plan.pro.monthly", name: "Pro mensal (30 dias)", kind: "subscription_monthly", priceCents: 2990 },
  proAnnual: { code: "plan.pro.annual", name: "Pro anual (365 dias)", kind: "subscription_annual", priceCents: 29900 },
} as const;

export type CommercialProductCode = string;

export async function ensureCommercialProducts() {
  for (const product of Object.values(COMMERCIAL_PRODUCTS)) {
    await prisma.product.upsert({ where: { code: product.code }, create: product, update: { ...product, active: true } });
  }
  for (const plan of Object.values(COMMERCIAL_PLANS)) {
    await prisma.product.upsert({
      where: { code: `plan.${plan.key}` },
      create: { code: `plan.${plan.key}`, name: plan.name, kind: "subscription", priceCents: plan.priceCents, recurring: plan.recurring, planKey: plan.key },
      update: { name: plan.name, priceCents: plan.priceCents, recurring: plan.recurring, planKey: plan.key, active: true },
    });
  }
}

export async function resolveCommercialProduct(code: CommercialProductCode) {
  await ensureCommercialProducts();
  const product = await prisma.product.findUnique({ where: { code } });
  if (!product || !product.active) throw new Error("Produto indisponível.");
  return product;
}

export async function grantCredits(input: {
  userId: string;
  creditType: string;
  quantity: number;
  source: string;
  idempotencyKey: string;
  expiresAt?: Date;
}) {
  if (!Number.isInteger(input.quantity) || input.quantity <= 0) throw new Error("Quantidade de créditos inválida.");
  return prisma.$transaction(async (tx) => {
    const existing = await tx.creditTransaction.findUnique({ where: { idempotencyKey: input.idempotencyKey } });
    if (existing) return existing;
    const wallet = await tx.creditWallet.upsert({
      where: { userId_creditType: { userId: input.userId, creditType: input.creditType } },
      create: { userId: input.userId, creditType: input.creditType, balance: input.quantity },
      update: { balance: { increment: input.quantity } },
    });
    return tx.creditTransaction.create({
      data: { userId: input.userId, walletId: wallet.id, creditType: input.creditType, quantity: input.quantity, balanceAfter: wallet.balance, type: "grant", source: input.source, idempotencyKey: input.idempotencyKey, expiresAt: input.expiresAt },
    });
  });
}

export async function consumeCredits(input: { userId: string; creditType: string; quantity?: number; idempotencyKey: string }) {
  const quantity = input.quantity ?? 1;
  if (!Number.isInteger(quantity) || quantity <= 0) throw new Error("Quantidade de créditos inválida.");
  return prisma.$transaction(async (tx) => {
    const existing = await tx.creditTransaction.findUnique({ where: { idempotencyKey: input.idempotencyKey } });
    if (existing) return existing;
    const wallet = await tx.creditWallet.findUnique({ where: { userId_creditType: { userId: input.userId, creditType: input.creditType } } });
    if (!wallet || wallet.balance < quantity) throw new Error("Créditos insuficientes.");
    const updated = await tx.creditWallet.update({ where: { id: wallet.id }, data: { balance: { decrement: quantity } } });
    return tx.creditTransaction.create({
      data: { userId: input.userId, walletId: wallet.id, creditType: input.creditType, quantity: -quantity, balanceAfter: updated.balance, type: "consume", source: "feature", idempotencyKey: input.idempotencyKey },
    });
  });
}
