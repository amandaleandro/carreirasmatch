import type { Metadata } from "next";
import { FreeResumeBuilder } from "@/components/free-resume-builder";

export const metadata: Metadata = {
  title: "Currículo grátis com IA | CarreirasMatch",
  description:
    "Monte um currículo inicial grátis e depois descubra se ele está pronto para uma vaga real.",
};

export default function CurriculoGratisPage() {
  return <FreeResumeBuilder />;
}
