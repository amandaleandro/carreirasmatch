import Stripe from "stripe";
import { parseBRLToCents } from "@/lib/pricing";
import { CAREER_OFFER_BY_SEGMENT } from "@/lib/career-offers";
import { periodPlanAmountCents, periodPlanProductName } from "@/lib/billing-plans";
import type { CareerSegment } from "@/lib/career-segments";

/**
 * Inicializa a biblioteca Stripe. Segue a instrução do blueprint:
 * "Do not guess as to what the required Stripe API version should be.
 * Leave the API version argument empty when initializing the Stripe client".
 */
export const stripe = new Stripe(process.env.STRIPE_SECRET_KEY ?? "");

export type CreateStripeSessionOptions = {
  userId?: string;
  email: string;
  analysisId?: string;
  kind?: "diagnostic" | "subscription_monthly" | "subscription_annual" | "first_analysis";
  segment?: CareerSegment;
  couponCode?: string;
  originUrl: string;
};

/**
 * Cria uma sessão do Stripe Checkout para pagamentos únicos de diagnósticos ou assinaturas.
 * Mapeia o blueprint `create-checkout-session` com `mode: payment`.
 */
export async function createStripeCheckoutSession({
  userId,
  email,
  analysisId,
  kind = "diagnostic",
  segment = "career_pro",
  couponCode,
  originUrl,
}: CreateStripeSessionOptions): Promise<Stripe.Checkout.Session> {
  const offer = CAREER_OFFER_BY_SEGMENT[segment];
  let unitAmountCents = 1290;
  let productName = "Diagnóstico Completo de Candidatura";

  if (kind === "first_analysis") {
    unitAmountCents = parseBRLToCents(offer.firstAnalysisPrice);
    productName = `1ª Análise Completa (${offer.shortTitle})`;
  } else if (kind === "diagnostic") {
    unitAmountCents = parseBRLToCents(offer.diagnosticPrice);
    productName = `Diagnóstico Completo (${offer.shortTitle})`;
  } else if (kind === "subscription_monthly" || kind === "subscription_annual") {
    unitAmountCents = periodPlanAmountCents(segment, kind);
    productName = periodPlanProductName(kind);
  }

  const successUrl = analysisId
    ? `${originUrl}/report/${analysisId}?stripe_status=success`
    : `${originUrl}/dashboard?stripe_status=success`;
  const cancelUrl = analysisId
    ? `${originUrl}/report/${analysisId}?stripe_status=cancelled`
    : `${originUrl}/assinar?stripe_status=cancelled`;

  const session = await stripe.checkout.sessions.create({
    payment_method_types: ["card"],
    customer_email: email,
    mode: "payment",
    line_items: [
      {
        price_data: {
          currency: "brl",
          unit_amount: unitAmountCents,
          product_data: {
            name: productName,
            description: `CarreirasMatch - ${offer.title}`,
          },
        },
        quantity: 1,
      },
    ],
    metadata: {
      userId: userId ?? "",
      analysisId: analysisId ?? "",
      kind,
      segment,
      couponCode: couponCode ?? "",
    },
    success_url: successUrl,
    cancel_url: cancelUrl,
  });

  return session;
}
