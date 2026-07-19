import type { Metadata } from "next";
import { NicheLandingPage } from "@/components/niche-landing";

export const metadata: Metadata = {
  title: "Análise de currículo com IA para o seu momento",
  description:
    "Estágio, primeiro emprego, transição de carreira, recolocação, jovem aprendiz ou estágio na faculdade: compare seu currículo com a vaga e veja exatamente o que ajustar antes de aplicar.",
};

export default function ComecePage() {
  return <NicheLandingPage />;
}
