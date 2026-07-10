import { NextRequest, NextResponse } from "next/server";
import { requireAuth } from "@/lib/require-auth";
import { prisma } from "@/lib/prisma";
import { createPayment } from "@/lib/mercadopago";
import { parseBRLToCents } from "@/lib/pricing";
import { CAREER_OFFER_BY_SEGMENT } from "@/lib/career-offers";
import { normalizeCareerSegment } from "@/lib/career-segments";
import { applyCoupon, registerCouponUsage } from "@/lib/coupons";

export async function POST(req: NextRequest) {
  const { session, response } = await requireAuth();
  if (!session) return response!;

  const { kind, analysisId, formData, couponCode } = await req.json();
  if (kind !== "first_analysis" && kind !== "diagnostic") {
    return NextResponse.json({ error: "Tipo de cobrança inválido." }, { status: 400 });
  }
  if (!formData || typeof formData !== "object") {
    return NextResponse.json({ error: "Dados de pagamento ausentes." }, { status: 400 });
  }

  if (kind === "diagnostic") {
    if (typeof analysisId !== "string" || !analysisId) {
      return NextResponse.json({ error: "Análise não informada." }, { status: 400 });
    }
    const analysis = await prisma.analysis.findUnique({
      where: { id: analysisId },
      include: { resume: true },
    });
    if (!analysis || analysis.resume.userId !== session.user.id) {
      return NextResponse.json({ error: "Análise não encontrada." }, { status: 404 });
    }
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

  const payerEmail = formData.payer?.email ?? session.user.email;
  if (!payerEmail) {
    return NextResponse.json({ error: "E-mail do usuário não encontrado." }, { status: 400 });
  }

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
      payerEmail,
      externalReference: `${session.user.id}:${kind}`,
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
      userId: session.user.id,
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
  }

  return NextResponse.json({
    status: result.status,
    statusDetail: result.statusDetail,
    pix: result.pix,
  });
}
