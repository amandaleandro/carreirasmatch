import type { Metadata } from "next";
import { NicheLandingPage } from "@/components/niche-landing";

export const metadata: Metadata = {
  title: "Currículo para estágio e primeira oportunidade",
  description:
    "Compare seu currículo com uma vaga de estágio e transforme projetos, cursos e atividades em evidências relevantes.",
  alternates: { canonical: "/estagio" },
};

export default function InternshipLandingPage() {
  return <NicheLandingPage initialNiche="estagiarios" />;
}
