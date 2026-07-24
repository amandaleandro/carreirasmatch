"use client";

import { useState } from "react";

type QuestionProgress = {
  answer: string;
  feedback: string;
  strongPoints: string[];
  improvementTips: string[];
  suggestedAnswer?: string;
  starBreakdown?: {
    situation: string;
    action: string;
    result: string;
  };
  clarity: number;
  technicalDepth: number;
  confidence: number;
};

function ChevronIcon({ className, open }: { className?: string; open: boolean }) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      className={`${className} transition-transform duration-200 ${open ? "rotate-90" : ""}`}
    >
      <path d="m9 6 6 6-6 6" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}
function InfoIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" className={className}>
      <circle cx="12" cy="12" r="9" stroke="currentColor" strokeWidth="1.6" />
      <path d="M12 11v5.5M12 8v.01" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
    </svg>
  );
}
function ChatIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" className={className}>
      <path d="M4 5h16v11H8l-4 4V5Z" stroke="currentColor" strokeWidth="1.8" strokeLinejoin="round" />
    </svg>
  );
}
function ShieldIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" className={className}>
      <path d="M12 3.5 19 6v6c0 4.5-3 7-7 8.5-4-1.5-7-4-7-8.5V6l7-2.5Z" stroke="currentColor" strokeWidth="1.6" strokeLinejoin="round" />
    </svg>
  );
}
function BulbIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" className={className}>
      <path d="M9 18h6M10 21h4M12 3a6 6 0 0 0-3.5 10.9c.5.4.8 1 .8 1.6h5.4c0-.6.3-1.2.8-1.6A6 6 0 0 0 12 3Z" stroke="currentColor" strokeWidth="1.6" strokeLinejoin="round" />
    </svg>
  );
}
function SparklesIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" className={className}>
      <path d="m12 3 2.5 5.5L20 11l-5.5 2.5L12 19l-2.5-5.5L4 11l5.5-2.5L12 3Z" stroke="currentColor" strokeWidth="1.6" strokeLinejoin="round" />
      <path d="M5 3 6 5l2 1-2 1-1 2-1-2-2-1 2-1 1-2Z" stroke="currentColor" strokeWidth="1.4" strokeLinejoin="round" />
    </svg>
  );
}
function CheckCircleIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" className={className}>
      <circle cx="12" cy="12" r="9" stroke="currentColor" strokeWidth="1.6" />
      <path d="m8.5 12 2.5 2.5 4.5-5" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}
function RefreshIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" className={className}>
      <path d="M4 12a8 8 0 0 1 14-5.3M20 12a8 8 0 0 1-14 5.3" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
      <path d="M18 3v4h-4M6 21v-4h4" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

function ScoreGauge({
  icon: Icon,
  label,
  value,
  gradient,
}: {
  icon: (p: { className?: string }) => React.JSX.Element;
  label: string;
  value: number;
  gradient: string;
}) {
  return (
    <div className="flex items-center gap-3.5 group">
      <span className="h-9 w-9 rounded-xl bg-neutral-100 dark:bg-neutral-800/80 flex items-center justify-center shrink-0 text-neutral-600 dark:text-neutral-300 group-hover:scale-105 transition-transform">
        <Icon className="h-4.5 w-4.5" />
      </span>
      <div className="flex-1 min-w-0">
        <div className="flex justify-between items-center text-sm mb-1.5">
          <span className="font-medium text-neutral-700 dark:text-neutral-200">{label}</span>
          <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-neutral-100 dark:bg-neutral-800 text-neutral-700 dark:text-neutral-300">
            {value}/100
          </span>
        </div>
        <div className="h-2 w-full rounded-full bg-neutral-100 dark:bg-neutral-800 overflow-hidden">
          <div
            className={`h-full rounded-full ${gradient} transition-all duration-700 ease-out`}
            style={{ width: `${value}%` }}
          />
        </div>
      </div>
    </div>
  );
}

export function InterviewPrep({
  analysisId,
  jobTitle,
  questions: initialQuestions,
  initialProgress,
}: {
  analysisId: string;
  jobTitle: string;
  questions: string[];
  initialProgress: Record<string, QuestionProgress>;
}) {
  const [questions, setQuestions] = useState<string[]>(initialQuestions);
  const [progress, setProgress] = useState<Record<string, QuestionProgress>>(initialProgress);
  const [expanded, setExpanded] = useState<number | null>(0);
  const [drafts, setDrafts] = useState<Record<number, string>>({});
  const [finalizing, setFinalizing] = useState(false);
  const [regenerating, setRegenerating] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const finalized = Object.keys(progress).length > 0;
  const answeredIndexes = Object.keys(progress).map(Number).sort((a, b) => a - b);
  const lastAnsweredIndex = answeredIndexes[answeredIndexes.length - 1];

  const activeQuestionIndex = expanded !== null ? expanded : (lastAnsweredIndex ?? 0);
  const activeFeedback = progress[activeQuestionIndex];
  const latestFeedback = activeFeedback ?? (lastAnsweredIndex !== undefined ? progress[lastAnsweredIndex] : undefined);

  const draftAnsweredCount = questions.filter((_, i) => (drafts[i] ?? progress[i]?.answer ?? "").trim()).length;
  const answeredCount = finalized ? Object.keys(progress).length : draftAnsweredCount;
  const allAnswered = draftAnsweredCount === questions.length;

  async function finalizeSimulation() {
    if (!allAnswered) {
      setError("Responda todas as perguntas antes de finalizar a simulação.");
      return;
    }
    setError(null);
    setFinalizing(true);
    try {
      const qas = questions.map((q, i) => ({ question: q, answer: (drafts[i] ?? progress[i]?.answer ?? "").trim() }));

      const res = await fetch("/api/tools/interview-feedback", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ qas, jobTitle }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "Erro ao processar.");

      const nextProgress: Record<string, QuestionProgress> = {};
      qas.forEach((qa, i) => {
        nextProgress[i] = { answer: qa.answer, ...data.results[i] };
      });
      setProgress(nextProgress);
      setExpanded(0);

      await fetch(`/api/interviews/${analysisId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ progress: nextProgress }),
      });
    } catch (err) {
      setError(err instanceof Error ? err.message : "Erro inesperado.");
    } finally {
      setFinalizing(false);
    }
  }

  async function resetSimulation() {
    setError(null);
    setRegenerating(true);
    try {
      const res = await fetch(`/api/interviews/${analysisId}/regenerate`, { method: "POST" });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "Erro ao gerar novas perguntas.");

      setQuestions(data.questions);
      setProgress({});
      setDrafts({});
      setExpanded(0);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Erro inesperado.");
    } finally {
      setRegenerating(false);
    }
  }

  if (questions.length === 0) {
    return (
      <div className="max-w-3xl mx-auto px-4 py-16 w-full text-center">
        <h1 className="text-2xl font-bold tracking-tight">Prepare-se para a entrevista</h1>
        <p className="text-neutral-600 dark:text-neutral-400 mt-2">
          Sua última análise não gerou perguntas de entrevista. Faça uma nova
          análise para treinar aqui.
        </p>
      </div>
    );
  }

  return (
    <div className="px-4 md:px-8 py-8 max-w-7xl mx-auto w-full space-y-8">
      {/* Header Banner */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-neutral-900 via-indigo-950 to-slate-900 p-6 md:p-8 text-white shadow-xl shadow-indigo-950/10 border border-white/10">
        <div className="absolute top-0 right-0 -mt-8 -mr-8 w-64 h-64 rounded-full bg-blue-500/10 blur-3xl pointer-events-none" />
        <div className="relative z-10 space-y-3">
          <span className="inline-flex items-center gap-1.5 text-[11px] font-bold uppercase tracking-wider rounded-full px-3 py-1 bg-white/10 text-blue-200 border border-white/15 backdrop-blur-md">
            <SparklesIcon className="h-3.5 w-3.5 text-blue-300" /> Simulação de entrevista
          </span>
          <h1 className="text-2xl md:text-3xl lg:text-4xl font-extrabold tracking-tight">
            Prepare-se para a entrevista
          </h1>
          <p className="text-neutral-300 max-w-2xl text-sm md:text-base leading-relaxed">
            Treine com perguntas customizadas para a vaga e receba um feedback completo com diagnóstico do recrutador, dicas de melhoria e exemplos de respostas modelo Nota 10.
          </p>
        </div>
      </div>

      {/* Cargo Card */}
      <div className="rounded-2xl border border-neutral-200/80 dark:border-neutral-800 bg-white/90 dark:bg-neutral-900/90 backdrop-blur-md p-5 shadow-sm flex items-center justify-between flex-wrap gap-3">
        <div className="flex items-center gap-3">
          <div className="h-10 w-10 rounded-xl bg-blue-50 dark:bg-blue-950/50 flex items-center justify-center text-blue-600 dark:text-blue-400 font-bold text-lg border border-blue-100 dark:border-blue-900/50">
            💼
          </div>
          <div>
            <p className="text-xs uppercase font-semibold text-neutral-400">Vaga selecionada</p>
            <p className="font-bold text-neutral-900 dark:text-white text-base md:text-lg">{jobTitle}</p>
          </div>
        </div>
        <span className="flex items-center gap-2 text-xs font-semibold rounded-full px-3.5 py-1.5 bg-emerald-50 text-emerald-700 dark:bg-emerald-950/50 dark:text-emerald-300 border border-emerald-200/60 dark:border-emerald-900/50">
          <span className="relative flex h-2 w-2">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
            <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500" />
          </span>
          Simulação ativa
        </span>
      </div>

      {/* Main Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
        {/* Left Column: Questions */}
        <div className="lg:col-span-2 rounded-3xl border border-neutral-200/80 dark:border-neutral-800 bg-white dark:bg-neutral-950 p-6 md:p-7 shadow-sm space-y-6">
          <div className="flex items-center justify-between flex-wrap gap-3 pb-4 border-b border-neutral-100 dark:border-neutral-800/80">
            <div>
              <h2 className="font-bold text-lg text-neutral-900 dark:text-white flex items-center gap-2">
                Perguntas da Entrevista <InfoIcon className="h-4 w-4 text-neutral-400" />
              </h2>
              <p className="text-xs text-neutral-500 mt-0.5">
                Responda com calma como se estivesse no dia da entrevista.
              </p>
            </div>

            <div className="flex items-center gap-3 bg-neutral-50 dark:bg-neutral-900 px-3.5 py-1.5 rounded-full border border-neutral-200/60 dark:border-neutral-800">
              <span className="text-xs font-medium text-neutral-600 dark:text-neutral-400">
                <strong className="text-blue-600 dark:text-blue-400 font-bold">{answeredCount}</strong> de {questions.length} respondidas
              </span>
              <div className="h-2 w-20 rounded-full bg-neutral-200 dark:bg-neutral-800 overflow-hidden">
                <div
                  className="h-full rounded-full bg-gradient-to-r from-blue-600 to-indigo-600 transition-all duration-500"
                  style={{ width: `${(answeredCount / questions.length) * 100}%` }}
                />
              </div>
            </div>
          </div>

          <div className="space-y-3.5">
            {questions.map((q, i) => {
              const draftText = (drafts[i] ?? progress[i]?.answer ?? "").trim();
              const done = finalized && Boolean(progress[i]);
              const filled = !done && draftText.length > 0;
              const isOpen = expanded === i;
              const next = questions.findIndex((_, j) => j > i && !(drafts[j] ?? progress[j]?.answer ?? "").trim());

              return (
                <div
                  key={i}
                  className={`rounded-2xl border transition-all duration-200 overflow-hidden ${
                    isOpen
                      ? "border-blue-400 dark:border-blue-800 bg-blue-50/40 dark:bg-blue-950/20 shadow-md shadow-blue-500/5 ring-1 ring-blue-400/20"
                      : "border-neutral-200/90 dark:border-neutral-800/90 hover:border-neutral-300 dark:hover:border-neutral-700 bg-white dark:bg-neutral-900/50"
                  }`}
                >
                  <button
                    type="button"
                    onClick={() => setExpanded(isOpen ? null : i)}
                    className="w-full flex items-center gap-3.5 p-4 text-left group"
                  >
                    <span
                      className={`h-7 w-7 rounded-xl flex items-center justify-center text-xs font-bold shrink-0 transition-all ${
                        done
                          ? "bg-emerald-500 text-white shadow-sm shadow-emerald-500/30"
                          : filled
                          ? "bg-blue-600 text-white shadow-sm shadow-blue-600/30"
                          : isOpen
                          ? "bg-indigo-600 text-white"
                          : "bg-neutral-100 dark:bg-neutral-800 text-neutral-500 group-hover:bg-neutral-200 dark:group-hover:bg-neutral-700"
                      }`}
                    >
                      {done ? "✓" : i + 1}
                    </span>
                    <span className="flex-1 text-sm font-semibold text-neutral-800 dark:text-neutral-200 leading-snug">
                      {q}
                    </span>
                    <ChevronIcon className="h-4 w-4 text-neutral-400 shrink-0" open={isOpen} />
                  </button>

                  {isOpen && (
                    <div className="px-4 pb-4 space-y-2.5">
                      <textarea
                        value={drafts[i] ?? progress[i]?.answer ?? ""}
                        onChange={(e) => setDrafts((prev) => ({ ...prev, [i]: e.target.value }))}
                        rows={5}
                        maxLength={1500}
                        placeholder="Escreva sua resposta com o máximo de detalhes possível (contexto, o que fez, ferramentas utilizadas e o resultado)..."
                        className="w-full rounded-xl border border-neutral-200 dark:border-neutral-700/80 bg-white dark:bg-neutral-900 px-4 py-3 text-sm text-neutral-900 dark:text-neutral-100 placeholder:text-neutral-400 outline-none focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 transition-all leading-relaxed"
                      />
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-medium text-neutral-400">
                          {(drafts[i] ?? progress[i]?.answer ?? "").length}/1500 caracteres
                        </span>
                        {next !== -1 && (
                          <button
                            type="button"
                            onClick={() => setExpanded(next)}
                            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-blue-50 dark:bg-blue-950/60 text-xs font-bold text-blue-600 dark:text-blue-400 hover:bg-blue-100 dark:hover:bg-blue-900/80 transition-all group"
                          >
                            <span>Ir para próxima pergunta</span>
                            <span className="group-hover:translate-x-1 transition-transform">→</span>
                          </button>
                        )}
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>

        {/* Right Column: Feedback & Educational Content */}
        <div className="space-y-6">
          {/* IA Score & Diagnostic Card */}
          <div className="rounded-3xl border border-neutral-200/80 dark:border-neutral-800 bg-white dark:bg-neutral-950 p-6 shadow-sm space-y-5">
            <div className="flex items-center justify-between border-b border-neutral-100 dark:border-neutral-800/80 pb-3">
              <h2 className="font-bold text-base text-neutral-900 dark:text-white flex items-center gap-2">
                Feedback da IA <InfoIcon className="h-4 w-4 text-neutral-400" />
              </h2>
              {finalized && activeQuestionIndex !== null && (
                <span className="text-xs font-bold px-3 py-1 rounded-full bg-blue-50 dark:bg-blue-950 text-blue-600 dark:text-blue-300 border border-blue-200/50 dark:border-blue-900/50">
                  Pergunta #{activeQuestionIndex + 1}
                </span>
              )}
            </div>

            {latestFeedback ? (
              <div className="space-y-5">
                {latestFeedback.feedback && (
                  <div className="p-4 rounded-2xl bg-gradient-to-br from-blue-50/70 via-indigo-50/30 to-white dark:from-blue-950/30 dark:via-indigo-950/20 dark:to-neutral-900 border border-blue-100 dark:border-blue-900/50 text-sm">
                    <p className="font-bold text-xs uppercase tracking-wider text-blue-600 dark:text-blue-400 mb-1.5 flex items-center gap-1.5">
                      <ChatIcon className="h-3.5 w-3.5" /> Análise do Recrutador
                    </p>
                    <p className="leading-relaxed text-neutral-700 dark:text-neutral-300 text-sm">
                      {latestFeedback.feedback}
                    </p>
                  </div>
                )}

                <div className="space-y-3.5 pt-1">
                  <ScoreGauge
                    icon={ChatIcon}
                    label="Clareza da resposta"
                    value={latestFeedback.clarity}
                    gradient="bg-gradient-to-r from-blue-500 to-indigo-600"
                  />
                  <ScoreGauge
                    icon={BulbIcon}
                    label="Domínio técnico da área"
                    value={latestFeedback.technicalDepth}
                    gradient="bg-gradient-to-r from-emerald-500 to-teal-600"
                  />
                  <ScoreGauge
                    icon={ShieldIcon}
                    label="Confiança e postura"
                    value={latestFeedback.confidence}
                    gradient="bg-gradient-to-r from-violet-500 to-purple-600"
                  />
                </div>
              </div>
            ) : (
              <div className="text-center py-6 px-4 space-y-2">
                <div className="h-12 w-12 rounded-2xl bg-blue-50 dark:bg-blue-950/50 text-blue-600 dark:text-blue-400 flex items-center justify-center mx-auto text-xl font-bold">
                  🎯
                </div>
                <p className="text-sm font-semibold text-neutral-700 dark:text-neutral-300">
                  Pronto para treinar?
                </p>
                <p className="text-xs text-neutral-500 max-w-xs mx-auto">
                  Escreva suas respostas para as perguntas ao lado e clique em &quot;Finalizar simulação&quot; para gerar o feedback completo.
                </p>
              </div>
            )}
          </div>

          {/* Educational Feedback Sections */}
          {latestFeedback && (
            <>
              {/* Pontos Fortes */}
              {latestFeedback.strongPoints && latestFeedback.strongPoints.length > 0 && (
                <div className="rounded-3xl border border-emerald-200/80 dark:border-emerald-900/60 bg-gradient-to-br from-emerald-50/80 to-teal-50/30 dark:from-emerald-950/30 dark:to-neutral-950 p-6 shadow-sm space-y-3">
                  <p className="text-sm font-bold text-emerald-900 dark:text-emerald-300 flex items-center gap-2">
                    <CheckCircleIcon className="h-5 w-5 text-emerald-600 dark:text-emerald-400 shrink-0" />
                    Pontos Fortes Identificados
                  </p>
                  <ul className="space-y-2 text-sm text-emerald-950 dark:text-emerald-200">
                    {latestFeedback.strongPoints.map((point, i) => (
                      <li key={i} className="flex items-start gap-2.5 leading-snug">
                        <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 shrink-0 mt-1.5" />
                        <span>{point}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {/* O Que Faltou & Dicas */}
              {latestFeedback.improvementTips && latestFeedback.improvementTips.length > 0 && (
                <div className="rounded-3xl border border-amber-200/80 dark:border-amber-900/60 bg-gradient-to-br from-amber-50/80 to-orange-50/30 dark:from-amber-950/30 dark:to-neutral-950 p-6 shadow-sm space-y-3">
                  <p className="text-sm font-bold text-amber-900 dark:text-amber-300 flex items-center gap-2">
                    <BulbIcon className="h-5 w-5 text-amber-600 dark:text-amber-400 shrink-0" />
                    O que faltou & Como melhorar
                  </p>
                  <ul className="space-y-2 text-sm text-amber-950 dark:text-amber-200">
                    {latestFeedback.improvementTips.map((tip, i) => (
                      <li key={i} className="flex items-start gap-2.5 leading-snug">
                        <span className="h-1.5 w-1.5 rounded-full bg-amber-500 shrink-0 mt-1.5" />
                        <span>{tip}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {/* Resposta Modelo Nota 10 */}
              {latestFeedback.suggestedAnswer && (
                <div className="rounded-3xl border border-purple-200/80 dark:border-purple-900/60 bg-gradient-to-br from-purple-50/90 via-indigo-50/40 to-white dark:from-purple-950/40 dark:via-indigo-950/20 dark:to-neutral-950 p-6 shadow-sm space-y-3">
                  <div className="flex items-center justify-between">
                    <p className="text-sm font-bold text-purple-950 dark:text-purple-300 flex items-center gap-2">
                      <SparklesIcon className="h-5 w-5 text-purple-600 dark:text-purple-400 shrink-0" />
                      Exemplo de Resposta Modelo (Nota 10)
                    </p>
                  </div>
                  <p className="text-xs text-purple-700 dark:text-purple-300/80 font-medium">
                    Estude esta resposta para aprender a vocabulário, estrutura e profundidade esperados na vaga:
                  </p>
                  <div className="p-4 rounded-2xl bg-white/90 dark:bg-neutral-900/90 border border-purple-100 dark:border-purple-900/40 text-sm italic leading-relaxed text-neutral-800 dark:text-neutral-200 shadow-inner">
                    &quot;{latestFeedback.suggestedAnswer}&quot;
                  </div>
                </div>
              )}
            </>
          )}

          {/* Roteiro STAR Personalizado */}
          <div className="rounded-3xl border border-neutral-200/80 dark:border-neutral-800 bg-white dark:bg-neutral-950 p-6 shadow-sm space-y-4">
            <h2 className="font-bold text-base text-neutral-900 dark:text-white flex items-center gap-2">
              Roteiro Sugerido (Método STAR) <InfoIcon className="h-4 w-4 text-neutral-400" />
            </h2>

            <div className="space-y-3">
              <div className="p-3.5 rounded-2xl bg-blue-50/60 dark:bg-blue-950/20 border-l-4 border-blue-600 dark:border-blue-500 space-y-1">
                <p className="font-bold text-xs uppercase tracking-wider text-blue-700 dark:text-blue-300">
                  1. Situação (Contexto)
                </p>
                <p className="text-xs text-neutral-600 dark:text-neutral-300 leading-relaxed">
                  {latestFeedback?.starBreakdown?.situation ?? "Apresente o cenário, desafio ou projeto de fundo onde a experiência ocorreu."}
                </p>
              </div>

              <div className="p-3.5 rounded-2xl bg-emerald-50/60 dark:bg-emerald-950/20 border-l-4 border-emerald-600 dark:border-emerald-500 space-y-1">
                <p className="font-bold text-xs uppercase tracking-wider text-emerald-700 dark:text-emerald-300">
                  2. Ação (Sua Atuação)
                </p>
                <p className="text-xs text-neutral-600 dark:text-neutral-300 leading-relaxed">
                  {latestFeedback?.starBreakdown?.action ?? "Detalhe exatamente as ferramentas, decisões e passos técnicos/práticos que VOCÊ tomou."}
                </p>
              </div>

              <div className="p-3.5 rounded-2xl bg-purple-50/60 dark:bg-purple-950/20 border-l-4 border-purple-600 dark:border-purple-500 space-y-1">
                <p className="font-bold text-xs uppercase tracking-wider text-purple-700 dark:text-purple-300">
                  3. Resultado (Impacto)
                </p>
                <p className="text-xs text-neutral-600 dark:text-neutral-300 leading-relaxed">
                  {latestFeedback?.starBreakdown?.result ?? "Finalize mostrando os resultados quantitativos/qualitativos gerados e o que aprendeu."}
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {error && <p className="text-sm font-semibold text-red-500 text-right">{error}</p>}

      {/* Floating Bottom Action Bar */}
      <div className="sticky bottom-6 z-20 rounded-2xl border border-neutral-200/80 dark:border-neutral-800 bg-white/90 dark:bg-neutral-950/90 backdrop-blur-md p-4 shadow-xl shadow-slate-900/10 flex items-center justify-between flex-wrap gap-4">
        <p className="text-xs font-semibold text-neutral-500 flex items-center gap-1.5">
          {finalized ? (
            <span className="text-emerald-600 dark:text-emerald-400 flex items-center gap-1 font-bold">
              ✓ Simulação avaliada com sucesso!
            </span>
          ) : (
            <span>Preencha todas as perguntas para obter o feedback completo.</span>
          )}
        </p>

        <div className="flex items-center gap-3.5 flex-wrap">
          <button
            type="button"
            onClick={resetSimulation}
            disabled={regenerating || finalizing}
            className="group relative flex items-center gap-2 rounded-xl border border-neutral-300/80 dark:border-neutral-700 bg-white/80 dark:bg-neutral-900/80 font-bold text-sm px-5 py-3 text-neutral-700 dark:text-neutral-200 hover:bg-neutral-100 dark:hover:bg-neutral-800 hover:border-neutral-400 dark:hover:border-neutral-600 active:scale-[0.98] transition-all duration-200 disabled:opacity-50 disabled:hover:scale-100"
          >
            <RefreshIcon className="h-4.5 w-4.5 text-neutral-500 group-hover:rotate-180 transition-transform duration-500" />
            <span>{regenerating ? "Gerando..." : "Gerar nova simulação"}</span>
          </button>

          <button
            type="button"
            onClick={finalizeSimulation}
            disabled={finalizing || regenerating || !allAnswered}
            className="relative overflow-hidden group rounded-xl bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 text-white font-bold text-sm px-6 py-3 shadow-lg shadow-indigo-500/25 hover:shadow-indigo-500/40 hover:scale-[1.02] active:scale-[0.98] transition-all duration-200 disabled:opacity-50 disabled:hover:scale-100 disabled:shadow-none flex items-center gap-2"
          >
            <span className="absolute inset-0 w-full h-full bg-white/20 transform -skew-x-12 -translate-x-full group-hover:translate-x-full transition-transform duration-1000 ease-out pointer-events-none" />
            <SparklesIcon className="h-4.5 w-4.5 group-hover:rotate-12 group-hover:scale-110 transition-transform" />
            <span>{finalizing ? "Avaliando respostas..." : "Finalizar simulação e ver feedback"}</span>
          </button>
        </div>
      </div>
    </div>
  );
}


