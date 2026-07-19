import type { Metadata } from "next";
import { NicheLandingPage } from "@/components/niche-landing";

export const metadata: Metadata = {
  title: "Planeje sua transição de carreira | CarreirasMatch",
  description:
    "Encontre habilidades transferíveis, cargos-ponte e uma narrativa clara para conectar sua experiência à nova carreira.",
  alternates: { canonical: "/transicao" },
};

export default function CareerChangeLandingPage() {
  return <NicheLandingPage initialNiche="transicao-de-carreira" />;
}
