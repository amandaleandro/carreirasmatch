import { prisma } from "@/lib/prisma";

export type CouponReportRow = {
  couponId: string;
  code: string;
  influencerName: string;
  commissionPercent: number;
  /** Pagamentos confirmados atribuídos ao cupom. */
  paidCount: number;
  /** Soma do que efetivamente entrou (valor já com desconto). */
  netRevenueCents: number;
  /** Soma dos descontos concedidos. Vale 0 para pagamentos anteriores ao campo discountCents. */
  discountCents: number;
  /** netRevenue + desconto: quanto teria entrado sem o cupom. É a base da comissão. */
  grossRevenueCents: number;
  /** Comissão devida ao influenciador, calculada sobre a receita bruta (valor cheio). */
  commissionCents: number;
};

export function commissionCents(grossRevenueCents: number, commissionPercent: number): number {
  return Math.round((grossRevenueCents * commissionPercent) / 100);
}

/**
 * Desempenho por cupom, considerando apenas pagamentos com status "paid".
 * Cupons sem nenhuma venda confirmada aparecem zerados.
 */
export async function couponReport(): Promise<CouponReportRow[]> {
  const [coupons, groups] = await Promise.all([
    prisma.coupon.findMany({
      select: { id: true, code: true, influencerName: true, commissionPercent: true },
    }),
    prisma.payment.groupBy({
      by: ["couponId"],
      where: { status: "paid", couponId: { not: null } },
      _sum: { amount: true, discountCents: true },
      _count: { _all: true },
    }),
  ]);

  const byCouponId = new Map(groups.map((group) => [group.couponId, group]));

  return coupons
    .map((coupon) => {
      const group = byCouponId.get(coupon.id);
      const netRevenueCents = group?._sum.amount ?? 0;
      const discount = group?._sum.discountCents ?? 0;
      const grossRevenueCents = netRevenueCents + discount;

      return {
        couponId: coupon.id,
        code: coupon.code,
        influencerName: coupon.influencerName,
        commissionPercent: coupon.commissionPercent,
        paidCount: group?._count._all ?? 0,
        netRevenueCents,
        discountCents: discount,
        grossRevenueCents,
        commissionCents: commissionCents(grossRevenueCents, coupon.commissionPercent),
      };
    })
    .sort((a, b) => b.netRevenueCents - a.netRevenueCents);
}
