import type { Metadata } from "next";
import { NicheLandingPage } from "@/components/niche-landing";
import { JsonLd } from "@/components/json-ld";
import { breadcrumbJsonLd } from "@/lib/seo";

export const metadata: Metadata = {
  title: "Análise de currículo para recolocação",
  description:
    "Faça sua experiência aparecer na linguagem da vaga com análise de aderência, ATS, palavras-chave e preparação para entrevista.",
  alternates: { canonical: "/recolocacao" },
};

export default function ReemploymentLandingPage() {
  return (
    <>
      <JsonLd data={breadcrumbJsonLd([{ name: "Início", path: "/" }, { name: "Recolocação", path: "/recolocacao" }])} />
      <NicheLandingPage initialNiche="recolocacao" />
    </>
  );
}
