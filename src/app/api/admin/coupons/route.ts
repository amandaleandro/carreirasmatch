import { NextRequest, NextResponse } from "next/server";
import { requireAdminApi } from "@/lib/admin";
import { prisma } from "@/lib/prisma";
import { CouponInputError, parseCouponInput } from "@/lib/coupon-input";
import { couponReport } from "@/lib/coupon-report";
import { CouponOwnerError, resolveCouponOwnerId } from "@/lib/coupon-owner";

export async function GET() {
  const { session, response } = await requireAdminApi();
  if (!session) return response!;

  const [coupons, report] = await Promise.all([
    prisma.coupon.findMany({
      orderBy: { createdAt: "desc" },
      include: {
        owner: { select: { email: true } },
        signups: {
          orderBy: { createdAt: "desc" },
          select: {
            id: true,
            name: true,
            email: true,
            createdAt: true,
            subscription: { select: { status: true, currentPeriodEnd: true } },
            payments: {
              where: { status: "paid" },
              select: { amount: true, kind: true },
            },
          },
        },
      },
    }),
    couponReport(),
  ]);

  // Achata o e-mail do dono para o front, sem expor o objeto de usuário inteiro.
  const shaped = coupons.map(({ owner, ...coupon }) => ({
    ...coupon,
    ownerEmail: owner?.email ?? null,
  }));

  return NextResponse.json({ coupons: shaped, report });
}

export async function POST(req: NextRequest) {
  const { session, response } = await requireAdminApi();
  if (!session) return response!;

  const body = await req.json();

  let input;
  try {
    input = parseCouponInput(body);
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

  let ownerUserId: string | null | undefined;
  try {
    ownerUserId = await resolveCouponOwnerId(body.ownerEmail, null);
  } catch (err) {
    if (err instanceof CouponOwnerError) {
      return NextResponse.json({ error: err.message }, { status: 400 });
    }
    throw err;
  }

  const coupon = await prisma.coupon.create({
    // Os campos não enviados caem nos defaults do schema (R$2,00 / R$4,00, sem
    // expiração, sem limite de usos), preservando o comportamento antigo.
    data: {
      ...input,
      code: input.code,
      influencerName: input.influencerName,
      ...(ownerUserId ? { ownerUserId } : {}),
    },
  });

  return NextResponse.json({ coupon });
}
