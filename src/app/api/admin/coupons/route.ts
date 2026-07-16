import { NextRequest, NextResponse } from "next/server";
import { requireAdminApi } from "@/lib/admin";
import { prisma } from "@/lib/prisma";
import { CouponInputError, parseCouponInput } from "@/lib/coupon-input";
import { couponReport } from "@/lib/coupon-report";

export async function GET() {
  const { session, response } = await requireAdminApi();
  if (!session) return response!;

  const [coupons, report] = await Promise.all([
    prisma.coupon.findMany({ orderBy: { createdAt: "desc" } }),
    couponReport(),
  ]);

  return NextResponse.json({ coupons, report });
}

export async function POST(req: NextRequest) {
  const { session, response } = await requireAdminApi();
  if (!session) return response!;

  let input;
  try {
    input = parseCouponInput(await req.json());
  } catch (err) {
    if (err instanceof CouponInputError) {
      return NextResponse.json({ error: err.message }, { status: 400 });
    }
    return NextResponse.json({ error: "Dados inválidos." }, { status: 400 });
  }

  if (!input.code) {
    return NextResponse.json({ error: "Código do cupom é obrigatório." }, { status: 400 });
  }
  if (!input.influencerName) {
    return NextResponse.json({ error: "Nome do influenciador é obrigatório." }, { status: 400 });
  }

  const existing = await prisma.coupon.findUnique({ where: { code: input.code } });
  if (existing) {
    return NextResponse.json({ error: "Já existe um cupom com esse código." }, { status: 409 });
  }

  const coupon = await prisma.coupon.create({
    // Os campos não enviados caem nos defaults do schema (R$2,00 / R$4,00, sem
    // expiração, sem limite de usos), preservando o comportamento antigo.
    data: { ...input, code: input.code, influencerName: input.influencerName },
  });

  return NextResponse.json({ coupon });
}
