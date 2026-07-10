import { NextRequest, NextResponse } from "next/server";
import { requireAdminApi } from "@/lib/admin";
import { prisma } from "@/lib/prisma";
import { normalizeCouponCode } from "@/lib/coupons";

export async function GET() {
  const { session, response } = await requireAdminApi();
  if (!session) return response!;

  const coupons = await prisma.coupon.findMany({
    orderBy: { createdAt: "desc" },
  });

  return NextResponse.json({ coupons });
}

export async function POST(req: NextRequest) {
  const { session, response } = await requireAdminApi();
  if (!session) return response!;

  const { code, influencerName, oneOffDiscountCents, subscriptionDiscountCents } = await req.json();

  if (typeof code !== "string" || !code.trim()) {
    return NextResponse.json({ error: "Código do cupom é obrigatório." }, { status: 400 });
  }
  if (typeof influencerName !== "string" || !influencerName.trim()) {
    return NextResponse.json({ error: "Nome do influenciador é obrigatório." }, { status: 400 });
  }

  const normalizedCode = normalizeCouponCode(code);
  const existing = await prisma.coupon.findUnique({ where: { code: normalizedCode } });
  if (existing) {
    return NextResponse.json({ error: "Já existe um cupom com esse código." }, { status: 409 });
  }

  const coupon = await prisma.coupon.create({
    data: {
      code: normalizedCode,
      influencerName: influencerName.trim(),
      oneOffDiscountCents:
        typeof oneOffDiscountCents === "number" && oneOffDiscountCents >= 0 ? Math.round(oneOffDiscountCents) : 200,
      subscriptionDiscountCents:
        typeof subscriptionDiscountCents === "number" && subscriptionDiscountCents >= 0
          ? Math.round(subscriptionDiscountCents)
          : 400,
    },
  });

  return NextResponse.json({ coupon });
}
