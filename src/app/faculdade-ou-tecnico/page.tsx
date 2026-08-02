import type { Metadata } from "next";
import { NicheLandingPage } from "@/components/niche-landing";
import { JsonLd } from "@/components/json-ld";
import { breadcrumbJsonLd } from "@/lib/seo";

export const metadata: Metadata = {
  title: "Faculdade, curso técnico ou outro caminho?",
  description:
    "Compare áreas, cursos e caminhos profissionais para decidir seu próximo passo de formação com mais clareza.",
  alternates: { canonical: "/faculdade-ou-tecnico" },
};

export default function StudentLandingPage() {
  return (
    <>
      <JsonLd data={breadcrumbJsonLd([{ name: "Início", path: "/" }, { name: "Faculdade ou técnico", path: "/faculdade-ou-tecnico" }])} />
      <NicheLandingPage initialNiche="estudante" />
    </>
  );
}
