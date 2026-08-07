import { Metadata } from "next";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { PublicSiteHeader } from "@/components/public-site-header";
import { SiteFooter } from "@/components/site-footer";
import { EnsinoMedioToolsNav } from "@/components/ensino-medio-tools-nav";
import { EnsinoMedioSubjectsGrid } from "@/components/ensino-medio-subjects-grid";

export const metadata: Metadata = {
  title: "Matérias & Conteúdos da BNCC | Ensino Médio | CarreirasMatch",
  description:
    "Resumos didáticos da BNCC organizados por matéria e por ano escolar (1º, 2º, 3º Ano/ENEM) para o Ensino Médio.",
  alternates: { canonical: "/ensino-medio/materias" },
};

export default function EnsinoMedioMateriasPage() {
  return (
    <div className="min-h-screen flex flex-col bg-neutral-50 dark:bg-neutral-950 text-neutral-900 dark:text-neutral-50 font-sans">
      <PublicSiteHeader />
      <EnsinoMedioToolsNav />

      <main className="flex-1 max-w-6xl w-full mx-auto px-4 md:px-8 py-10 space-y-6">
        <Link
          href="/ensino-medio"
          className="inline-flex items-center gap-1.5 text-xs font-bold text-blue-600 dark:text-blue-400 hover:underline"
        >
          <ArrowLeft className="h-3.5 w-3.5" />
          Voltar para o Ensino Médio
        </Link>

        <h1 className="text-2xl font-extrabold text-neutral-900 dark:text-white">
          Matérias & Conteúdos da BNCC
        </h1>

        <EnsinoMedioSubjectsGrid />
      </main>

      <SiteFooter />
    </div>
  );
}
