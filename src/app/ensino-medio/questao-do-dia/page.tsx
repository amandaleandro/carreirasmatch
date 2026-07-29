"use client";

import { useState, useEffect } from "react";
import { PublicSiteHeader } from "@/components/public-site-header";
import { SiteFooter } from "@/components/site-footer";
import { EnsinoMedioToolsNav } from "@/components/ensino-medio-tools-nav";
import { DailyQuestion } from "@/lib/ensino-medio-tools";
import {
  Sparkles,
  CheckCircle2,
  XCircle,
  Lightbulb,
  Trophy,
  RotateCcw,
} from "lucide-react";

export default function DailyQuestionPage() {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [data, setData] = useState<DailyQuestion | null>(null);
  const [selectedOption, setSelectedOption] = useState<number | null>(null);
  const [showHint, setShowHint] = useState(false);
  const [isAnswered, setIsAnswered] = useState(false);

  const fetchQuestion = async () => {
    setLoading(true);
    setError(null);
    setSelectedOption(null);
    setShowHint(false);
    setIsAnswered(false);

    try {
      const res = await fetch("/api/ensino-medio/questao-do-dia");
      if (!res.ok) throw new Error("Erro ao buscar a questão do dia.");
      const json = await res.json();
      if (json.error) throw new Error(json.error);

      setData(json);
    } catch (err) {
      console.error(err);
      setError("Não foi possível carregar a questão do dia.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    queueMicrotask(() => {
      void fetchQuestion();
    });
  }, []);

  const handleSelect = (idx: number) => {
    if (isAnswered) return;
    setSelectedOption(idx);
    setIsAnswered(true);
  };

  return (
    <div className="min-h-screen flex flex-col bg-neutral-50 dark:bg-neutral-950 text-neutral-900 dark:text-neutral-50 font-sans">
      <PublicSiteHeader />
      <EnsinoMedioToolsNav />

      <main className="flex-1 max-w-4xl w-full mx-auto px-4 md:px-8 py-8 space-y-8">
        <header className="text-center max-w-2xl mx-auto space-y-3">
          <div className="inline-flex items-center gap-1.5 rounded-full bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/20 px-3 py-1 text-xs font-bold uppercase tracking-wider">
            <Trophy className="h-3.5 w-3.5" />
            Desafio Diário ENEM com Gemini
          </div>
          <h1 className="text-3xl md:text-4xl font-bold text-neutral-900 dark:text-white">
            Questão do Dia
          </h1>
          <p className="text-neutral-600 dark:text-neutral-400 text-xs md:text-sm leading-relaxed">
            Uma questão inédita todos os dias para você manter a consistência de estudos e testar seus conhecimentos.
          </p>
        </header>

        {loading ? (
          <div className="bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-3xl p-12 text-center space-y-3 shadow-sm">
            <Sparkles className="h-8 w-8 text-amber-500 animate-spin mx-auto" />
            <p className="text-xs font-bold text-neutral-500">
              Gerando a questão do dia com Gemini AI...
            </p>
          </div>
        ) : error || !data ? (
          <div className="bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-3xl p-8 text-center space-y-4 shadow-sm">
            <p className="text-xs font-bold text-red-600">{error}</p>
            <button
              onClick={fetchQuestion}
              className="px-4 py-2 rounded-xl bg-neutral-100 dark:bg-neutral-800 text-xs font-bold"
            >
              Tentar Novamente
            </button>
          </div>
        ) : (
          <div className="bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-3xl p-6 md:p-8 space-y-6 shadow-sm">
            {/* Header da Questão */}
            <div className="flex flex-wrap items-center justify-between gap-2 border-b border-neutral-100 dark:border-neutral-800 pb-4">
              <div className="flex items-center gap-2">
                <span className="px-3 py-1 rounded-full bg-blue-500/10 text-blue-600 font-extrabold text-xs">
                  {data.subject}
                </span>
                <span className="text-xs font-bold text-neutral-500">
                  {data.topic}
                </span>
              </div>
              <span className="text-[11px] font-mono text-neutral-400">
                {data.enemYearOrOrigin} • {data.date}
              </span>
            </div>

            {/* Enunciado */}
            <div className="space-y-4">
              <h2 className="text-base md:text-lg font-bold text-neutral-900 dark:text-white leading-relaxed">
                {data.question}
              </h2>

              {/* Botão de Dica */}
              {!isAnswered && (
                <div>
                  <button
                    onClick={() => setShowHint(!showHint)}
                    className="inline-flex items-center gap-1.5 text-xs font-bold text-amber-600 dark:text-amber-400 hover:underline"
                  >
                    <Lightbulb className="h-3.5 w-3.5" />
                    {showHint ? "Esconder Dica" : "Ver Dica do Professor"}
                  </button>
                  {showHint && (
                    <div className="mt-2 p-3 rounded-xl bg-amber-50 dark:bg-amber-950/40 border border-amber-200 text-xs text-amber-900 dark:text-amber-200 font-medium">
                      💡 {data.hint}
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* Alternativas */}
            <div className="space-y-3">
              {data.options.map((opt, idx) => {
                const isSelected = selectedOption === idx;
                const isCorrect = idx === data.correctAnswerIndex;

                let buttonStyle =
                  "bg-neutral-50 dark:bg-neutral-950 border-neutral-200 dark:border-neutral-800 text-neutral-800 dark:text-neutral-200 hover:border-amber-500";

                if (isAnswered) {
                  if (isCorrect) {
                    buttonStyle =
                      "bg-emerald-50 dark:bg-emerald-950/40 border-emerald-500 text-emerald-900 dark:text-emerald-200 font-bold";
                  } else if (isSelected) {
                    buttonStyle =
                      "bg-red-50 dark:bg-red-950/40 border-red-500 text-red-900 dark:text-red-200 line-through";
                  }
                }

                return (
                  <button
                    key={idx}
                    onClick={() => handleSelect(idx)}
                    disabled={isAnswered}
                    className={`w-full text-left p-4 rounded-2xl border text-xs md:text-sm transition-all flex items-center justify-between ${buttonStyle}`}
                  >
                    <span>{opt}</span>
                    {isAnswered && isCorrect && (
                      <CheckCircle2 className="h-4 w-4 text-emerald-600 shrink-0 ml-2" />
                    )}
                    {isAnswered && isSelected && !isCorrect && (
                      <XCircle className="h-4 w-4 text-red-600 shrink-0 ml-2" />
                    )}
                  </button>
                );
              })}
            </div>

            {/* Gabarito Explicado */}
            {isAnswered && (
              <div className="p-5 rounded-2xl bg-blue-50/60 dark:bg-blue-950/30 border border-blue-200 dark:border-blue-800 space-y-2">
                <div className="flex items-center gap-2 font-extrabold text-xs uppercase tracking-wider text-blue-700 dark:text-blue-300">
                  <CheckCircle2 className="h-4 w-4" />
                  Resolução Comentada
                </div>
                <p className="text-xs md:text-sm text-blue-900 dark:text-blue-100 leading-relaxed font-medium">
                  {data.explanation}
                </p>
              </div>
            )}

            {isAnswered && (
              <button
                onClick={fetchQuestion}
                className="w-full py-3 rounded-xl bg-neutral-900 hover:bg-neutral-800 text-white font-bold text-xs transition-all flex items-center justify-center gap-2"
              >
                <RotateCcw className="h-4 w-4" />
                Gerar Outra Questão de Desafio
              </button>
            )}
          </div>
        )}
      </main>

      <SiteFooter />
    </div>
  );
}
