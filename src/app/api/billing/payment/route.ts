import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { createPayment } from "@/lib/mercadopago";
import { parseBRLToCents } from "@/lib/pricing";
import { CAREER_OFFER_BY_SEGMENT } from "@/lib/career-offers";
import { isCareerSegment, normalizeCareerSegment } from "@/lib/career-segments";
import { isValidEmail, normalizeEmail } from "@/lib/email";
import { applyCoupon, registerCouponUsage } from "@/lib/coupons";

// Segmento default para pagamento avulso sem login. O preço do avulso
// (first_analysis/diagnostic) é uniforme entre todos os segmentos, então esse
// default nunca muda o valor cobrado — só rotula o Payment enquanto o usuário
// não escolhe o segmento real no cadastro.
const DEFAULT_ANON_SEGMENT = "career_pro";

export async function POST(req: NextRequest) {
  const session = await auth();
  const { kind, analysisId, formData, couponCode, segment: requestedSegment } = await req.json();

  if (kind !== "first_analysis" && kind !== "diagnostic") {
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
      // Já pertence a uma conta — não dá para desbloquear anonimamente.
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

  const offer = CAREER_OFFER_BY_SEGMENT[segment];
  const priceLabel = kind === "first_analysis" ? offer.firstAnalysisPrice : offer.diagnosticPrice;
  const productName = kind === "first_analysis" ? "Primeira Análise" : offer.launchOffer;
  const baseAmountCents = parseBRLToCents(priceLabel);

  let amountCents = baseAmountCents;
  let couponId: string | null = null;
  if (typeof couponCode === "string" && couponCode.trim()) {
    try {
      const result = await applyCoupon(couponCode, kind, baseAmountCents);
      amountCents = result.amountCents;
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

  await prisma.payment.create({
    data: {
      userId,
      kind,
      segment,
      amount: amountCents,
      status,
      mpPaymentId: String(result.id),
      analysisId: kind === "diagnostic" ? analysisId : null,
      couponId,
      paidAt: status === "paid" ? new Date() : null,
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
  }

  return NextResponse.json({
    status: result.status,
    statusDetail: result.statusDetail,
    pix: result.pix,
    ...(isLoggedIn ? {} : { registerUrl: `/register?email=${encodeURIComponent(email)}` }),
  });
}
