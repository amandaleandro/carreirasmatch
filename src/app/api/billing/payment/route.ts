import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { createPayment } from "@/lib/mercadopago";
import { parseBRLToCents } from "@/lib/pricing";
import { CAREER_OFFER_BY_SEGMENT } from "@/lib/career-offers";
import { isCareerSegment, normalizeCareerSegment } from "@/lib/career-segments";
import { isValidEmail, normalizeEmail } from "@/lib/email";
import { applyCoupon, registerCouponUsage } from "@/lib/coupons";
import {
  sendPaymentConfirmationEmail,
  sendSubscriptionConfirmationEmail,
  sendPaymentFailedEmail,
  sendOnce,
  notifyAdminPurchase,
} from "@/lib/resend";
import { notifyAdminPurchaseWhatsapp } from "@/lib/evolution";
import {
  isPeriodPlanKind,
  periodPlanAmountCents,
  periodPlanProductName,
  PERIOD_PLAN_DAYS,
  grantSubscriptionPeriod,
} from "@/lib/billing-plans";

// Segmento default para pagamento avulso sem login. O preço do avulso
// (first_analysis/diagnostic) é uniforme entre todos os segmentos, então esse
// default nunca muda o valor cobrado, só rotula o Payment enquanto o usuário
// não escolhe o segmento real no cadastro.
const DEFAULT_ANON_SEGMENT = "career_pro";

export async function POST(req: NextRequest) {
  const session = await auth();
  const { kind, analysisId, formData, couponCode, segment: requestedSegment, attribution } = await req.json();
  const tracking = {
    sessionId: typeof attribution?.sessionId === "string" ? attribution.sessionId.slice(0, 100) : "",
    source: typeof attribution?.source === "string" ? attribution.source.slice(0, 120) : "",
    medium: typeof attribution?.medium === "string" ? attribution.medium.slice(0, 120) : "",
    campaign: typeof attribution?.campaign === "string" ? attribution.campaign.slice(0, 200) : "",
    content: typeof attribution?.content === "string" ? attribution.content.slice(0, 200) : "",
  };

  const isPeriodPlan = typeof kind === "string" && isPeriodPlanKind(kind);
  if (kind !== "first_analysis" && kind !== "diagnostic" && !isPeriodPlan) {
    return NextResponse.json({ error: "Tipo de cobrança inválido." }, { status: 400 });
  }
  if (!formData || typeof formData !== "object") {
    return NextResponse.json({ error: "Dados de pagamento ausentes." }, { status: 400 });
  }

  const isLoggedIn = Boolean(session?.user?.id);

  // Diagnóstico desbloqueia uma análise específica: valida existência e posse.
  // - Logado: precisa ser dono da análise.
  // - Anônimo: a análise precisa estar SEM dono (pode reivindicá-la ao pagar).
  let analysisRecord: { resumeId: string; resume: { userId: string | null } } | null = null;
  if (kind === "diagnostic") {
    if (typeof analysisId !== "string" || !analysisId) {
      return NextResponse.json({ error: "Análise não informada." }, { status: 400 });
    }
    analysisRecord = await prisma.analysis.findUnique({
      where: { id: analysisId },
      select: { resumeId: true, resume: { select: { userId: true } } },
    });
    if (!analysisRecord) {
      return NextResponse.json({ error: "Análise não encontrada." }, { status: 404 });
    }
    if (isLoggedIn) {
      if (analysisRecord.resume.userId !== session!.user.id) {
        return NextResponse.json({ error: "Análise não encontrada." }, { status: 404 });
      }
    } else if (analysisRecord.resume.userId) {
      // Já pertence a uma conta, não dá para desbloquear anonimamente.
      return NextResponse.json(
        { error: "Faça login para desbloquear esta análise." },
        { status: 401 }
      );
    }
  }

  const email = normalizeEmail(session?.user?.email ?? formData.payer?.email);
  if (!isValidEmail(email)) {
    return NextResponse.json(
      { error: "Informe um e-mail válido para continuar." },
      { status: 400 }
    );
  }

  let userId = session?.user?.id ?? null;
  const existingUser = userId
    ? await prisma.user.findUnique({ where: { id: userId }, select: { careerSegment: true } })
    : await prisma.user.findUnique({ where: { email }, select: { id: true, careerSegment: true } });

  const segment =
    normalizeCareerSegment(existingUser?.careerSegment) ??
    (typeof requestedSegment === "string" && isCareerSegment(requestedSegment) ? requestedSegment : null) ??
    DEFAULT_ANON_SEGMENT;

  // Cria/recupera o usuário pelo e-mail quando anônimo (mesmo padrão da assinatura).
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
  // gerou os pagamentos duplicados vistos no admin). Diagnóstico também trava
  // por analysisId, já que a mesma análise não pode ser paga duas vezes.
  const duplicateWindow = new Date(Date.now() - 2 * 60 * 1000);
  const recentDuplicate = await prisma.payment.findFirst({
    where: {
      userId,
      kind,
      status: { in: ["paid", "pending"] },
      createdAt: { gte: duplicateWindow },
      ...(kind === "diagnostic" ? { analysisId } : {}),
    },
    orderBy: { createdAt: "desc" },
  });
  if (recentDuplicate) {
    return NextResponse.json({
      status: recentDuplicate.status === "paid" ? "approved" : "pending",
      statusDetail: recentDuplicate.status,
      pix: null,
      ...(isLoggedIn ? {} : { registerUrl: `/register?email=${encodeURIComponent(email)}` }),
    });
  }

  const offer = CAREER_OFFER_BY_SEGMENT[segment];
  let baseAmountCents: number;
  let productName: string;
  if (isPeriodPlan) {
    baseAmountCents = periodPlanAmountCents(segment, kind);
    productName = periodPlanProductName(kind);
  } else if (kind === "first_analysis") {
    baseAmountCents = parseBRLToCents(offer.firstAnalysisPrice);
    productName = "Primeira Análise";
  } else {
    baseAmountCents = parseBRLToCents(offer.diagnosticPrice);
    productName = offer.launchOffer;
  }
  // Planos por período usam o desconto de assinatura do cupom.
  const couponKind = isPeriodPlan ? "subscription" : kind;

  let amountCents = baseAmountCents;
  let discountCents = 0;
  let couponId: string | null = null;
  if (typeof couponCode === "string" && couponCode.trim()) {
    try {
      const result = await applyCoupon(couponCode, couponKind, baseAmountCents);
      amountCents = result.amountCents;
      discountCents = result.discountCents;
      couponId = result.couponId;
    } catch (err) {
      return NextResponse.json(
        { error: err instanceof Error ? err.message : "Cupom inválido." },
        { status: 400 }
      );
    }
  }

  const payerIdentification =
    typeof formData.payer?.identification?.type === "string" &&
    typeof formData.payer?.identification?.number === "string"
      ? {
          type: formData.payer.identification.type,
          number: formData.payer.identification.number,
        }
      : undefined;

  let result;
  try {
    result = await createPayment({
      transactionAmount: amountCents / 100,
      description: productName,
      token: typeof formData.token === "string" ? formData.token : undefined,
      paymentMethodId: typeof formData.payment_method_id === "string" ? formData.payment_method_id : undefined,
      issuerId:
        typeof formData.issuer_id === "string" || typeof formData.issuer_id === "number"
          ? Number(formData.issuer_id)
          : undefined,
      installments: typeof formData.installments === "number" ? formData.installments : undefined,
      payerEmail: email,
      payerIdentification,
      externalReference: `${userId}:${kind}`,
    });
  } catch (err) {
    return NextResponse.json(
      { error: err instanceof Error ? err.message : "Erro ao processar pagamento." },
      { status: 400 }
    );
  }

  const status = result.status === "approved" ? "paid" : result.status === "rejected" ? "cancelled" : "pending";

  const payment = await prisma.payment.create({
    data: {
      userId,
      kind,
      segment,
      amount: amountCents,
      discountCents,
      status,
      mpPaymentId: String(result.id),
      analysisId: kind === "diagnostic" ? analysisId : null,
      couponId,
      paidAt: status === "paid" ? new Date() : null,
      ...tracking,
    },
  });

  if (status === "paid") {
    await registerCouponUsage(couponId);
    // Aprovação síncrona (cartão): reivindica a análise sem dono para o usuário,
    // senão ele não conseguiria vê-la em /report após o cadastro. Para PIX
    // (pending), isso acontece no webhook quando o pagamento confirma.
    if (kind === "diagnostic" && analysisRecord && analysisRecord.resume.userId == null) {
      await prisma.resume.update({ where: { id: analysisRecord.resumeId }, data: { userId } });
    }
    // E-mail de confirmação no caminho síncrono (cartão). No PIX o Payment nasce
    // "pending" e o e-mail sai no webhook, o guard de lá evita envio duplicado.
    if (isPeriodPlan) {
      const currentPeriodEnd = await grantSubscriptionPeriod(userId, segment, PERIOD_PLAN_DAYS[kind], payment.id);
      void sendSubscriptionConfirmationEmail(email, { currentPeriodEnd });
    } else {
      void sendPaymentConfirmationEmail(email, { kind, amountCents });
    }
    void notifyAdminPurchase({ product: productName, amountCents, email });
    void notifyAdminPurchaseWhatsapp({ product: productName, amountCents, email });
    await prisma.funnelEvent.create({
      data: {
        name: isPeriodPlan ? "subscription_confirmed" : "payment_confirmed",
        userId,
        analysisId: kind === "diagnostic" ? analysisId : null,
        paymentId: payment.id,
        segment,
        ...tracking,
        properties: JSON.stringify({ kind, amountCents }),
      },
    });
  } else if (status === "cancelled") {
    // Cartão recusado no caminho síncrono: avisa o cliente com uma via alternativa.
    // sendOnce (chaveado pelo mpPaymentId) evita duplicar caso o webhook também dispare.
    void sendOnce("payment_failed", payment.mpPaymentId, email, () =>
      sendPaymentFailedEmail(email, { kind, amountCents })
    );
  }

  return NextResponse.json({
    status: result.status,
    statusDetail: result.statusDetail,
    pix: result.pix,
    ...(isLoggedIn ? {} : { registerUrl: `/register?email=${encodeURIComponent(email)}` }),
  });
}
