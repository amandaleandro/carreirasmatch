import { Metadata } from "next";
import { PublicSiteHeader } from "@/components/public-site-header";
import { SiteFooter } from "@/components/site-footer";
import { EnsinoMedioToolsNav } from "@/components/ensino-medio-tools-nav";
import { EssayShowcase } from "@/app/tools/essay-showcase/EssayShowcase";

export const metadata: Metadata = {
  title: "Redações Nota 1000 Comentadas (ENEM) | CarreirasMatch",
  description:
    "Analise redações nota 1000 parágrafo por parágrafo, veja o porquê de cada nota nas 5 competências e aprenda técnicas de repertório.",
  alternates: { canonical: "/ensino-medio/redacao-nota-1000" },
};

export default function EnemEssayShowcasePage() {
  return (
    <div className="min-h-screen flex flex-col bg-neutral-50 dark:bg-neutral-950 text-neutral-900 dark:text-neutral-50 font-sans">
      <PublicSiteHeader />
      <EnsinoMedioToolsNav />

      <main className="flex-1 max-w-5xl w-full mx-auto px-4 md:px-8 py-8">
        <EssayShowcase />
      </main>

      <SiteFooter />
    </div>
  );
}
