import { prisma } from "@/lib/prisma";

export type AdPack = {
  kind: string;
  label: string;
  credits: number;
  priceCents: number;
};

export const AD_PACKS: AdPack[] = [
  { kind: "ad_pack_5", label: "5 destaques de curso", credits: 5, priceCents: 4900 },
  { kind: "ad_pack_20", label: "20 destaques de curso", credits: 20, priceCents: 14900 },
  { kind: "ad_pack_50", label: "50 destaques de curso", credits: 50, priceCents: 29900 },
];

export function findAdPack(kind: string): AdPack | undefined {
  return AD_PACKS.find((p) => p.kind === kind);
}

/**
 * Concede créditos de destaque a um parceiro de forma idempotente por pagamento.
 */
export async function grantPartnerCredits(partnerPaymentId: string): Promise<number | null> {
  return prisma.$transaction(async (tx) => {
    const payment = await tx.partnerPayment.findUnique({ where: { id: partnerPaymentId } });
    if (!payment || payment.status === "paid") return null;

    await tx.partnerPayment.update({
      where: { id: payment.id },
      data: { status: "paid", paidAt: new Date() },
    });
    const partner = await tx.partner.update({
      where: { id: payment.partnerId },
      data: { credits: { increment: payment.credits } },
      select: { credits: true },
    });
    return partner.credits;
  });
}
