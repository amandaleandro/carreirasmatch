import type { Metadata } from "next";
import { NicheLandingPage } from "@/components/niche-landing";
import { JsonLd } from "@/components/json-ld";
import { breadcrumbJsonLd } from "@/lib/seo";

export const metadata: Metadata = {
  title: "Currículo para Jovem Aprendiz",
  description:
    "Monte seu primeiro currículo, encontre vagas de aprendizagem compatíveis e prepare-se para entrevistas mesmo sem experiência formal.",
  alternates: { canonical: "/jovem-aprendiz" },
};

export default function ApprenticeLandingPage() {
  return (
    <>
      <JsonLd data={breadcrumbJsonLd([{ name: "Início", path: "/" }, { name: "Jovem Aprendiz", path: "/jovem-aprendiz" }])} />
      <NicheLandingPage initialNiche="menor-aprendiz" />
    </>
  );
}
