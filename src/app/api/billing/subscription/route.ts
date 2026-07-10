import { NextRequest, NextResponse } from "next/server";
import { requireAuth } from "@/lib/require-auth";
import { prisma } from "@/lib/prisma";
import { createPreapproval } from "@/lib/mercadopago";
import { parseBRLToCents } from "@/lib/pricing";
import { CAREER_OFFER_BY_SEGMENT } from "@/lib/career-offers";
import { normalizeCareerSegment } from "@/lib/career-segments";
import { applyCoupon, registerCouponUsage } from "@/lib/coupons";

function getAppUrl(req: NextRequest) {
  return process.env.APP_URL ?? req.nextUrl.origin;
}

export async function POST(req: NextRequest) {
  const { session, response } = await requireAuth();
  if (!session) return response!;

  const { token, couponCode } = await req.json();
  if (typeof token !== "string" || !token) {
    return NextResponse.json({ error: "Dados de cartão ausentes." }, { status: 400 });
  }

  const user = await prisma.user.findUnique({
    where: { id: session.user.id },
    select: { careerSegment: true },
  });

  const segment = normalizeCareerSegment(user?.careerSegment);
  if (!segment) {
    return NextResponse.json(
      { error: "Defina seu momento de carreira em Perfil antes de continuar." },
      { status: 400 }
    );
  }
  if (!session.user.email) {
    return NextResponse.json({ error: "E-mail do usuário não encontrado." }, { status: 400 });
  }

  const offer = CAREER_OFFER_BY_SEGMENT[segment];
  const baseAmountCents = parseBRLToCents(offer.monthlyPrice);

  let amountCents = baseAmountCents;
  let couponId: string | null = null;
  if (typeof couponCode === "string" && couponCode.trim()) {
    try {
      const result = await applyCoupon(couponCode, "subscription", baseAmountCents);
      amountCents = result.amountCents;
      couponId = result.couponId;
    } catch (err) {
      return NextResponse.json(
        { error: err instanceof Error ? err.message : "Cupom inválido." },
        { status: 400 }
      );
    }
  }

  const appUrl = getAppUrl(req);

  let result;
  try {
    result = await createPreapproval({
      cardTokenId: token,
      transactionAmount: amountCents / 100,
      reason: offer.monthlyName,
      payerEmail: session.user.email,
      externalReference: `${session.user.id}:subscription`,
      backUrl: `${appUrl}/settings`,
    });
  } catch (err) {
    return NextResponse.json(
      { error: err instanceof Error ? err.message : "Erro ao processar assinatura." },
      { status: 400 }
    );
  }

  const status = result.status === "authorized" ? "paid" : "pending";

  const payment = await prisma.payment.create({
    data: {
      userId: session.user.id,
      kind: "subscription",
      segment,
      amount: amountCents,
      status,
      mpPaymentId: result.id,
      couponId,
      paidAt: status === "paid" ? new Date() : null,
    },
  });

  if (status === "paid") {
    const currentPeriodEnd = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000);
    await prisma.subscription.upsert({
      where: { userId: session.user.id },
      create: { userId: session.user.id, segment, status: "active", currentPeriodEnd, lastPaymentId: payment.id },
      update: { segment, status: "active", currentPeriodEnd, lastPaymentId: payment.id },
    });
    await registerCouponUsage(couponId);
  }

  return NextResponse.json({ status: result.status });
}
