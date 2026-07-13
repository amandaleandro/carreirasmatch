import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getPayment, getPreapproval } from "@/lib/mercadopago";
import { isValidMercadoPagoSignature } from "@/lib/webhook-secret";
import { sendPaymentConfirmationEmail, sendSubscriptionConfirmationEmail } from "@/lib/resend";

async function userEmail(userId: string): Promise<string | null> {
  const user = await prisma.user.findUnique({ where: { id: userId }, select: { email: true } });
  return user?.email ?? null;
}

const SUBSCRIPTION_PERIOD_DAYS = 30;

export async function POST(req: NextRequest) {
  const dataId = req.nextUrl.searchParams.get("data.id");
  const type = req.nextUrl.searchParams.get("type") ?? req.nextUrl.searchParams.get("topic");

  const valid = isValidMercadoPagoSignature({
    xSignature: req.headers.get("x-signature"),
    xRequestId: req.headers.get("x-request-id"),
    dataId,
    secret: process.env.MERCADOPAGO_WEBHOOK_SECRET,
  });
  if (!valid) {
    return NextResponse.json({ error: "Assinatura inválida." }, { status: 401 });
  }
  if (!dataId) return NextResponse.json({ ok: true });

  if (type === "payment") {
    const payment = await prisma.payment.findUnique({ where: { mpPaymentId: dataId } });
    if (!payment) return NextResponse.json({ ok: true });

    const mpPayment = await getPayment(dataId);
    const status =
      mpPayment.status === "approved"
        ? "paid"
        : mpPayment.status === "rejected"
          ? "cancelled"
          : mpPayment.status === "refunded" || mpPayment.status === "charged_back"
            ? "refunded"
            : "pending";

    await prisma.payment.update({
      where: { id: payment.id },
      data: { status, paidAt: status === "paid" ? new Date() : payment.paidAt },
    });

    // Só age na transição para "paid" (o webhook pode reenviar o mesmo evento).
    if (status === "paid" && payment.status !== "paid" && payment.kind !== "subscription") {
      const email = await userEmail(payment.userId);
      if (email) void sendPaymentConfirmationEmail(email, { kind: payment.kind, amountCents: payment.amount });

      // PIX/confirmação assíncrona de avulso anônimo: reivindica a análise sem
      // dono para o usuário criado no momento do pagamento (ver payment/route.ts).
      if (payment.kind === "diagnostic" && payment.analysisId) {
        const analysis = await prisma.analysis.findUnique({
          where: { id: payment.analysisId },
          select: { resumeId: true, resume: { select: { userId: true } } },
        });
        if (analysis && analysis.resume.userId == null) {
          await prisma.resume.update({ where: { id: analysis.resumeId }, data: { userId: payment.userId } });
        }
      }
    }
  } else if (type === "subscription_preapproval") {
    const payment = await prisma.payment.findUnique({ where: { mpPaymentId: dataId } });
    if (!payment) return NextResponse.json({ ok: true });

    const preapproval = await getPreapproval(dataId);
    const status =
      preapproval.status === "authorized" ? "paid" : preapproval.status === "cancelled" ? "cancelled" : "pending";

    const wasPaid = payment.status === "paid";

    await prisma.payment.update({
      where: { id: payment.id },
      data: { status, paidAt: status === "paid" ? new Date() : payment.paidAt },
    });

    if (status === "paid") {
      const currentPeriodEnd = new Date(Date.now() + SUBSCRIPTION_PERIOD_DAYS * 24 * 60 * 60 * 1000);
      await prisma.subscription.upsert({
        where: { userId: payment.userId },
        create: {
          userId: payment.userId,
          segment: payment.segment,
          status: "active",
          currentPeriodEnd,
          lastPaymentId: payment.id,
        },
        update: {
          segment: payment.segment,
          status: "active",
          currentPeriodEnd,
          lastPaymentId: payment.id,
        },
      });

      if (!wasPaid) {
        const email = await userEmail(payment.userId);
        if (email) void sendSubscriptionConfirmationEmail(email, { currentPeriodEnd });
      }
    }
  }

  return NextResponse.json({ ok: true });
}
