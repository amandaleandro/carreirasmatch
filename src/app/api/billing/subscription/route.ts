import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { applyCoupon, registerCouponUsage } from "@/lib/coupons";
import { CAREER_OFFER_BY_SEGMENT } from "@/lib/career-offers";
import { isCareerSegment, normalizeCareerSegment } from "@/lib/career-segments";
import { isValidEmail, normalizeEmail } from "@/lib/email";
import { sendSubscriptionConfirmationEmail, notifyAdminPurchase } from "@/lib/resend";
import { notifyAdminPurchaseWhatsapp } from "@/lib/evolution";
import { createPreapproval } from "@/lib/mercadopago";
import { parseBRLToCents } from "@/lib/pricing";
import { NextRequest, NextResponse } from "next/server";

function getAppUrl(req: NextRequest) {
  return process.env.APP_URL ?? req.nextUrl.origin;
}

export async function POST(req: NextRequest) {
  const session = await auth();
  const { token, couponCode, payerEmail, segment: requestedSegment, attribution } = await req.json();
  const tracking = {
    sessionId: typeof attribution?.sessionId === "string" ? attribution.sessionId.slice(0, 100) : "",
    source: typeof attribution?.source === "string" ? attribution.source.slice(0, 120) : "",
    medium: typeof attribution?.medium === "string" ? attribution.medium.slice(0, 120) : "",
    campaign: typeof attribution?.campaign === "string" ? attribution.campaign.slice(0, 200) : "",
    content: typeof attribution?.content === "string" ? attribution.content.slice(0, 200) : "",
  };

  if (typeof token !== "string" || !token) {
    return NextResponse.json({ error: "Dados de cartão ausentes." }, { status: 400 });
  }

  const email = normalizeEmail(session?.user?.email ?? payerEmail);
  if (!isValidEmail(email)) {
    return NextResponse.json({ error: "Informe um e-mail válido para continuar." }, { status: 400 });
  }

  let userId = session?.user?.id ?? null;
  const existingUser = userId
    ? await prisma.user.findUnique({ where: { id: userId }, select: { careerSegment: true } })
    : await prisma.user.findUnique({ where: { email }, select: { id: true, careerSegment: true } });

  const segment =
    normalizeCareerSegment(existingUser?.careerSegment) ??
    (typeof requestedSegment === "string" && isCareerSegment(requestedSegment) ? requestedSegment : null);

  if (!segment) {
    return NextResponse.json({ error: "Selecione seu momento de carreira antes de continuar." }, { status: 400 });
  }

  if (!userId) {
    const user = await prisma.user.upsert({
      where: { email },
      create: { email, careerSegment: segment },
      update: { careerSegment: existingUser?.careerSegment ? undefined : segment },
      select: { id: true },
    });
    userId = user.id;
  }

  // Duplo clique / retry de rede reenviam o mesmo form: sem essa trava, cada
  // POST cobra de novo no Mercado Pago e cria outro Payment igual (foi o que
  // gerou os pagamentos duplicados vistos no admin).
  const duplicateWindow = new Date(Date.now() - 2 * 60 * 1000);
  const recentDuplicate = await prisma.payment.findFirst({
    where: {
      userId,
      kind: "subscription",
      segment,
      status: { in: ["paid", "pending"] },
      createdAt: { gte: duplicateWindow },
    },
    orderBy: { createdAt: "desc" },
  });
  if (recentDuplicate) {
    return NextResponse.json({
      status: recentDuplicate.status === "paid" ? "authorized" : "pending",
      registerUrl: `/register?email=${encodeURIComponent(email)}`,
    });
  }

  const offer = CAREER_OFFER_BY_SEGMENT[segment];
  const baseAmountCents = parseBRLToCents(offer.monthlyPrice);

  let amountCents = baseAmountCents;
  let discountCents = 0;
  let couponId: string | null = null;
  if (typeof couponCode === "string" && couponCode.trim()) {
    try {
      const result = await applyCoupon(couponCode, "subscription", baseAmountCents);
      amountCents = result.amountCents;
      discountCents = result.discountCents;
      couponId = result.couponId;
    } catch (err) {
      return NextResponse.json({ error: err instanceof Error ? err.message : "Cupom inválido." }, { status: 400 });
    }
  }

  let result;
  try {
    result = await createPreapproval({
      cardTokenId: token,
      transactionAmount: amountCents / 100,
      reason: offer.monthlyName,
      payerEmail: email,
      externalReference: `${userId}:subscription`,
      backUrl: session?.user?.id
        ? `${getAppUrl(req)}/settings`
        : `${getAppUrl(req)}/register?email=${encodeURIComponent(email)}`,
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
      userId,
      kind: "subscription",
      segment,
      amount: amountCents,
      discountCents,
      status,
      mpPaymentId: result.id,
      couponId,
      paidAt: status === "paid" ? new Date() : null,
      ...tracking,
    },
  });

  if (status === "paid") {
    const currentPeriodEnd = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000);
    await prisma.subscription.upsert({
      where: { userId },
      create: { userId, segment, planKey: "complete", status: "active", currentPeriodEnd, lastPaymentId: payment.id },
      update: { segment, planKey: "complete", status: "active", currentPeriodEnd, lastPaymentId: payment.id },
    });
    await registerCouponUsage(couponId);
    // E-mail no caminho síncrono (assinatura autorizada na hora). No caminho
    // assíncrono o e-mail sai no webhook, com guard para não duplicar.
    void sendSubscriptionConfirmationEmail(email, { currentPeriodEnd });
    void notifyAdminPurchase({ product: offer.monthlyName, amountCents, email });
    void notifyAdminPurchaseWhatsapp({ product: offer.monthlyName, amountCents, email });
    await prisma.funnelEvent.create({
      data: {
        name: "subscription_confirmed",
        userId,
        paymentId: payment.id,
        segment,
        ...tracking,
        properties: JSON.stringify({ kind: "subscription", amountCents }),
      },
    });
  }

  return NextResponse.json({
    status: result.status,
    registerUrl: `/register?email=${encodeURIComponent(email)}`,
  });
}
