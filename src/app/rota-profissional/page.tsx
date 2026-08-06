import { PublicSubscriptionCheckout } from "@/components/public-subscription-checkout";
import { isCareerSegment, type CareerSegment } from "@/lib/career-segments";
import type { Metadata } from "next";

// Mesmo checkout de /assinar (não duplica lógica de pagamento), só com a
// marca e a URL da jornada "Rota Profissional" da arquitetura de ofertas.
export const metadata: Metadata = {
  title: "Rota Profissional: organize sua busca e suas candidaturas | CarreirasMatch",
  description:
    "Análises recorrentes, currículos por vaga, feed personalizado, acompanhamento de candidaturas e preparação de entrevistas em um só lugar.",
  alternates: { canonical: "/rota-profissional" },
};

export default async function RotaProfissionalPage({
  searchParams,
}: {
  searchParams: Promise<{ segment?: string; coupon?: string; plan?: string }>;
}) {
  const params = await searchParams;
  const requested = params.segment && isCareerSegment(params.segment) ? params.segment : "career_pro";
  const segment: CareerSegment = requested === "student" ? "career_pro" : requested;

  return (
    <PublicSubscriptionCheckout
      initialSegment={segment}
      initialCouponCode={params.coupon?.trim() ?? ""}
      initialPlanKey={params.plan?.trim() ?? "pro"}
    />
  );
}
