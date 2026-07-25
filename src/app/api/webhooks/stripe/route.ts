import { NextRequest, NextResponse } from "next/server";
import { stripe } from "@/lib/stripe";
import { prisma } from "@/lib/prisma";
import { normalizeCareerSegment } from "@/lib/career-segments";
import { grantSubscriptionPeriod, isPeriodPlanKind, PERIOD_PLAN_DAYS } from "@/lib/billing-plans";
import { registerCouponUsage } from "@/lib/coupons";
import { sendPaymentConfirmationEmail, sendSubscriptionConfirmationEmail, notifyAdminPurchase } from "@/lib/resend";
import { track, ANALYTICS_EVENTS } from "@/lib/analytics";

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
  let event: any;

  try {
    const rawBody = await req.text();
    if (webhookSecret) {
      event = stripe.webhooks.constructEvent(rawBody, signature, webhookSecret);
    } else {
      event = JSON.parse(rawBody);
    }
  } catch (err: any) {
    console.error("Erro na verificação do webhook do Stripe:", err.message);
    return NextResponse.json({ error: `Webhook Error: ${err.message}` }, { status: 400 });
  }

  // Tratamento do evento checkout.session.completed (blueprint: handle-checkout-completed)
  if (event.type === "checkout.session.completed") {
    const session = event.data.object;
    const metadata = session.metadata || {};
    const { userId, analysisId, kind = "diagnostic", segment, couponCode } = metadata;

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

        // 2. Se for plano por período (mensal/anual), concede o período de acesso
        if (isPeriodPlanKind(kind)) {
          const days = PERIOD_PLAN_DAYS[kind as keyof typeof PERIOD_PLAN_DAYS] || 30;
          const currentPeriodEnd = await grantSubscriptionPeriod(
            effectiveUserId,
            normalizedSegment,
            days,
            paymentRecord.id
          );
          if (customerEmail) {
            void sendSubscriptionConfirmationEmail(customerEmail, { currentPeriodEnd });
          }
        } else if (customerEmail) {
          void sendPaymentConfirmationEmail(customerEmail, { kind: kind || "diagnostic" });
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
            metadata: JSON.stringify({ provider: "stripe", kind, amountTotal, segment: normalizedSegment }),
          },
        });
      }
    } catch (dbError) {
      console.error("Erro ao processar confirmação de pagamento do Stripe no banco:", dbError);
    }
  }

  return NextResponse.json({ received: true });
}
