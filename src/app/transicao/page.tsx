import type { Metadata } from "next";
import { NicheLandingPage } from "@/components/niche-landing";
import { JsonLd } from "@/components/json-ld";
import { breadcrumbJsonLd } from "@/lib/seo";

export const metadata: Metadata = {
  title: "Planeje sua transição de carreira",
  description:
    "Encontre habilidades transferíveis, cargos-ponte e uma narrativa clara para conectar sua experiência à nova carreira.",
  alternates: { canonical: "/transicao" },
};

export default function CareerChangeLandingPage() {
  return (
    <>
      <JsonLd data={breadcrumbJsonLd([{ name: "Início", path: "/" }, { name: "Transição de carreira", path: "/transicao" }])} />
      <NicheLandingPage initialNiche="transicao-de-carreira" />
    </>
  );
}
