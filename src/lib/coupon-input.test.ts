import { describe, expect, it } from "vitest";

import { CouponInputError, parseCouponInput } from "@/lib/coupon-input";

describe("parseCouponInput", () => {
  it("normaliza código e nome", () => {
    const parsed = parseCouponInput({ code: " maria10 ", influencerName: "  Maria Silva " });
    expect(parsed.code).toBe("MARIA10");
    expect(parsed.influencerName).toBe("Maria Silva");
  });

  it("ignora campos não enviados, permitindo PATCH parcial", () => {
    expect(parseCouponInput({ active: false })).toEqual({ active: false });
  });

  it("recusa código ou nome vazios", () => {
    expect(() => parseCouponInput({ code: "   " })).toThrow(CouponInputError);
    expect(() => parseCouponInput({ influencerName: "" })).toThrow(CouponInputError);
  });

  it("aceita apenas os tipos de desconto conhecidos", () => {
    expect(parseCouponInput({ discountType: "percent" }).discountType).toBe("percent");
    expect(() => parseCouponInput({ discountType: "gratis" })).toThrow("Tipo de desconto deve ser 'fixed' ou 'percent'.");
  });

  it("limita percentuais à faixa 0-100", () => {
    expect(parseCouponInput({ commissionPercent: 30 }).commissionPercent).toBe(30);
    expect(() => parseCouponInput({ commissionPercent: 101 })).toThrow(CouponInputError);
    expect(() => parseCouponInput({ oneOffDiscountPercent: -1 })).toThrow(CouponInputError);
  });

  it("recusa valores não numéricos", () => {
    expect(() => parseCouponInput({ oneOffDiscountCents: "200" })).toThrow("Campo 'oneOffDiscountCents' deve ser um número.");
  });

  it("trata maxRedemptions nulo como sem limite e exige pelo menos 1", () => {
    expect(parseCouponInput({ maxRedemptions: null }).maxRedemptions).toBeNull();
    expect(parseCouponInput({ maxRedemptions: "" }).maxRedemptions).toBeNull();
    expect(parseCouponInput({ maxRedemptions: 5 }).maxRedemptions).toBe(5);
    expect(() => parseCouponInput({ maxRedemptions: 0 })).toThrow(CouponInputError);
  });

  it("converte expiresAt ISO em Date e aceita null", () => {
    const parsed = parseCouponInput({ expiresAt: "2026-08-01T23:59:59.000Z" });
    expect(parsed.expiresAt).toEqual(new Date("2026-08-01T23:59:59.000Z"));
    expect(parseCouponInput({ expiresAt: null }).expiresAt).toBeNull();
  });

  it("recusa data de expiração inválida", () => {
    expect(() => parseCouponInput({ expiresAt: "amanhã" })).toThrow("Data de expiração inválida.");
  });
});
