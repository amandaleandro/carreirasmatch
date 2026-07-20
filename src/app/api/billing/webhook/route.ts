import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getPayment, getPreapproval } from "@/lib/mercadopago";
import { isValidMercadoPagoSignature } from "@/lib/webhook-secret";
import { registerCouponUsage } from "@/lib/coupons";
import {
  sendPaymentConfirmationEmail,
  sendSubscriptionConfirmationEmail,
  sendPaymentFailedEmail,
  sendSubscriptionCancelledEmail,
  sendOnce,
  notifyAdminPurchase,
} from "@/lib/resend";
import { normalizeCareerSegment } from "@/lib/career-segments";
import { isPeriodPlanKind, PERIOD_PLAN_DAYS, grantSubscriptionPeriod, periodPlanProductName } from "@/lib/billing-plans";
import { grantScreeningCredits } from "@/lib/company-billing";
import { grantPartnerCredits } from "@/lib/partner-billing";

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
    if (!payment) {
      // Pode ser um pagamento de empresa (compra de créditos de triagem).
      const companyPayment = await prisma.companyPayment.findUnique({ where: { mpPaymentId: dataId } });
      if (companyPayment) {
        const mpPayment = await getPayment(dataId);
        if (mpPayment.status === "approved") {
          // Idempotente: grantScreeningCredits só credita na primeira transição
          // (retorna o novo saldo; null se já estava pago). Avisa o admin só na
          // primeira vez, para não duplicar em reenvios do webhook.
          const balance = await grantScreeningCredits(companyPayment.id);
          if (balance !== null) {
            void notifyAdminPurchase({
              product: `${companyPayment.credits} triagens (empresa)`,
              amountCents: companyPayment.amount,
              email: null,
            });
          }
        } else if (
          (mpPayment.status === "rejected" || mpPayment.status === "cancelled") &&
          companyPayment.status === "pending"
        ) {
          await prisma.companyPayment.update({
            where: { id: companyPayment.id },
            data: { status: "cancelled" },
          });
        }
      }
      // Pode ser um pagamento de parceiro (compra de créditos de anúncio).
      const partnerPayment = await prisma.partnerPayment.findUnique({ where: { mpPaymentId: dataId } });
      if (partnerPayment) {
        const mpPayment = await getPayment(dataId);
        if (mpPayment.status === "approved") {
          const balance = await grantPartnerCredits(partnerPayment.id);
          if (balance !== null) {
            void notifyAdminPurchase({
              product: `${partnerPayment.credits} destaques de curso (parceiro)`,
              amountCents: partnerPayment.amount,
              email: null,
            });
          }
        } else if (
          (mpPayment.status === "rejected" || mpPayment.status === "cancelled") &&
          partnerPayment.status === "pending"
        ) {
          await prisma.partnerPayment.update({
            where: { id: partnerPayment.id },
            data: { status: "cancelled" },
          });
        }
      }
      return NextResponse.json({ ok: true });
    }

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
    // O PIX nasce "pending" e só confirma aqui, então é este o ponto que conta o
    // resgate do cupom para essas vendas. No cartão o Payment já nasce "paid" e a
    // rota síncrona contou; a checagem de transição evita contar duas vezes.
    if (status === "paid" && payment.status !== "paid") {
      await registerCouponUsage(payment.couponId);
    }

    if (status === "paid" && payment.status !== "paid" && payment.kind !== "subscription") {
      const email = await userEmail(payment.userId);

      if (isPeriodPlanKind(payment.kind)) {
        // Plano por período pago no PIX: concede/estende o acesso agora.
        const segment = normalizeCareerSegment(payment.segment) ?? "career_pro";
        const currentPeriodEnd = await grantSubscriptionPeriod(
          payment.userId,
          segment,
          PERIOD_PLAN_DAYS[payment.kind],
          payment.id
        );
        if (email) void sendSubscriptionConfirmationEmail(email, { currentPeriodEnd });
        void notifyAdminPurchase({ product: periodPlanProductName(payment.kind), amountCents: payment.amount, email });
        await prisma.funnelEvent.create({
          data: {
            name: "subscription_confirmed",
            userId: payment.userId,
            paymentId: payment.id,
            segment: payment.segment,
            sessionId: payment.sessionId,
            source: payment.source,
            medium: payment.medium,
            campaign: payment.campaign,
            content: payment.content,
            properties: JSON.stringify({ kind: payment.kind, amountCents: payment.amount }),
          },
        });
      } else {
        if (email) void sendPaymentConfirmationEmail(email, { kind: payment.kind, amountCents: payment.amount });
        void notifyAdminPurchase({
          product: payment.kind === "diagnostic" ? "Diagnóstico completo" : "Primeira análise",
          amountCents: payment.amount,
          email,
        });
        await prisma.funnelEvent.create({
          data: {
            name: "payment_confirmed",
            userId: payment.userId,
            analysisId: payment.analysisId,
            paymentId: payment.id,
            segment: payment.segment,
            sessionId: payment.sessionId,
            source: payment.source,
            medium: payment.medium,
            campaign: payment.campaign,
            content: payment.content,
            properties: JSON.stringify({ kind: payment.kind, amountCents: payment.amount }),
          },
        });

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
    }

    // Transição para "cancelled" (Pix expirado/recusado): avisa o cliente uma vez.
    if (status === "cancelled" && payment.status !== "cancelled" && payment.kind !== "subscription") {
      const email = await userEmail(payment.userId);
      if (email) {
        void sendOnce("payment_failed", payment.mpPaymentId, email, () =>
          sendPaymentFailedEmail(email, { kind: payment.kind, amountCents: payment.amount })
        );
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
      if (!wasPaid) await registerCouponUsage(payment.couponId);

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
        void notifyAdminPurchase({ product: "Assinatura mensal", amountCents: payment.amount, email });
        await prisma.funnelEvent.create({
          data: {
            name: "subscription_confirmed",
            userId: payment.userId,
            paymentId: payment.id,
            segment: payment.segment,
            sessionId: payment.sessionId,
            source: payment.source,
            medium: payment.medium,
            campaign: payment.campaign,
            content: payment.content,
            properties: JSON.stringify({ kind: "subscription", amountCents: payment.amount }),
          },
        });
      }
    } else if (status === "cancelled" && payment.status !== "cancelled") {
      // Assinatura cancelada no Mercado Pago: reflete no nosso registro e avisa
      // o cliente (uma vez). O acesso já concedido segue até currentPeriodEnd.
      await prisma.subscription.updateMany({
        where: { userId: payment.userId, status: { not: "cancelled" } },
        data: { status: "cancelled" },
      });
      const email = await userEmail(payment.userId);
      if (email) {
        void sendOnce("subscription_cancelled", payment.mpPaymentId, email, () =>
          sendSubscriptionCancelledEmail(email)
        );
      }
    }
  }

  return NextResponse.json({ ok: true });
}
