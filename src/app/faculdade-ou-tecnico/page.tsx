import type { Metadata } from "next";
import { NicheLandingPage } from "@/components/niche-landing";

export const metadata: Metadata = {
  title: "Faculdade, curso técnico ou outro caminho?",
  description:
    "Compare áreas, cursos e caminhos profissionais para decidir seu próximo passo de formação com mais clareza.",
  alternates: { canonical: "/faculdade-ou-tecnico" },
};

export default function StudentLandingPage() {
  return <NicheLandingPage initialNiche="estudante" />;
}
