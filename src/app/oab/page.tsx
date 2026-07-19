import type { Metadata } from "next";
import { NicheLandingPage } from "@/components/niche-landing";

export const metadata: Metadata = {
  title: "Preparação para 1ª e 2ª fase da OAB",
  description:
    "Estude pelo estilo da FGV com simulados, correção de peças e um plano organizado para a fase do Exame da OAB.",
  alternates: { canonical: "/oab" },
};

export default function OabLandingPage() {
  return <NicheLandingPage initialNiche="oab" />;
}
