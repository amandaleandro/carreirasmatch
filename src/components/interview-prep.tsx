"use client";

import { useState } from "react";

type QuestionProgress = {
  answer: string;
  feedback: string;
  strongPoints: string[];
  improvementTips: string[];
  clarity: number;
  technicalDepth: number;
  confidence: number;
};

function ChevronIcon({ className, open }: { className?: string; open: boolean }) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      className={`${className} transition-transform ${open ? "rotate-90" : ""}`}
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
function RefreshIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" className={className}>
      <path d="M4 12a8 8 0 0 1 14-5.3M20 12a8 8 0 0 1-14 5.3" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
      <path d="M18 3v4h-4M6 21v-4h4" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

function ScoreRow({
  icon: Icon,
  label,
  value,
}: {
  icon: (p: { className?: string }) => React.JSX.Element;
  label: string;
  value: number;
}) {
  return (
    <div className="flex items-center gap-3">
      <span className="h-8 w-8 rounded-lg bg-neutral-100 dark:bg-neutral-800 flex items-center justify-center shrink-0 text-neutral-500">
        <Icon className="h-4 w-4" />
      </span>
      <div className="flex-1 min-w-0">
        <div className="flex justify-between text-sm mb-1">
          <span>{label}</span>
          <span className="text-neutral-500">{value}/100</span>
        </div>
        <div className="h-1.5 w-full rounded-full bg-neutral-200 dark:bg-neutral-800">
          <div className="h-1.5 rounded-full bg-blue-600" style={{ width: `${value}%` }} />
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
  const activeFeedback = expanded !== null ? progress[expanded] : undefined;
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
    <div className="px-4 md:px-8 py-8 max-w-7xl mx-auto w-full space-y-6">
      <div>
        <span className="inline-flex items-center gap-1.5 text-[11px] font-semibold uppercase tracking-wider rounded-full px-3 py-1 mb-3 bg-blue-50 text-blue-600 border border-blue-200 dark:bg-blue-950/40 dark:text-blue-300 dark:border-blue-900">
          Simulação de entrevista
        </span>
        <h1 className="text-2xl md:text-3xl font-bold tracking-tight">Prepare-se para a entrevista</h1>
        <p className="text-neutral-600 dark:text-neutral-400 mt-2">
          Treine com perguntas baseadas na vaga selecionada e receba feedback
          da IA para melhorar suas respostas.
        </p>
      </div>

      <div className="rounded-2xl border border-neutral-200/80 dark:border-neutral-800 bg-white dark:bg-neutral-950 p-5 shadow-sm shadow-slate-900/5 flex items-center justify-between flex-wrap gap-2">
        <p className="font-medium">{jobTitle}</p>
        <span className="flex items-center gap-1.5 text-xs font-medium rounded-full px-3 py-1 bg-emerald-50 text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-300">
          <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" /> Simulação ativa
        </span>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-start">
        <div className="lg:col-span-2 rounded-2xl border border-neutral-200/80 dark:border-neutral-800 bg-white dark:bg-neutral-950 p-6 shadow-sm shadow-slate-900/5">
          <div className="flex items-center justify-between mb-4 flex-wrap gap-2">
            <h2 className="font-semibold flex items-center gap-1.5">
              Perguntas prováveis <InfoIcon className="h-4 w-4 text-neutral-400" />
            </h2>
            <div className="flex items-center gap-2">
              <span className="text-xs text-neutral-500">
                {answeredCount} de {questions.length} {finalized ? "respondidas" : "prontas para enviar"}
              </span>
              <div className="h-1.5 w-24 rounded-full bg-neutral-200 dark:bg-neutral-800">
                <div
                  className="h-1.5 rounded-full bg-blue-600"
                  style={{ width: `${(answeredCount / questions.length) * 100}%` }}
                />
              </div>
            </div>
          </div>

          <div className="space-y-2">
            {questions.map((q, i) => {
              const draftText = (drafts[i] ?? progress[i]?.answer ?? "").trim();
              const done = finalized && Boolean(progress[i]);
              const filled = !done && draftText.length > 0;
              const isOpen = expanded === i;
              const next = questions.findIndex((_, j) => j > i && !(drafts[j] ?? progress[j]?.answer ?? "").trim());
              return (
                <div
                  key={i}
                  className={`rounded-xl border transition-colors ${
                    isOpen
                      ? "border-blue-300 dark:border-blue-800 bg-blue-50/50 dark:bg-blue-950/20"
                      : "border-neutral-200 dark:border-neutral-800 hover:border-neutral-300 dark:hover:border-neutral-700"
                  }`}
                >
                  <button
                    type="button"
                    onClick={() => setExpanded(isOpen ? null : i)}
                    className="w-full flex items-center gap-3 p-3 text-left"
                  >
                    <span
                      className={`h-6 w-6 rounded-full flex items-center justify-center text-xs font-semibold shrink-0 ${
                        done
                          ? "bg-emerald-500 text-white"
                          : filled
                          ? "bg-blue-200 dark:bg-blue-900 text-blue-700 dark:text-blue-300"
                          : isOpen
                          ? "bg-blue-600 text-white"
                          : "bg-neutral-200 dark:bg-neutral-800 text-neutral-500"
                      }`}
                    >
                      {done ? "✓" : i + 1}
                    </span>
                    <span className="flex-1 text-sm font-medium">{q}</span>
                    <ChevronIcon className="h-4 w-4 text-neutral-400 shrink-0" open={isOpen} />
                  </button>

                  {isOpen && (
                    <div className="px-3 pb-3">
                      <textarea
                        value={drafts[i] ?? progress[i]?.answer ?? ""}
                        onChange={(e) => setDrafts((prev) => ({ ...prev, [i]: e.target.value }))}
                        rows={3}
                        maxLength={1500}
                        placeholder="Escreva sua resposta aqui..."
                        className="w-full rounded-xl border border-neutral-200 dark:border-white/10 bg-white dark:bg-white/[0.03] px-3.5 py-2.5 text-sm outline-none focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 transition-colors"
                      />
                      <div className="flex items-center justify-between mt-1.5">
                        <span className="text-xs text-neutral-400">
                          {(drafts[i] ?? progress[i]?.answer ?? "").length}/1500
                        </span>
                        {next !== -1 && (
                          <button
                            type="button"
                            onClick={() => setExpanded(next)}
                            className="text-sm text-blue-600 dark:text-blue-400 font-medium hover:underline"
                          >
                            Próxima pergunta →
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

        <div className="space-y-6">
          <div className="rounded-2xl border border-neutral-200/80 dark:border-neutral-800 bg-white dark:bg-neutral-950 p-6 shadow-sm shadow-slate-900/5">
            <h2 className="font-semibold mb-4 flex items-center gap-1.5">
              Feedback da IA <InfoIcon className="h-4 w-4 text-neutral-400" />
            </h2>
            {latestFeedback ? (
              <div className="space-y-4">
                <ScoreRow icon={ChatIcon} label="Clareza" value={latestFeedback.clarity} />
                <ScoreRow icon={BulbIcon} label="Domínio da área" value={latestFeedback.technicalDepth} />
                <ScoreRow icon={ShieldIcon} label="Confiança" value={latestFeedback.confidence} />
              </div>
            ) : (
              <p className="text-sm text-neutral-500">
                Responda todas as perguntas e clique em &quot;Finalizar simulação&quot;
                para receber o feedback da IA de uma vez.
              </p>
            )}
          </div>

          {latestFeedback && (
            <div className="rounded-2xl border border-emerald-200 dark:border-emerald-900 bg-emerald-50 dark:bg-emerald-950/30 p-4 shadow-sm shadow-emerald-900/5">
              <p className="text-sm font-semibold flex items-center gap-1.5 mb-2">
                <BulbIcon className="h-4 w-4" /> Como melhorar sua resposta
              </p>
              <ul className="space-y-1 text-sm text-neutral-700 dark:text-neutral-300 list-disc list-inside">
                {latestFeedback.improvementTips.map((tip, i) => (
                  <li key={i}>{tip}</li>
                ))}
              </ul>
            </div>
          )}

          <div className="rounded-2xl border border-neutral-200/80 dark:border-neutral-800 bg-white dark:bg-neutral-950 p-6 shadow-sm shadow-slate-900/5">
            <h2 className="font-semibold mb-4 flex items-center gap-1.5">
              Roteiro sugerido <InfoIcon className="h-4 w-4 text-neutral-400" />
            </h2>
            <div className="space-y-3 text-sm">
              <div>
                <p className="font-medium text-blue-600 dark:text-blue-400">Situação</p>
                <p className="text-neutral-500">
                  Apresente o contexto do seu projeto ou experiência.
                </p>
              </div>
              <div>
                <p className="font-medium text-emerald-600 dark:text-emerald-400">Ação</p>
                <p className="text-neutral-500">
                  Explique o que você fez, ferramentas e decisões.
                </p>
              </div>
              <div>
                <p className="font-medium text-purple-600 dark:text-purple-400">Resultado</p>
                <p className="text-neutral-500">
                  Mostre o impacto e o que você aprendeu.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {error && <p className="text-sm text-red-500 text-right">{error}</p>}

      <div className="flex justify-end gap-3 flex-wrap">
        <button
          type="button"
          onClick={resetSimulation}
          disabled={regenerating || finalizing}
          className="flex items-center gap-1.5 rounded-xl border border-neutral-200 dark:border-neutral-700 font-semibold px-5 py-3 hover:bg-neutral-50 dark:hover:bg-neutral-900 transition-colors disabled:opacity-50"
        >
          <RefreshIcon className="h-4 w-4" /> {regenerating ? "Gerando..." : "Gerar nova simulação"}
        </button>
        <button
          type="button"
          onClick={finalizeSimulation}
          disabled={finalizing || regenerating || !allAnswered}
          className="flex items-center gap-1.5 rounded-xl bg-blue-600 text-white font-semibold px-5 py-3 shadow-sm shadow-blue-600/20 hover:bg-blue-700 transition-all disabled:opacity-50"
        >
          <ChatIcon className="h-4 w-4" />
          {finalizing ? "Avaliando respostas..." : "Finalizar simulação e ver feedback"}
        </button>
      </div>
    </div>
  );
}
