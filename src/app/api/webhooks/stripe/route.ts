import { NextRequest, NextResponse } from "next/server";
import type Stripe from "stripe";
import { stripe } from "@/lib/stripe";
import { prisma } from "@/lib/prisma";
import { normalizeCareerSegment } from "@/lib/career-segments";
import { grantSubscriptionPeriod, isPeriodPlanKind, PERIOD_PLAN_DAYS } from "@/lib/billing-plans";
import { registerCouponUsage } from "@/lib/coupons";
import { sendPaymentConfirmationEmail, sendSubscriptionConfirmationEmail, notifyAdminPurchase } from "@/lib/resend";
import { grantCredits, resolveCommercialProduct } from "@/lib/commercial-products";
import { COMMERCIAL_PLANS } from "@/lib/commercial-plan-catalog";

export const dynamic = "force-dynamic";

/**
 * Mapeia o webhook-chapter do blueprint:
 * - key: handle-checkout-completed
 * - events: checkout.session.completed
 */
export async function POST(req: NextRequest) {
  const signature = req.headers.get("stripe-signature");
  if (!signature) {
    return NextResponse.json({ error: "Assinatura Stripe ausente." }, { status: 400 });
  }

  const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;
  let event: Stripe.Event;

  try {
    const rawBody = await req.text();
    if (webhookSecret) {
      event = stripe.webhooks.constructEvent(rawBody, signature, webhookSecret);
    } else {
      event = JSON.parse(rawBody) as Stripe.Event;
    }
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Evento inválido.";
    console.error("Erro na verificação do webhook do Stripe:", message);
    return NextResponse.json({ error: `Webhook Error: ${message}` }, { status: 400 });
  }

  // Tratamento do evento checkout.session.completed (blueprint: handle-checkout-completed)
  if (event.type === "checkout.session.completed") {
    const session = event.data.object as Stripe.Checkout.Session;
    const metadata = session.metadata || {};
    const { userId, analysisId, kind = "diagnostic", segment, couponCode, productCode } = metadata;

    const customerEmail = session.customer_email || session.customer_details?.email;
    const amountTotal = session.amount_total || 0;
    const normalizedSegment = normalizeCareerSegment(segment) ?? "career_pro";

    try {
      // 1. Persiste o registro de pagamento em Payment no datastore
      let existingUser = userId
        ? await prisma.user.findUnique({ where: { id: userId } })
        : customerEmail
        ? await prisma.user.findUnique({ where: { email: customerEmail } })
        : null;

      // Se o usuário não existir ainda, cria conta rápida pelo e-mail informado no checkout
      if (!existingUser && customerEmail) {
        existingUser = await prisma.user.create({
          data: {
            email: customerEmail,
            name: customerEmail.split("@")[0],
            careerSegment: normalizedSegment,
          },
        });
      }

      const effectiveUserId = existingUser?.id ?? userId;

      if (effectiveUserId) {
        const product = productCode ? await resolveCommercialProduct(productCode) : null;
        const existingPayment = await prisma.payment.findUnique({ where: { mpPaymentId: `stripe_${session.id}` } });
        if (existingPayment) return NextResponse.json({ received: true });
        const paymentRecord = await prisma.payment.create({
          data: {
            userId: effectiveUserId,
            analysisId: analysisId || null,
            amount: amountTotal,
            kind: kind || "diagnostic",
            segment: normalizedSegment,
            status: "paid",
            mpPaymentId: `stripe_${session.id}`,
            paidAt: new Date(),
          },
        });

        if (product) {
          const purchase = await prisma.purchase.create({
            data: {
              userId: effectiveUserId,
              productId: product.id,
              paymentId: paymentRecord.id,
              status: "paid",
              amountCents: amountTotal,
              idempotencyKey: `payment:${paymentRecord.mpPaymentId}`,
            },
          });
          if (product.creditType && product.creditQuantity) {
            await grantCredits({
              userId: effectiveUserId,
              creditType: product.creditType,
              quantity: product.creditQuantity,
              source: `purchase:${purchase.id}`,
              idempotencyKey: `purchase:${purchase.id}`,
            });
          }
        }

        // 2. Se for plano por período (mensal/anual), concede o período de acesso
        if (isPeriodPlanKind(kind)) {
          const days = PERIOD_PLAN_DAYS[kind as keyof typeof PERIOD_PLAN_DAYS] || 30;
          const periodDays = product?.planKey && COMMERCIAL_PLANS[product.planKey as keyof typeof COMMERCIAL_PLANS]?.durationDays ?? days;
          const currentPeriodEnd = await grantSubscriptionPeriod(effectiveUserId, normalizedSegment, periodDays, paymentRecord.id, product?.planKey ?? "complete");
          if (customerEmail) {
            void sendSubscriptionConfirmationEmail(customerEmail, { currentPeriodEnd });
          }
        } else if (customerEmail) {
          void sendPaymentConfirmationEmail(customerEmail, { kind: kind || "diagnostic", amountCents: amountTotal });
        }

        // 3. Registra utilização de cupom se houver
        if (couponCode) {
          const coupon = await prisma.coupon.findUnique({ where: { code: couponCode.toUpperCase() } });
          if (coupon) {
            await registerCouponUsage(coupon.id);
          }
        }

        // 4. Notifica administração e registra no funil
        void notifyAdminPurchase({
          product: `Stripe: ${kind} (${normalizedSegment})`,
          amountCents: amountTotal,
          email: customerEmail,
        });

        await prisma.funnelEvent.create({
          data: {
            name: "payment_confirmed",
            userId: effectiveUserId,
            properties: JSON.stringify({ provider: "stripe", kind, amountTotal, segment: normalizedSegment }),
          },
        });
      }
    } catch (dbError) {
      console.error("Erro ao processar confirmação de pagamento do Stripe no banco:", dbError);
    }
  }

  return NextResponse.json({ received: true });
}
