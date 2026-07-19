import type { Metadata } from "next";
import { NicheLandingPage } from "@/components/niche-landing";

export const metadata: Metadata = {
  title: "Currículo para o primeiro emprego | CarreirasMatch",
  description:
    "Descubra como apresentar cursos, projetos e atividades para conquistar a primeira oportunidade profissional.",
  alternates: { canonical: "/primeiro-emprego" },
};

export default function FirstJobLandingPage() {
  return <NicheLandingPage initialNiche="primeiro-emprego" />;
}
