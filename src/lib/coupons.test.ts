import { describe, expect, it, vi, beforeEach } from "vitest";

const { prismaMock } = vi.hoisted(() => ({
  prismaMock: {
    coupon: { findUnique: vi.fn(), update: vi.fn() },
  },
}));

vi.mock("@/lib/prisma", () => ({ prisma: prismaMock }));

import {
  applyCoupon,
  assertCouponUsable,
  couponDiscountCents,
  normalizeCouponCode,
  registerCouponUsage,
  type CouponRules,
} from "@/lib/coupons";

function makeCoupon(overrides: Partial<CouponRules> = {}): CouponRules {
  return {
    active: true,
    discountType: "fixed",
    oneOffDiscountCents: 200,
    subscriptionDiscountCents: 400,
    oneOffDiscountPercent: 0,
    subscriptionDiscountPercent: 0,
    expiresAt: null,
    maxRedemptions: null,
    usageCount: 0,
    ...overrides,
  };
}

beforeEach(() => {
  prismaMock.coupon.findUnique.mockReset();
  prismaMock.coupon.update.mockReset();
});

describe("normalizeCouponCode", () => {
  it("remove espaços e força maiúsculas", () => {
    expect(normalizeCouponCode("  maria10 ")).toBe("MARIA10");
  });
});

describe("couponDiscountCents", () => {
  it("usa o desconto fixo de avulso ou assinatura conforme o tipo de cobrança", () => {
    const coupon = makeCoupon();
    expect(couponDiscountCents(coupon, "first_analysis", 1000)).toBe(200);
    expect(couponDiscountCents(coupon, "diagnostic", 1000)).toBe(200);
    expect(couponDiscountCents(coupon, "subscription", 1000)).toBe(400);
  });

  it("calcula percentual sobre o valor quando discountType = percent", () => {
    const coupon = makeCoupon({
      discountType: "percent",
      oneOffDiscountPercent: 25,
      subscriptionDiscountPercent: 50,
    });
    expect(couponDiscountCents(coupon, "diagnostic", 1000)).toBe(250);
    expect(couponDiscountCents(coupon, "subscription", 1000)).toBe(500);
  });

  it("arredonda o percentual para centavos inteiros", () => {
    const coupon = makeCoupon({ discountType: "percent", oneOffDiscountPercent: 33 });
    expect(couponDiscountCents(coupon, "diagnostic", 1000)).toBe(330);
    expect(couponDiscountCents(coupon, "diagnostic", 999)).toBe(330);
  });

  it("nunca desconta mais do que o próprio valor", () => {
    const fixo = makeCoupon({ oneOffDiscountCents: 5000 });
    expect(couponDiscountCents(fixo, "diagnostic", 1000)).toBe(1000);

    const percentual = makeCoupon({ discountType: "percent", oneOffDiscountPercent: 100 });
    expect(couponDiscountCents(percentual, "diagnostic", 1000)).toBe(1000);
  });

  it("trata percentual fora da faixa 0-100 sem gerar desconto negativo", () => {
    const negativo = makeCoupon({ discountType: "percent", oneOffDiscountPercent: -30 });
    expect(couponDiscountCents(negativo, "diagnostic", 1000)).toBe(0);

    const acima = makeCoupon({ discountType: "percent", oneOffDiscountPercent: 150 });
    expect(couponDiscountCents(acima, "diagnostic", 1000)).toBe(1000);
  });
});

describe("assertCouponUsable", () => {
  const now = new Date("2026-07-16T12:00:00Z");

  it("aceita cupom ativo, sem expiração e sem limite", () => {
    expect(() => assertCouponUsable(makeCoupon(), now)).not.toThrow();
  });

  it("recusa cupom inativo", () => {
    expect(() => assertCouponUsable(makeCoupon({ active: false }), now)).toThrow("Cupom inválido ou expirado.");
  });

  it("recusa cupom com data de expiração já passada", () => {
    const coupon = makeCoupon({ expiresAt: new Date("2026-07-15T12:00:00Z") });
    expect(() => assertCouponUsable(coupon, now)).toThrow("Este cupom expirou.");
  });

  it("aceita cupom cuja expiração ainda não chegou", () => {
    const coupon = makeCoupon({ expiresAt: new Date("2026-07-17T12:00:00Z") });
    expect(() => assertCouponUsable(coupon, now)).not.toThrow();
  });

  it("recusa no exato instante da expiração", () => {
    const coupon = makeCoupon({ expiresAt: new Date("2026-07-16T12:00:00Z") });
    expect(() => assertCouponUsable(coupon, now)).toThrow("Este cupom expirou.");
  });

  it("recusa quando o limite de usos foi atingido", () => {
    const coupon = makeCoupon({ maxRedemptions: 10, usageCount: 10 });
    expect(() => assertCouponUsable(coupon, now)).toThrow("Este cupom atingiu o limite de usos.");
  });

  it("aceita no último uso disponível", () => {
    const coupon = makeCoupon({ maxRedemptions: 10, usageCount: 9 });
    expect(() => assertCouponUsable(coupon, now)).not.toThrow();
  });
});

describe("applyCoupon", () => {
  it("não altera o valor quando não há código", async () => {
    expect(await applyCoupon("", "diagnostic", 1000)).toEqual({
      amountCents: 1000,
      discountCents: 0,
      couponId: null,
    });
    expect(prismaMock.coupon.findUnique).not.toHaveBeenCalled();
  });

  it("aplica o desconto e devolve o id do cupom", async () => {
    prismaMock.coupon.findUnique.mockResolvedValue({ id: "c1", ...makeCoupon() });

    expect(await applyCoupon(" maria10 ", "subscription", 1000)).toEqual({
      amountCents: 600,
      discountCents: 400,
      couponId: "c1",
    });
    expect(prismaMock.coupon.findUnique).toHaveBeenCalledWith({ where: { code: "MARIA10" } });
  });

  it("recusa código inexistente", async () => {
    prismaMock.coupon.findUnique.mockResolvedValue(null);
    await expect(applyCoupon("NOPE", "diagnostic", 1000)).rejects.toThrow("Cupom inválido ou expirado.");
  });

  it("propaga a recusa de um cupom esgotado", async () => {
    prismaMock.coupon.findUnique.mockResolvedValue({
      id: "c1",
      ...makeCoupon({ maxRedemptions: 1, usageCount: 1 }),
    });
    await expect(applyCoupon("MARIA10", "diagnostic", 1000)).rejects.toThrow("Este cupom atingiu o limite de usos.");
  });

  it("zera o valor sem passar do negativo quando o desconto supera o preço", async () => {
    prismaMock.coupon.findUnique.mockResolvedValue({ id: "c1", ...makeCoupon({ oneOffDiscountCents: 9999 }) });

    expect(await applyCoupon("MARIA10", "diagnostic", 1000)).toEqual({
      amountCents: 0,
      discountCents: 1000,
      couponId: "c1",
    });
  });
});

describe("registerCouponUsage", () => {
  it("ignora pagamento sem cupom", async () => {
    await registerCouponUsage(null);
    expect(prismaMock.coupon.update).not.toHaveBeenCalled();
  });

  it("incrementa o contador do cupom", async () => {
    await registerCouponUsage("c1");
    expect(prismaMock.coupon.update).toHaveBeenCalledWith({
      where: { id: "c1" },
      data: { usageCount: { increment: 1 } },
    });
  });
});
