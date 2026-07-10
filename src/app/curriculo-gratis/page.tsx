import type { Metadata } from "next";
import { FreeResumeBuilder } from "@/components/free-resume-builder";

export const metadata: Metadata = {
  title: "Curriculo gratis com IA | CarreirasMatch",
  description:
    "Monte um curriculo inicial gratis e depois descubra se ele esta pronto para uma vaga real.",
};

export default function CurriculoGratisPage() {
  return <FreeResumeBuilder />;
}
