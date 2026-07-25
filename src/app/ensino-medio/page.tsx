import { Metadata } from "next";
import { PublicSiteHeader } from "@/components/public-site-header";
import { SiteFooter } from "@/components/site-footer";
import { EnsinoMedioToolsNav } from "@/components/ensino-medio-tools-nav";
import { EnsinoMedioHubClient } from "@/components/ensino-medio-hub-client";

export const metadata: Metadata = {
  title: "Ensino Médio por Anos (1º, 2º, 3º & ENEM) | CarreirasMatch",
  description:
    "Estude para o 1º Ano, 2º Ano, 3º Ano e ENEM com IA Gemini: resumos organizados por ano escolar, corretor de redação 0-1000, cronograma, tutor virtual 24h e comparador Faculdade vs Técnico.",
  alternates: { canonical: "/ensino-medio" },
};

export default function EnsinoMedioHubPage() {
  return (
    <div className="min-h-screen flex flex-col bg-neutral-50 dark:bg-neutral-950 text-neutral-900 dark:text-neutral-50 font-sans">
      <PublicSiteHeader />
      <EnsinoMedioToolsNav />

      <main className="flex-1 max-w-6xl w-full mx-auto px-4 md:px-8 py-10">
        <EnsinoMedioHubClient />
      </main>

      <SiteFooter />
    </div>
  );
}
