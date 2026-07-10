import { prisma } from "@/lib/prisma";

export type PaymentKind = "first_analysis" | "diagnostic" | "subscription";

export function normalizeCouponCode(code: string): string {
  return code.trim().toUpperCase();
}

/**
 * Valida um cupom e retorna o valor final (em centavos) já com o desconto aplicado.
 * Lança erro com mensagem amigável quando o cupom não pode ser usado.
 */
export async function applyCoupon(
  code: string | null | undefined,
  kind: PaymentKind,
  amountCents: number
): Promise<{ amountCents: number; couponId: string | null }> {
  if (!code || !code.trim()) return { amountCents, couponId: null };

  const coupon = await prisma.coupon.findUnique({ where: { code: normalizeCouponCode(code) } });
  if (!coupon || !coupon.active) {
    throw new Error("Cupom inválido ou expirado.");
  }

  const discountCents = kind === "subscription" ? coupon.subscriptionDiscountCents : coupon.oneOffDiscountCents;
  const finalAmountCents = Math.max(0, amountCents - discountCents);

  return { amountCents: finalAmountCents, couponId: coupon.id };
}

/** Deve ser chamado apenas após confirmar que o pagamento foi criado com sucesso. */
export async function registerCouponUsage(couponId: string | null) {
  if (!couponId) return;
  await prisma.coupon.update({
    where: { id: couponId },
    data: { usageCount: { increment: 1 } },
  });
}
