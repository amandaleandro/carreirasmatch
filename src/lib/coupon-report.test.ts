import { describe, expect, it, vi, beforeEach } from "vitest";

const { prismaMock } = vi.hoisted(() => ({
  prismaMock: {
    coupon: { findMany: vi.fn() },
    payment: { groupBy: vi.fn() },
  },
}));

vi.mock("@/lib/prisma", () => ({ prisma: prismaMock }));

import { commissionCents, couponReport } from "@/lib/coupon-report";

beforeEach(() => {
  prismaMock.coupon.findMany.mockReset();
  prismaMock.payment.groupBy.mockReset();
});

describe("commissionCents", () => {
  it("aplica o percentual sobre a base recebida", () => {
    expect(commissionCents(1000, 20)).toBe(200);
    expect(commissionCents(1000, 0)).toBe(0);
  });

  it("arredonda para centavos inteiros", () => {
    expect(commissionCents(999, 15)).toBe(150);
  });
});

describe("couponReport", () => {
  it("calcula a comissão sobre a receita bruta, não sobre a líquida", async () => {
    prismaMock.coupon.findMany.mockResolvedValue([
      { id: "c1", code: "MARIA10", influencerName: "Maria", commissionPercent: 20 },
    ]);
    prismaMock.payment.groupBy.mockResolvedValue([
      { couponId: "c1", _sum: { amount: 800, discountCents: 200 }, _count: { _all: 1 } },
    ]);

    const [row] = await couponReport();

    expect(row).toMatchObject({
      paidCount: 1,
      netRevenueCents: 800,
      discountCents: 200,
      grossRevenueCents: 1000,
      commissionCents: 200, // 20% de 1000 (bruto), não de 800 (líquido)
    });
  });

  it("considera apenas pagamentos confirmados", async () => {
    prismaMock.coupon.findMany.mockResolvedValue([
      { id: "c1", code: "MARIA10", influencerName: "Maria", commissionPercent: 20 },
    ]);
    prismaMock.payment.groupBy.mockResolvedValue([]);

    await couponReport();

    expect(prismaMock.payment.groupBy).toHaveBeenCalledWith(
      expect.objectContaining({ where: { status: "paid", couponId: { not: null } } })
    );
  });

  it("zera cupons sem venda em vez de omiti-los", async () => {
    prismaMock.coupon.findMany.mockResolvedValue([
      { id: "c2", code: "JOAO5", influencerName: "João", commissionPercent: 30 },
    ]);
    prismaMock.payment.groupBy.mockResolvedValue([]);

    expect(await couponReport()).toEqual([
      {
        couponId: "c2",
        code: "JOAO5",
        influencerName: "João",
        commissionPercent: 30,
        paidCount: 0,
        netRevenueCents: 0,
        discountCents: 0,
        grossRevenueCents: 0,
        commissionCents: 0,
      },
    ]);
  });

  it("ordena por receita, do maior para o menor", async () => {
    prismaMock.coupon.findMany.mockResolvedValue([
      { id: "c1", code: "A", influencerName: "A", commissionPercent: 10 },
      { id: "c2", code: "B", influencerName: "B", commissionPercent: 10 },
    ]);
    prismaMock.payment.groupBy.mockResolvedValue([
      { couponId: "c1", _sum: { amount: 100, discountCents: 0 }, _count: { _all: 1 } },
      { couponId: "c2", _sum: { amount: 900, discountCents: 0 }, _count: { _all: 3 } },
    ]);

    expect((await couponReport()).map((row) => row.code)).toEqual(["B", "A"]);
  });
});
