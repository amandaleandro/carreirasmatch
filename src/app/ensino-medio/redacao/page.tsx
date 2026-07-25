"use client";

import { useState } from "react";
import Link from "next/link";
import { PublicSiteHeader } from "@/components/public-site-header";
import { SiteFooter } from "@/components/site-footer";
import { EnsinoMedioToolsNav } from "@/components/ensino-medio-tools-nav";
import { EnemEssayEvaluation } from "@/lib/ensino-medio-tools";
import {
  Sparkles,
  Award,
  CheckCircle2,
  Lightbulb,
  RotateCcw,
  ArrowRight,
} from "lucide-react";

const SAMPLE_TOPICS = [
  "Desafios para a valorização de comunidades e povos tradicionais no Brasil",
  "Invisibilidade e trabalho de cuidado realizado pela mulher no Brasil",
  "Medidas para o combate à manipulação do comportamento do usuário pelo controle de dados",
  "Caminhos para combater o racismo estrutural e institucional na sociedade contemporânea",
];

export default function EnemEssayPage() {
  const [topic, setTopic] = useState(SAMPLE_TOPICS[0]);
  const [customTopic, setCustomTopic] = useState("");
  const [essayText, setEssayText] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [evaluation, setEvaluation] = useState<EnemEssayEvaluation | null>(null);

  const wordCount = essayText.trim() ? essayText.trim().split(/\s+/).length : 0;
  const lineCountEstimate = Math.ceil(essayText.length / 60);

  const handleEvaluate = async () => {
    const finalTopic = customTopic.trim() || topic;
    if (!finalTopic || !essayText.trim()) return;

    setLoading(true);
    setError(null);

    try {
      const res = await fetch("/api/ensino-medio/redacao/corrigir", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ topic: finalTopic, essayText }),
      });

      if (!res.ok) {
        throw new Error("Erro na API de correção.");
      }

      const json = await res.json();
      if (json.error) {
        throw new Error(json.error);
      }

      setEvaluation(json);
    } catch (err) {
      console.error(err);
      setError("Falha ao avaliar a redação. Tente novamente.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-neutral-50 dark:bg-neutral-950 text-neutral-900 dark:text-neutral-50 font-sans">
      <PublicSiteHeader />
      <EnsinoMedioToolsNav />

      <main className="flex-1 max-w-5xl w-full mx-auto px-4 md:px-8 py-8 space-y-8">
        {/* Header */}
        <header className="text-center max-w-2xl mx-auto space-y-3">
          <div className="inline-flex items-center gap-1.5 rounded-full bg-blue-500/10 text-blue-600 dark:text-blue-400 border border-blue-500/20 px-3 py-1 text-xs font-bold uppercase tracking-wider">
            <Award className="h-3.5 w-3.5" />
            Correção Oficial ENEM com Gemini AI
          </div>
          <h1 className="text-3xl md:text-4xl font-black text-neutral-900 dark:text-white">
            Corretor de Redação ENEM
          </h1>
          <p className="text-neutral-600 dark:text-neutral-400 text-xs md:text-sm leading-relaxed">
            Escreva ou cole sua redação e receba uma nota de 0 a 1000 avaliada nas 5 competências oficiais do ENEM com dicas detalhadas.
          </p>

          <div className="pt-2">
            <Link
              href="/ensino-medio/redacao-nota-1000"
              className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-rose-50 dark:bg-rose-950/40 text-rose-600 dark:text-rose-400 border border-rose-200 dark:border-rose-800 text-xs font-bold hover:bg-rose-100 transition-all"
            >
              <Award className="h-3.5 w-3.5" />
              Ver Mostra de Redações Nota 1000 Comentadas
              <ArrowRight className="h-3 w-3" />
            </Link>
          </div>
        </header>

        {/* Form e Editor */}
        {!evaluation ? (
          <div className="bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-3xl p-6 md:p-8 space-y-6 shadow-sm">
            {/* Escolha do Tema */}
            <div className="space-y-3">
              <label className="block text-xs font-extrabold uppercase tracking-wider text-neutral-500">
                1. Tema da Redação
              </label>
              <div className="grid gap-2 md:grid-cols-2">
                {SAMPLE_TOPICS.map((t) => (
                  <button
                    key={t}
                    onClick={() => {
                      setTopic(t);
                      setCustomTopic("");
                    }}
                    className={`p-3 rounded-xl text-left text-xs font-semibold border transition-all ${
                      topic === t && !customTopic
                        ? "bg-blue-50 dark:bg-blue-950/40 border-blue-600 text-blue-900 dark:text-blue-200 font-bold"
                        : "bg-neutral-50 dark:bg-neutral-950 border-neutral-200 dark:border-neutral-800 text-neutral-700 dark:text-neutral-300"
                    }`}
                  >
                    {t}
                  </button>
                ))}
              </div>

              <input
                type="text"
                placeholder="Ou digite o tema que você está treinando..."
                value={customTopic}
                onChange={(e) => setCustomTopic(e.target.value)}
                className="w-full px-4 py-2.5 bg-neutral-50 dark:bg-neutral-950 border border-neutral-200 dark:border-neutral-800 rounded-xl text-xs text-neutral-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            {/* Editor de Texto */}
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <label className="block text-xs font-extrabold uppercase tracking-wider text-neutral-500">
                  2. Texto da sua Redação
                </label>
                <span className="text-[11px] text-neutral-400 font-medium">
                  {wordCount} palavras | ~{lineCountEstimate} linhas
                </span>
              </div>

              <textarea
                rows={12}
                placeholder="Cole ou digite sua redação dissertativa-argumentativa aqui..."
                value={essayText}
                onChange={(e) => setEssayText(e.target.value)}
                className="w-full p-4 bg-neutral-50 dark:bg-neutral-950 border border-neutral-200 dark:border-neutral-800 rounded-2xl text-xs md:text-sm text-neutral-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500 font-mono leading-relaxed"
              />
            </div>

            {error && (
              <div className="p-3 rounded-xl bg-red-50 dark:bg-red-950/40 border border-red-200 text-red-700 text-xs font-semibold">
                {error}
              </div>
            )}

            <button
              onClick={handleEvaluate}
              disabled={loading || essayText.trim().length < 50}
              className="w-full py-3.5 bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white font-extrabold text-sm rounded-xl transition-all shadow-sm flex items-center justify-center gap-2"
            >
              {loading ? (
                <>
                  <Sparkles className="h-4 w-4 animate-spin" />
                  Corrigindo com Gemini AI...
                </>
              ) : (
                <>
                  <Award className="h-4 w-4" />
                  Corrigir Redação & Ver Nota
                </>
              )}
            </button>
          </div>
        ) : (
          /* Resultado da Avaliação */
          <div className="space-y-6">
            {/* Box da Nota Total */}
            <div className="bg-gradient-to-br from-blue-900 via-indigo-900 to-purple-900 text-white rounded-3xl p-6 md:p-8 text-center space-y-4 shadow-md">
              <span className="text-xs font-extrabold uppercase tracking-wider text-blue-200">
                Resultado da Correção ENEM
              </span>
              <div className="text-5xl md:text-6xl font-black tracking-tight text-amber-300">
                {evaluation.totalScore} <span className="text-2xl text-white font-bold">/ 1000</span>
              </div>
              <p className="text-xs md:text-sm text-blue-100 max-w-xl mx-auto leading-relaxed">
                {evaluation.overallFeedback}
              </p>
              <button
                onClick={() => setEvaluation(null)}
                className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-white/10 hover:bg-white/20 text-white text-xs font-bold transition-all"
              >
                <RotateCcw className="h-3.5 w-3.5" />
                Corrigir Outra Redação
              </button>
            </div>

            {/* As 5 Competências */}
            <div className="bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-3xl p-6 md:p-8 space-y-6">
              <h3 className="text-lg font-extrabold text-neutral-900 dark:text-white">
                Avaliação Detalhada por Competência
              </h3>

              <div className="space-y-4">
                {evaluation.competencies.map((comp) => (
                  <div
                    key={comp.number}
                    className="p-4 rounded-2xl bg-neutral-50 dark:bg-neutral-950 border border-neutral-200 dark:border-neutral-800 space-y-2"
                  >
                    <div className="flex items-center justify-between">
                      <span className="font-extrabold text-xs text-blue-600 dark:text-blue-400">
                        Competência {comp.number}: {comp.name}
                      </span>
                      <span className="px-3 py-1 rounded-full bg-blue-500/10 text-blue-700 dark:text-blue-300 font-extrabold text-xs">
                        {comp.score} / 200 pts
                      </span>
                    </div>
                    <p className="text-xs text-neutral-700 dark:text-neutral-300 leading-relaxed">
                      {comp.feedback}
                    </p>
                  </div>
                ))}
              </div>
            </div>

            {/* Dicas de Repertório e Pontos Fortes */}
            <div className="grid gap-6 md:grid-cols-2">
              <div className="p-6 rounded-3xl bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 space-y-3">
                <div className="flex items-center gap-2 font-extrabold text-emerald-600 text-xs uppercase tracking-wider">
                  <CheckCircle2 className="h-4 w-4" />
                  Pontos Fortes do Seu Texto
                </div>
                <ul className="space-y-2 text-xs text-neutral-700 dark:text-neutral-300">
                  {evaluation.strengths.map((s, i) => (
                    <li key={i} className="flex items-start gap-2">
                      <span className="text-emerald-500 font-bold">•</span>
                      {s}
                    </li>
                  ))}
                </ul>
              </div>

              <div className="p-6 rounded-3xl bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 space-y-3">
                <div className="flex items-center gap-2 font-extrabold text-amber-600 text-xs uppercase tracking-wider">
                  <Lightbulb className="h-4 w-4" />
                  Sugestões de Repertório Sociocultural
                </div>
                <ul className="space-y-2 text-xs text-neutral-700 dark:text-neutral-300">
                  {evaluation.repertoireSuggestions.map((r, i) => (
                    <li key={i} className="flex items-start gap-2">
                      <span className="text-amber-500 font-bold">•</span>
                      {r}
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </div>
        )}
      </main>

      <SiteFooter />
    </div>
  );
}
