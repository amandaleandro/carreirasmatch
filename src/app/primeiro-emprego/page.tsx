import type { Metadata } from "next";
import { NicheLandingPage } from "@/components/niche-landing";
import { JsonLd } from "@/components/json-ld";
import { breadcrumbJsonLd } from "@/lib/seo";

export const metadata: Metadata = {
  title: "Currículo para o primeiro emprego",
  description:
    "Descubra como apresentar cursos, projetos e atividades para conquistar a primeira oportunidade profissional.",
  alternates: { canonical: "/primeiro-emprego" },
};

export default function FirstJobLandingPage() {
  return (
    <>
      <JsonLd data={breadcrumbJsonLd([{ name: "Início", path: "/" }, { name: "Primeiro emprego", path: "/primeiro-emprego" }])} />
      <NicheLandingPage initialNiche="primeiro-emprego" />
    </>
  );
}
