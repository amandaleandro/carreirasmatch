import type { Metadata } from "next";
import { NicheLandingPage } from "@/components/niche-landing";

export const metadata: Metadata = {
  title: "Currículo para Jovem Aprendiz",
  description:
    "Monte seu primeiro currículo, encontre vagas de aprendizagem compatíveis e prepare-se para entrevistas mesmo sem experiência formal.",
  alternates: { canonical: "/jovem-aprendiz" },
};

export default function ApprenticeLandingPage() {
  return <NicheLandingPage initialNiche="menor-aprendiz" />;
}
