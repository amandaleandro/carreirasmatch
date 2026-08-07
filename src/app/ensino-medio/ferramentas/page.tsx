import { Metadata } from "next";
import Link from "next/link";
import { ArrowLeft, Sparkles } from "lucide-react";
import { PublicSiteHeader } from "@/components/public-site-header";
import { SiteFooter } from "@/components/site-footer";
import { EnsinoMedioToolsNav } from "@/components/ensino-medio-tools-nav";
import { EnsinoMedioToolsGrid } from "@/components/ensino-medio-tools-grid";

export const metadata: Metadata = {
  title: "Ferramentas Inteligentes de Estudo (Gemini AI) | Ensino Médio | CarreirasMatch",
  description:
    "Simulados por ano, flashcards 3D, temporizador Pomodoro, mapas mentais, corretor de redação e mais ferramentas com IA para o Ensino Médio.",
  alternates: { canonical: "/ensino-medio/ferramentas" },
};

export default function EnsinoMedioFerramentasPage() {
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

        <h1 className="text-xl font-extrabold text-neutral-900 dark:text-white flex items-center gap-2">
          <Sparkles className="h-5 w-5 text-blue-600" />
          Ferramentas Inteligentes de Estudo (Gemini AI)
        </h1>

        <EnsinoMedioToolsGrid />
      </main>

      <SiteFooter />
    </div>
  );
}
