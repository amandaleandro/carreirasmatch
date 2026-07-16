import { prisma } from "@/lib/prisma";

export type PaymentKind = "first_analysis" | "diagnostic" | "subscription";

/** Campos do cupom necessários para calcular/validar. Mantido estrutural para permitir teste sem banco. */
export type CouponRules = {
  active: boolean;
  discountType: string;
  oneOffDiscountCents: number;
  subscriptionDiscountCents: number;
  oneOffDiscountPercent: number;
  subscriptionDiscountPercent: number;
  expiresAt: Date | null;
  maxRedemptions: number | null;
  usageCount: number;
};

export class CouponError extends Error {}

export function normalizeCouponCode(code: string): string {
  return code.trim().toUpperCase();
}

function clampPercent(percent: number): number {
  if (!Number.isFinite(percent)) return 0;
  return Math.min(100, Math.max(0, Math.round(percent)));
}

/**
 * Desconto em centavos que o cupom concede sobre `amountCents`, nunca maior que o
 * próprio valor (o cliente não fica com saldo a receber) e nunca negativo.
 */
export function couponDiscountCents(coupon: CouponRules, kind: PaymentKind, amountCents: number): number {
  const isSubscription = kind === "subscription";

  const raw =
    coupon.discountType === "percent"
      ? Math.round(
          (amountCents *
            clampPercent(isSubscription ? coupon.subscriptionDiscountPercent : coupon.oneOffDiscountPercent)) /
            100
        )
      : isSubscription
        ? coupon.subscriptionDiscountCents
        : coupon.oneOffDiscountCents;

  return Math.min(amountCents, Math.max(0, Math.round(raw)));
}

/** Lança CouponError com mensagem amigável quando o cupom não pode ser usado agora. */
export function assertCouponUsable(coupon: CouponRules, now: Date = new Date()): void {
  if (!coupon.active) {
    throw new CouponError("Cupom inválido ou expirado.");
  }
  if (coupon.expiresAt && coupon.expiresAt.getTime() <= now.getTime()) {
    throw new CouponError("Este cupom expirou.");
  }
  if (coupon.maxRedemptions !== null && coupon.usageCount >= coupon.maxRedemptions) {
    throw new CouponError("Este cupom atingiu o limite de usos.");
  }
}

/**
 * Valida um cupom e retorna o valor final (em centavos) já com o desconto aplicado.
 * Lança erro com mensagem amigável quando o cupom não pode ser usado.
 */
export async function applyCoupon(
  code: string | null | undefined,
  kind: PaymentKind,
  amountCents: number
): Promise<{ amountCents: number; discountCents: number; couponId: string | null }> {
  if (!code || !code.trim()) return { amountCents, discountCents: 0, couponId: null };

  const coupon = await prisma.coupon.findUnique({ where: { code: normalizeCouponCode(code) } });
  if (!coupon) {
    throw new CouponError("Cupom inválido ou expirado.");
  }
  assertCouponUsable(coupon);

  const discountCents = couponDiscountCents(coupon, kind, amountCents);

  return { amountCents: amountCents - discountCents, discountCents, couponId: coupon.id };
}

/**
 * Deve ser chamado apenas após confirmar que o pagamento foi pago — inclusive no
 * webhook, já que o PIX nasce "pending" e só confirma lá. É o contador comparado
 * contra maxRedemptions, então contar um pagamento não pago bloquearia o cupom à toa.
 */
export async function registerCouponUsage(couponId: string | null) {
  if (!couponId) return;
  await prisma.coupon.update({
    where: { id: couponId },
    data: { usageCount: { increment: 1 } },
  });
}
