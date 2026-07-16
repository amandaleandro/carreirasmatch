import { normalizeCouponCode } from "@/lib/coupons";

export class CouponInputError extends Error {}

type Body = Record<string, unknown>;

/** Campos aceitos do admin, já validados e prontos para o Prisma. `undefined` = não enviado (PATCH parcial). */
export type ParsedCouponInput = {
  code?: string;
  influencerName?: string;
  active?: boolean;
  discountType?: "fixed" | "percent";
  oneOffDiscountCents?: number;
  subscriptionDiscountCents?: number;
  oneOffDiscountPercent?: number;
  subscriptionDiscountPercent?: number;
  commissionPercent?: number;
  expiresAt?: Date | null;
  maxRedemptions?: number | null;
};

function intField(body: Body, key: string, min: number, max: number): number | undefined {
  const raw = body[key];
  if (raw === undefined) return undefined;
  if (typeof raw !== "number" || !Number.isFinite(raw)) {
    throw new CouponInputError(`Campo '${key}' deve ser um número.`);
  }
  const value = Math.round(raw);
  if (value < min || value > max) {
    throw new CouponInputError(`Campo '${key}' deve estar entre ${min} e ${max}.`);
  }
  return value;
}

/** Como intField, mas `null` (ou string vazia) é um valor válido e significa "sem limite". */
function nullableIntField(body: Body, key: string, min: number, max: number): number | null | undefined {
  const raw = body[key];
  if (raw === undefined) return undefined;
  if (raw === null || raw === "") return null;
  return intField(body, key, min, max);
}

export function parseCouponInput(body: Body): ParsedCouponInput {
  const parsed: ParsedCouponInput = {};

  if (body.code !== undefined) {
    if (typeof body.code !== "string" || !body.code.trim()) {
      throw new CouponInputError("Código do cupom é obrigatório.");
    }
    parsed.code = normalizeCouponCode(body.code);
  }

  if (body.influencerName !== undefined) {
    if (typeof body.influencerName !== "string" || !body.influencerName.trim()) {
      throw new CouponInputError("Nome do influenciador é obrigatório.");
    }
    parsed.influencerName = body.influencerName.trim();
  }

  if (body.active !== undefined) {
    if (typeof body.active !== "boolean") {
      throw new CouponInputError("Campo 'active' deve ser booleano.");
    }
    parsed.active = body.active;
  }

  if (body.discountType !== undefined) {
    if (body.discountType !== "fixed" && body.discountType !== "percent") {
      throw new CouponInputError("Tipo de desconto deve ser 'fixed' ou 'percent'.");
    }
    parsed.discountType = body.discountType;
  }

  const oneOffCents = intField(body, "oneOffDiscountCents", 0, 1_000_000);
  if (oneOffCents !== undefined) parsed.oneOffDiscountCents = oneOffCents;

  const subCents = intField(body, "subscriptionDiscountCents", 0, 1_000_000);
  if (subCents !== undefined) parsed.subscriptionDiscountCents = subCents;

  const oneOffPercent = intField(body, "oneOffDiscountPercent", 0, 100);
  if (oneOffPercent !== undefined) parsed.oneOffDiscountPercent = oneOffPercent;

  const subPercent = intField(body, "subscriptionDiscountPercent", 0, 100);
  if (subPercent !== undefined) parsed.subscriptionDiscountPercent = subPercent;

  const commission = intField(body, "commissionPercent", 0, 100);
  if (commission !== undefined) parsed.commissionPercent = commission;

  const maxRedemptions = nullableIntField(body, "maxRedemptions", 1, 1_000_000);
  if (maxRedemptions !== undefined) parsed.maxRedemptions = maxRedemptions;

  if (body.expiresAt !== undefined) {
    if (body.expiresAt === null || body.expiresAt === "") {
      parsed.expiresAt = null;
    } else {
      if (typeof body.expiresAt !== "string") {
        throw new CouponInputError("Data de expiração inválida.");
      }
      const date = new Date(body.expiresAt);
      if (Number.isNaN(date.getTime())) {
        throw new CouponInputError("Data de expiração inválida.");
      }
      parsed.expiresAt = date;
    }
  }

  return parsed;
}
