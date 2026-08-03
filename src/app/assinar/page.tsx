import { PublicSubscriptionCheckout } from "@/components/public-subscription-checkout";
import { isCareerSegment, type CareerSegment } from "@/lib/career-segments";
import type { Metadata } from "next";

import { CommercialPlanCards } from "@/components/commercial-plan-cards";
import { COMMERCIAL_PLANS } from "@/lib/commercial-plan-catalog";

export const metadata: Metadata = {
  title: "Planos para o seu momento profissional",
  description:
    "Escolha um plano de carreira com análises, preparação para entrevistas e acompanhamento adequado ao seu momento.",
  alternates: { canonical: "/assinar" },
};

export default async function SubscribePage({
  searchParams,
}: {
  searchParams: Promise<{ segment?: string; coupon?: string; plan?: string }>;
}) {
  const params = await searchParams;
  const requested = params.segment && isCareerSegment(params.segment) ? params.segment : "career_pro";
  // Faculdade/técnico ainda não tem assinatura mensal; vende só o diagnóstico avulso.
  const segment: CareerSegment = requested === "student" ? "career_pro" : requested;
  const plans = Object.values(COMMERCIAL_PLANS).map((plan) => ({
    key: plan.key,
    name: plan.name,
    priceCents: plan.priceCents,
    recurring: plan.recurring,
    durationDays: plan.durationDays ?? null,
    highlighted: Boolean(plan.highlighted),
    entitlements: Object.entries(plan.limits).map(([featureKey, limit]) => ({
      limit,
      featureDefinition: { name: featureKey },
    })),
  }));

  return <><CommercialPlanCards plans={plans} /><PublicSubscriptionCheckout initialSegment={segment} initialCouponCode={params.coupon?.trim() ?? ""} initialPlanKey={params.plan?.trim() ?? "pro"} /></>;
}
