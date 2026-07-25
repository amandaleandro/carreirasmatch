"use client";

import { useState } from "react";
import { PublicSiteHeader } from "@/components/public-site-header";
import { SiteFooter } from "@/components/site-footer";
import { EnsinoMedioToolsNav } from "@/components/ensino-medio-tools-nav";
import { HIGH_SCHOOL_SUBJECTS, HIGH_SCHOOL_YEARS, YearId } from "@/lib/ensino-medio-types";
import { GeneratedMindMap } from "@/app/api/ensino-medio/mapa-mental/gerar/route";
import {
  Brain,
  Sparkles,
  RotateCcw,
  BookOpen,
  GraduationCap,
  GitBranch,
  Layers,
} from "lucide-react";

export default function MapaMentalPage() {
  const [selectedSubject, setSelectedSubject] = useState("matematica");
  const [selectedYear, setSelectedYear] = useState<YearId>("1o-ano");
  const [topic, setTopic] = useState("");

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [mapData, setMapData] = useState<GeneratedMindMap | null>(null);

  const handleGenerateMap = async () => {
    setLoading(true);
    setError(null);
    setMapData(null);

    try {
      const res = await fetch("/api/ensino-medio/mapa-mental/gerar", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          subjectSlug: selectedSubject,
          yearId: selectedYear,
          topic,
        }),
      });

      if (!res.ok) throw new Error("Erro ao gerar mapa mental");
      const data = await res.json();
      if (data.error) throw new Error(data.error);

      setMapData(data);
    } catch (err) {
      console.error(err);
      setError("Não foi possível gerar o mapa mental agora. Tente novamente.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-neutral-50 dark:bg-neutral-950 text-neutral-900 dark:text-neutral-50 font-sans">
      <PublicSiteHeader />
      <EnsinoMedioToolsNav />

      <main className="flex-1 max-w-5xl w-full mx-auto px-4 md:px-8 py-10 space-y-8">
        {/* Header */}
        <header className="text-center space-y-3">
          <div className="inline-flex items-center gap-1.5 rounded-full bg-indigo-500/10 border border-indigo-500/20 px-3.5 py-1 text-xs font-extrabold uppercase tracking-wider text-indigo-600 dark:text-indigo-400">
            <GitBranch className="h-3.5 w-3.5" />
            Visualização Didática por Nós
          </div>
          <h1 className="text-3xl md:text-4xl font-black tracking-tight text-neutral-900 dark:text-white">
            Gerador de Mapas Mentais com IA
          </h1>
          <p className="text-neutral-600 dark:text-neutral-400 text-xs md:text-sm max-w-xl mx-auto leading-relaxed">
            Transforme tópicos difíceis do **1º, 2º e 3º Ano** em mapas conceituais organizados visualmente para memorização fácil.
          </p>
        </header>

        {/* Form de Geração */}
        {!mapData && (
          <div className="bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-3xl p-6 md:p-8 shadow-sm space-y-6">
            {/* Escolha do Ano */}
            <div className="space-y-3">
              <label className="text-xs font-extrabold uppercase tracking-wider text-neutral-500 dark:text-neutral-400 flex items-center gap-1.5">
                <GraduationCap className="h-4 w-4 text-indigo-600 dark:text-indigo-400" />
                1. Série Escolar:
              </label>

              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
                {HIGH_SCHOOL_YEARS.map((y) => (
                  <button
                    key={y.id}
                    type="button"
                    onClick={() => setSelectedYear(y.id)}
                    className={`p-3 rounded-2xl border text-left transition-all ${
                      selectedYear === y.id
                        ? "bg-indigo-600 text-white border-indigo-600 shadow-sm font-bold"
                        : "bg-neutral-50 dark:bg-neutral-950 border-neutral-200 dark:border-neutral-800 text-neutral-700 dark:text-neutral-300 hover:border-indigo-400"
                    }`}
                  >
                    <p className="text-xs font-extrabold">{y.label}</p>
                    <p className={`text-[10px] ${selectedYear === y.id ? "text-indigo-100" : "text-neutral-400"}`}>
                      {y.badge}
                    </p>
                  </button>
                ))}
              </div>
            </div>

            {/* Escolha da Matéria */}
            <div className="space-y-3">
              <label className="text-xs font-extrabold uppercase tracking-wider text-neutral-500 dark:text-neutral-400 flex items-center gap-1.5">
                <BookOpen className="h-4 w-4 text-indigo-600 dark:text-indigo-400" />
                2. Disciplina:
              </label>

              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                {HIGH_SCHOOL_SUBJECTS.map((s) => (
                  <button
                    key={s.slug}
                    type="button"
                    onClick={() => setSelectedSubject(s.slug)}
                    className={`p-3 rounded-2xl border text-left text-xs font-bold transition-all ${
                      selectedSubject === s.slug
                        ? "bg-indigo-600 text-white border-indigo-600 shadow-sm"
                        : "bg-neutral-50 dark:bg-neutral-950 border-neutral-200 dark:border-neutral-800 text-neutral-700 dark:text-neutral-300 hover:border-indigo-400"
                    }`}
                  >
                    {s.name}
                  </button>
                ))}
              </div>
            </div>

            {/* Tópico */}
            <div className="space-y-2">
              <label className="text-xs font-extrabold uppercase tracking-wider text-neutral-500 dark:text-neutral-400">
                3. Tópico da Matéria:
              </label>
              <input
                type="text"
                placeholder="Ex: Leis de Newton, Redação ENEM, Funções de 2º Grau, Revolução Industrial..."
                value={topic}
                onChange={(e) => setTopic(e.target.value)}
                className="w-full px-4 py-3 bg-neutral-50 dark:bg-neutral-950 border border-neutral-200 dark:border-neutral-800 rounded-xl text-sm text-neutral-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
            </div>

            {error && (
              <p className="text-xs font-bold text-rose-600 bg-rose-50 dark:bg-rose-950/40 p-3 rounded-xl border border-rose-200 dark:border-rose-800">
                {error}
              </p>
            )}

            <button
              onClick={handleGenerateMap}
              disabled={loading}
              className="w-full py-4 bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 disabled:opacity-50 text-white font-black text-sm rounded-2xl shadow-md transition-all active:scale-[0.99] flex items-center justify-center gap-2"
            >
              {loading ? (
                <>
                  <Sparkles className="h-5 w-5 animate-spin" />
                  Mapeando Conceitos com Gemini...
                </>
              ) : (
                <>
                  <Brain className="h-5 w-5" />
                  Gerar Mapa Mental Agora
                </>
              )}
            </button>
          </div>
        )}

        {/* Exibição do Mapa Mental Estruturado */}
        {mapData && (
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <div>
                <span className="text-[10px] font-extrabold uppercase tracking-wider text-indigo-600 dark:text-indigo-400 bg-indigo-50 dark:bg-indigo-950/40 border border-indigo-200 dark:border-indigo-800 px-2.5 py-0.5 rounded-full">
                  {mapData.subjectName} • {mapData.yearLabel}
                </span>
                <h2 className="text-2xl font-black text-neutral-900 dark:text-white mt-1">
                  Mapa Mental: {mapData.topic}
                </h2>
              </div>

              <button
                onClick={handleGenerateMap}
                className="text-xs font-extrabold text-neutral-500 hover:text-neutral-900 dark:hover:text-white flex items-center gap-1"
              >
                <RotateCcw className="h-3.5 w-3.5" />
                Gerar Outro Mapa
              </button>
            </div>

            {/* Árvore Visual de Nós Conceituais */}
            <div className="bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-3xl p-6 sm:p-10 space-y-8 shadow-sm">
              {/* Nó Raiz Central */}
              <div className="text-center p-6 rounded-3xl bg-gradient-to-r from-indigo-600 to-purple-600 text-white shadow-md max-w-xl mx-auto space-y-2">
                <span className="text-[10px] font-extrabold uppercase tracking-widest bg-white/20 px-2.5 py-0.5 rounded-full">
                  🎯 Conceito Central
                </span>
                <h3 className="text-2xl font-black">{mapData.root.title}</h3>
                <p className="text-xs text-indigo-100 leading-relaxed">{mapData.root.description}</p>
              </div>

              {/* Ramos Principais */}
              <div className="grid gap-6 md:grid-cols-3 pt-4">
                {mapData.root.children?.map((branch, bIdx) => (
                  <div
                    key={bIdx}
                    className="p-5 rounded-2xl border-2 border-indigo-100 dark:border-indigo-900/50 bg-indigo-50/40 dark:bg-indigo-950/20 space-y-4 flex flex-col justify-between"
                  >
                    <div className="space-y-2">
                      <div className="flex items-center gap-2">
                        <span className="h-6 w-6 rounded-full bg-indigo-600 text-white flex items-center justify-center text-xs font-bold shrink-0">
                          {bIdx + 1}
                        </span>
                        <h4 className="text-base font-extrabold text-neutral-900 dark:text-white">
                          {branch.title}
                        </h4>
                      </div>
                      <p className="text-xs text-neutral-600 dark:text-neutral-400 leading-relaxed">
                        {branch.description}
                      </p>
                    </div>

                    {/* Sub-ramos */}
                    {branch.children && (
                      <div className="pt-3 border-t border-indigo-200/60 dark:border-indigo-900/40 space-y-2">
                        <span className="text-[10px] font-extrabold uppercase tracking-wider text-indigo-600 dark:text-indigo-400 flex items-center gap-1">
                          <Layers className="h-3 w-3" /> Detalhes & Aplicações:
                        </span>
                        {branch.children.map((sub, sIdx) => (
                          <div
                            key={sIdx}
                            className="p-2.5 rounded-xl bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 text-xs space-y-0.5"
                          >
                            <p className="font-bold text-neutral-900 dark:text-white">• {sub.title}</p>
                            <p className="text-[11px] text-neutral-500 leading-relaxed">{sub.description}</p>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
      </main>

      <SiteFooter />
    </div>
  );
}
