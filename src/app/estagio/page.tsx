import type { Metadata } from "next";
import { NicheLandingPage } from "@/components/niche-landing";
import { JsonLd } from "@/components/json-ld";
import { breadcrumbJsonLd } from "@/lib/seo";

export const metadata: Metadata = {
  title: "Currículo para estágio e primeira oportunidade",
  description:
    "Compare seu currículo com uma vaga de estágio e transforme projetos, cursos e atividades em evidências relevantes.",
  alternates: { canonical: "/estagio" },
};

export default function InternshipLandingPage() {
  return (
    <>
      <JsonLd data={breadcrumbJsonLd([{ name: "Início", path: "/" }, { name: "Estágio", path: "/estagio" }])} />
      <NicheLandingPage initialNiche="estagiarios" />
    </>
  );
}
