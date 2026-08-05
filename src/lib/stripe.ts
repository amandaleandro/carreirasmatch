import Stripe from "stripe";
import { parseBRLToCents } from "@/lib/pricing";
import { CAREER_OFFER_BY_SEGMENT } from "@/lib/career-offers";
import { periodPlanAmountCents, periodPlanProductName } from "@/lib/billing-plans";
import type { CareerSegment } from "@/lib/career-segments";
import { resolveCommercialProduct } from "@/lib/commercial-products";
import { prisma } from "@/lib/prisma";

/**
 * Inicializa a biblioteca Stripe. Segue a instrução do blueprint:
 * "Do not guess as to what the required Stripe API version should be.
 * Leave the API version argument empty when initializing the Stripe client".
 */
// O build do Next pode avaliar este módulo sem carregar as variáveis de runtime
// da VPS. Uma chave placeholder mantém a inicialização segura no build; as
// chamadas reais continuam exigindo STRIPE_SECRET_KEY no ambiente de produção.
export const stripe = new Stripe(process.env.STRIPE_SECRET_KEY ?? "sk_test_build_placeholder");

export type CreateStripeSessionOptions = {
  userId?: string;
  email: string;
  analysisId?: string;
  kind?: "diagnostic" | "subscription_monthly" | "subscription_annual" | "first_analysis";
  productCode?: string;
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
  productCode,
}: CreateStripeSessionOptions): Promise<Stripe.Checkout.Session> {
  const offer = CAREER_OFFER_BY_SEGMENT[segment];
  let currentKind: NonNullable<CreateStripeSessionOptions["kind"]> = kind ?? "diagnostic";

  let unitAmountCents = 990;
  let productName = "Diagnóstico Completo de Candidatura";

  if (productCode) {
    const product = await resolveCommercialProduct(productCode);
    unitAmountCents = product.priceCents;
    productName = product.name;
    if (product.kind) {
      currentKind = product.kind as NonNullable<CreateStripeSessionOptions["kind"]>;
    }
  } else if (currentKind === "first_analysis") {
    unitAmountCents = parseBRLToCents(offer.firstAnalysisPrice);
    productName = `1ª Análise Completa (${offer.shortTitle})`;
  } else if (currentKind === "diagnostic") {
    unitAmountCents = parseBRLToCents(offer.diagnosticPrice);
    productName = `Diagnóstico Completo (${offer.shortTitle})`;
  } else if (currentKind === "subscription_monthly" || currentKind === "subscription_annual") {
    unitAmountCents = periodPlanAmountCents(segment, currentKind);
    productName = periodPlanProductName(currentKind);
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
      kind: currentKind,
      segment,
      couponCode: couponCode ?? "",
      productCode: productCode ?? "",
    },
    success_url: successUrl,
    cancel_url: cancelUrl,
  });

  // Deixa um rastro "pending" assim que a sessão é criada, não só quando o
  // pagamento é confirmado. Sem isso, quem abandona o Checkout do Stripe some
  // sem aparecer no funil e sem entrar na régua de recuperação de checkout
  // (sendCheckoutRecoveryEmails já varre Payment pending/cancelled). Só dá pra
  // fazer isso com userId, porque a coluna é obrigatória — checkout de
  // convidado sem conta ainda continua sendo registrado só no webhook.
  if (userId) {
    await prisma.payment.create({
      data: {
        userId,
        analysisId: analysisId || null,
        amount: unitAmountCents,
        kind: currentKind,
        segment,
        status: "pending",
        mpPaymentId: `stripe_${session.id}`,
      },
    });
  }

  return session;
}
