import { PublicSubscriptionCheckout } from "@/components/public-subscription-checkout";
import { isCareerSegment, type CareerSegment } from "@/lib/career-segments";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Planos para o seu momento profissional",
  description:
    "Escolha um plano de carreira com análises, preparação para entrevistas e acompanhamento adequado ao seu momento.",
  alternates: { canonical: "/assinar" },
};

export default async function SubscribePage({
  searchParams,
}: {
  searchParams: Promise<{ segment?: string }>;
}) {
  const params = await searchParams;
  const segment: CareerSegment = params.segment && isCareerSegment(params.segment) ? params.segment : "career_pro";

  return <PublicSubscriptionCheckout initialSegment={segment} />;
}
