import type { Metadata } from "next";
import { NicheLandingPage } from "@/components/niche-landing";

export const metadata: Metadata = {
  title: "Plano de estudos para concurso público",
  description:
    "Organize matérias, simulados e prioridades do edital para estudar com foco no que mais pesa na sua prova.",
  alternates: { canonical: "/concurso" },
};

export default function PublicExamLandingPage() {
  return <NicheLandingPage initialNiche="concurseiro" />;
}
