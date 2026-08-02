import type { Metadata } from "next";
import { NicheLandingPage } from "@/components/niche-landing";
import { JsonLd } from "@/components/json-ld";
import { breadcrumbJsonLd } from "@/lib/seo";

export const metadata: Metadata = {
  title: "Preparação para 1ª e 2ª fase da OAB",
  description:
    "Estude pelo estilo da FGV com simulados, correção de peças e um plano organizado para a fase do Exame da OAB.",
  alternates: { canonical: "/oab" },
};

export default function OabLandingPage() {
  return (
    <>
      <JsonLd data={breadcrumbJsonLd([{ name: "Início", path: "/" }, { name: "OAB", path: "/oab" }])} />
      <NicheLandingPage initialNiche="oab" />
    </>
  );
}
