import type { Metadata } from "next";
import { NicheLandingPage } from "@/components/niche-landing";

export const metadata: Metadata = {
  title: "Análise de currículo para recolocação",
  description:
    "Faça sua experiência aparecer na linguagem da vaga com análise de aderência, ATS, palavras-chave e preparação para entrevista.",
  alternates: { canonical: "/recolocacao" },
};

export default function ReemploymentLandingPage() {
  return <NicheLandingPage initialNiche="recolocacao" />;
}
