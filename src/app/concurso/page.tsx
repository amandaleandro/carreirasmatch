import type { Metadata } from "next";
import { NicheLandingPage } from "@/components/niche-landing";
import { JsonLd } from "@/components/json-ld";
import { breadcrumbJsonLd } from "@/lib/seo";

export const metadata: Metadata = {
  title: "Plano de estudos para concurso público",
  description:
    "Organize matérias, simulados e prioridades do edital para estudar com foco no que mais pesa na sua prova.",
  alternates: { canonical: "/concurso" },
};

export default function PublicExamLandingPage() {
  return (
    <>
      <JsonLd data={breadcrumbJsonLd([{ name: "Início", path: "/" }, { name: "Concurso público", path: "/concurso" }])} />
      <NicheLandingPage initialNiche="concurseiro" />
    </>
  );
}
