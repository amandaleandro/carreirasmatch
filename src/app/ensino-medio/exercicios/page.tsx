"use client";

import { useState } from "react";
import { PublicSiteHeader } from "@/components/public-site-header";
import { SiteFooter } from "@/components/site-footer";
import { EnsinoMedioToolsNav } from "@/components/ensino-medio-tools-nav";
import { HIGH_SCHOOL_SUBJECTS, HIGH_SCHOOL_YEARS, YearId } from "@/lib/ensino-medio-types";
import { GeneratedSimulado } from "@/app/api/ensino-medio/simulado/gerar/route";
import {
  FileText,
  Sparkles,
  BookOpen,
  GraduationCap,
  Brain,
  Printer,
  RotateCcw,
} from "lucide-react";

export default function GeradorExerciciosPage() {
  const [selectedSubject, setSelectedSubject] = useState("matematica");
  const [selectedYear, setSelectedYear] = useState<YearId>("1o-ano");
  const [numQuestions, setNumQuestions] = useState(5);

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [lista, setLista] = useState<GeneratedSimulado | null>(null);
  const [showAnswers, setShowAnswers] = useState(false);

  const handleGenerateLista = async () => {
    setLoading(true);
    setError(null);
    setLista(null);
    setShowAnswers(false);

    try {
      const res = await fetch("/api/ensino-medio/simulado/gerar", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          subjectSlug: selectedSubject,
          yearId: selectedYear,
          numQuestions,
        }),
      });

      if (!res.ok) throw new Error("Erro ao gerar lista");
      const data = await res.json();
      if (data.error) throw new Error(data.error);

      setLista(data);
    } catch (err) {
      console.error(err);
      setError("Não foi possível gerar a lista agora. Tente novamente em instantes.");
    } finally {
      setLoading(false);
    }
  };

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="min-h-screen flex flex-col bg-neutral-50 dark:bg-neutral-950 text-neutral-900 dark:text-neutral-50 font-sans print:bg-white print:text-black">
      <div className="print:hidden">
        <PublicSiteHeader />
        <EnsinoMedioToolsNav />
      </div>

      <main className="flex-1 max-w-4xl w-full mx-auto px-4 md:px-8 py-10 space-y-8 print:p-0 print:max-w-none">
        {/* Header */}
        <header className="text-center space-y-3 print:hidden">
          <div className="inline-flex items-center gap-1.5 rounded-full bg-blue-500/10 border border-blue-500/20 px-3.5 py-1 text-xs font-extrabold uppercase tracking-wider text-blue-600 dark:text-blue-400">
            <FileText className="h-3.5 w-3.5" />
            Gerador de Listas de Exercícios
          </div>
          <h1 className="text-3xl md:text-4xl font-black tracking-tight text-neutral-900 dark:text-white">
            Listas de Exercícios por Série
          </h1>
          <p className="text-neutral-600 dark:text-neutral-400 text-xs md:text-sm max-w-xl mx-auto leading-relaxed">
            Crie listas de estudo prontas para praticar na tela ou imprimir/salvar em PDF com gabarito explicativo.
          </p>
        </header>

        {/* Configuração da Lista */}
        {!lista && (
          <div className="bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-3xl p-6 md:p-8 shadow-sm space-y-6 print:hidden">
            {/* Escolha do Ano */}
            <div className="space-y-3">
              <label className="text-xs font-extrabold uppercase tracking-wider text-neutral-500 dark:text-neutral-400 flex items-center gap-1.5">
                <GraduationCap className="h-4 w-4 text-blue-600 dark:text-blue-400" />
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
                        ? "bg-blue-600 text-white border-blue-600 shadow-sm font-bold"
                        : "bg-neutral-50 dark:bg-neutral-950 border-neutral-200 dark:border-neutral-800 text-neutral-700 dark:text-neutral-300 hover:border-blue-400"
                    }`}
                  >
                    <p className="text-xs font-extrabold">{y.label}</p>
                    <p className={`text-[10px] ${selectedYear === y.id ? "text-blue-100" : "text-neutral-400"}`}>
                      {y.badge}
                    </p>
                  </button>
                ))}
              </div>
            </div>

            {/* Escolha da Matéria */}
            <div className="space-y-3">
              <label className="text-xs font-extrabold uppercase tracking-wider text-neutral-500 dark:text-neutral-400 flex items-center gap-1.5">
                <BookOpen className="h-4 w-4 text-emerald-600 dark:text-emerald-400" />
                2. Disciplina:
              </label>

              <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                {HIGH_SCHOOL_SUBJECTS.map((s) => (
                  <button
                    key={s.slug}
                    type="button"
                    onClick={() => setSelectedSubject(s.slug)}
                    className={`p-3 rounded-2xl border text-left text-xs font-bold transition-all ${
                      selectedSubject === s.slug
                        ? "bg-emerald-600 text-white border-emerald-600 shadow-sm"
                        : "bg-neutral-50 dark:bg-neutral-950 border-neutral-200 dark:border-neutral-800 text-neutral-700 dark:text-neutral-300 hover:border-emerald-400"
                    }`}
                  >
                    {s.name}
                  </button>
                ))}
              </div>
            </div>

            {/* Quantidade */}
            <div className="space-y-3">
              <label className="text-xs font-extrabold uppercase tracking-wider text-neutral-500 dark:text-neutral-400">
                3. Tamanho da Lista:
              </label>
              <div className="flex gap-3">
                {[5, 10].map((num) => (
                  <button
                    key={num}
                    type="button"
                    onClick={() => setNumQuestions(num)}
                    className={`px-5 py-2.5 rounded-xl border text-xs font-bold transition-all ${
                      numQuestions === num
                        ? "bg-blue-600 text-white border-blue-600 shadow-sm"
                        : "bg-neutral-50 dark:bg-neutral-950 border-neutral-200 dark:border-neutral-800 text-neutral-700 dark:text-neutral-300 hover:border-blue-400"
                    }`}
                  >
                    {num} Exercícios
                  </button>
                ))}
              </div>
            </div>

            {error && (
              <p className="text-xs font-bold text-rose-600 bg-rose-50 dark:bg-rose-950/40 p-3 rounded-xl border border-rose-200 dark:border-rose-800">
                {error}
              </p>
            )}

            <button
              onClick={handleGenerateLista}
              disabled={loading}
              className="w-full py-4 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 disabled:opacity-50 text-white font-black text-sm rounded-2xl shadow-md transition-all active:scale-[0.99] flex items-center justify-center gap-2"
            >
              {loading ? (
                <>
                  <Sparkles className="h-5 w-5 animate-spin" />
                  Gerando Lista de Exercícios com IA...
                </>
              ) : (
                <>
                  <Brain className="h-5 w-5" />
                  Gerar Lista Agora
                </>
              )}
            </button>
          </div>
        )}

        {/* Exibição da Lista Pronta */}
        {lista && (
          <div className="space-y-6">
            {/* Barra de Controles na Tela */}
            <div className="bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-3xl p-5 flex flex-wrap items-center justify-between gap-4 shadow-sm print:hidden">
              <div className="flex items-center gap-2">
                <button
                  onClick={() => setShowAnswers(!showAnswers)}
                  className={`px-4 py-2 rounded-xl text-xs font-bold transition-all border ${
                    showAnswers
                      ? "bg-emerald-600 text-white border-emerald-600"
                      : "bg-neutral-100 dark:bg-neutral-800 text-neutral-700 dark:text-neutral-300 border-neutral-200 dark:border-neutral-700 hover:bg-neutral-200"
                  }`}
                >
                  {showAnswers ? "Esconder Gabarito" : "Mostrar Gabarito Comentado"}
                </button>

                <button
                  onClick={handlePrint}
                  className="px-4 py-2 rounded-xl text-xs font-bold bg-blue-50 dark:bg-blue-950/40 text-blue-600 dark:text-blue-400 border border-blue-200 dark:border-blue-800 hover:bg-blue-100 flex items-center gap-1.5"
                >
                  <Printer className="h-3.5 w-3.5" />
                  Imprimir / Salvar PDF
                </button>
              </div>

              <button
                onClick={handleGenerateLista}
                className="text-xs font-extrabold text-neutral-500 hover:text-neutral-900 dark:hover:text-white flex items-center gap-1"
              >
                <RotateCcw className="h-3.5 w-3.5" />
                Gerar Outra Lista
              </button>
            </div>

            {/* Documento Imprimível */}
            <div className="bg-white dark:bg-neutral-900 print:bg-white print:text-black border border-neutral-200 dark:border-neutral-800 print:border-none rounded-3xl print:rounded-none p-6 md:p-10 space-y-6 shadow-sm">
              <div className="border-b border-neutral-200 dark:border-neutral-800 pb-4 space-y-1">
                <span className="text-[10px] font-black uppercase tracking-widest text-blue-600 dark:text-blue-400 print:text-blue-800">
                  CarreirasMatch • Ensino Médio & ENEM
                </span>
                <h2 className="text-2xl font-black text-neutral-900 dark:text-white print:text-black">
                  {lista.title}
                </h2>
                <p className="text-xs text-neutral-500 print:text-gray-600">
                  Série: {lista.yearLabel} • Matéria: {lista.subjectName} • {lista.questions.length} Questões
                </p>
              </div>

              <div className="space-y-8">
                {lista.questions.map((q, idx) => (
                  <div key={q.id} className="space-y-3">
                    <p className="text-sm font-bold text-neutral-900 dark:text-white print:text-black leading-relaxed">
                      {idx + 1}. {q.question}
                    </p>

                    <div className="space-y-1.5 pl-2">
                      {q.options.map((opt, optIdx) => (
                        <div key={optIdx} className="text-xs text-neutral-700 dark:text-neutral-300 print:text-gray-800 flex items-start gap-2">
                          <span className="font-mono font-bold shrink-0">
                            ({String.fromCharCode(65 + optIdx)})
                          </span>
                          <span>{opt}</span>
                        </div>
                      ))}
                    </div>

                    {(showAnswers || false) && (
                      <div className="mt-3 p-3.5 rounded-xl bg-neutral-50 dark:bg-neutral-950 border border-neutral-200 dark:border-neutral-800 text-xs space-y-1.5 print:bg-gray-100 print:border-gray-300">
                        <p className="font-bold text-emerald-600 dark:text-emerald-400 print:text-emerald-800">
                          Gabarito: Alternativa ({String.fromCharCode(65 + q.correctAnswerIndex)})
                        </p>
                        <p className="text-neutral-600 dark:text-neutral-300 print:text-gray-700 leading-relaxed">
                          <strong>Resolução:</strong> {q.explanation}
                        </p>
                      </div>
                    )}
                  </div>
                ))}
              </div>

              {!showAnswers && (
                <div className="pt-6 border-t border-neutral-100 dark:border-neutral-800 text-center print:block">
                  <p className="text-xs text-neutral-400 italic">
                    (Gabarito oculto. Clique em &ldquo;Mostrar Gabarito Comentado&rdquo; no topo para ver as respostas).
                  </p>
                </div>
              )}
            </div>
          </div>
        )}
      </main>

      <div className="print:hidden">
        <SiteFooter />
      </div>
    </div>
  );
}
