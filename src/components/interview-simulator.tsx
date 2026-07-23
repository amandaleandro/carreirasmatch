"use client";

import { useState } from "react";

type Feedback = {
  feedback: string;
  strongPoints: string[];
  improvementTips: string[];
};

export function InterviewSimulator({
  questions,
  jobTitle,
}: {
  questions: string[];
  jobTitle: string;
}) {
  const [expanded, setExpanded] = useState(0);
  const [answers, setAnswers] = useState<Record<number, string>>({});
  const [loadingIndex, setLoadingIndex] = useState<number | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [feedbacks, setFeedbacks] = useState<Record<number, Feedback>>({});

  async function handleSubmit(index: number) {
    setError(null);
    const answer = (answers[index] ?? "").trim();

    if (!answer) {
      setError("Escreva sua resposta antes de pedir feedback.");
      return;
    }

    setLoadingIndex(index);

    try {
      const res = await fetch("/api/tools/interview-feedback", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ qas: [{ question: questions[index], answer }], jobTitle }),
      });
      const data = await res.json();

      if (!res.ok) throw new Error(data.error ?? "Erro ao processar.");

      setFeedbacks((prev) => ({ ...prev, [index]: data.results[0] as Feedback }));
    } catch (err) {
      setError(err instanceof Error ? err.message : "Erro inesperado.");
    } finally {
      setLoadingIndex(null);
    }
  }

  if (questions.length === 0) return null;

  return (
    <div className="rounded-2xl border border-neutral-200/80 dark:border-neutral-800 bg-white dark:bg-neutral-950 p-5 shadow-sm shadow-slate-900/5 space-y-4">
      <h3 className="font-semibold">Simulado de entrevista</h3>

      <div className="space-y-2">
        {questions.map((q, i) => {
          const isOpen = expanded === i;
          const feedback = feedbacks[i];
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
                onClick={() => setExpanded(isOpen ? -1 : i)}
                className="w-full flex items-center gap-3 p-3 text-left"
              >
                <span
                  className={`h-6 w-6 rounded-full flex items-center justify-center text-xs font-semibold shrink-0 ${
                    feedback
                      ? "bg-emerald-500 text-white"
                      : isOpen
                      ? "bg-blue-600 text-white"
                      : "bg-neutral-200 dark:bg-neutral-800 text-neutral-500"
                  }`}
                >
                  {feedback ? "✓" : i + 1}
                </span>
                <span className="flex-1 text-sm font-medium">{q}</span>
              </button>

              {isOpen && (
                <div className="px-3 pb-3 space-y-3">
                  <textarea
                    value={answers[i] ?? ""}
                    onChange={(e) => setAnswers((prev) => ({ ...prev, [i]: e.target.value }))}
                    rows={5}
                    placeholder="Escreva como você responderia essa pergunta em uma entrevista real"
                    className="w-full rounded-xl border border-neutral-200 dark:border-white/10 bg-white dark:bg-white/[0.03] px-3.5 py-2.5 text-sm outline-none focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 transition-colors"
                  />

                  {error && loadingIndex === null && <p className="text-sm text-red-500">{error}</p>}

                  <button
                    type="button"
                    onClick={() => handleSubmit(i)}
                    disabled={loadingIndex !== null}
                    className="rounded-xl bg-blue-600 text-white font-semibold px-5 py-2.5 text-sm shadow-sm shadow-blue-600/20 hover:bg-blue-700 transition-all disabled:opacity-50"
                  >
                    {loadingIndex === i ? "Avaliando..." : "Pedir feedback"}
                  </button>

                  {feedback && (
                    <div className="border-t border-neutral-200 dark:border-neutral-800 pt-3 space-y-3">
                      <p className="text-sm text-neutral-700 dark:text-neutral-300">
                        {feedback.feedback}
                      </p>
                      {feedback.strongPoints.length > 0 && (
                        <div>
                          <p className="text-xs font-semibold uppercase tracking-wide text-neutral-500 mb-1">
                            Pontos fortes
                          </p>
                          <ul className="space-y-1 list-disc list-inside text-sm text-neutral-700 dark:text-neutral-300">
                            {feedback.strongPoints.map((p, j) => (
                              <li key={j}>{p}</li>
                            ))}
                          </ul>
                        </div>
                      )}
                      <div>
                        <p className="text-xs font-semibold uppercase tracking-wide text-neutral-500 mb-1">
                          Como melhorar
                        </p>
                        <ul className="space-y-1 list-disc list-inside text-sm text-neutral-700 dark:text-neutral-300">
                          {feedback.improvementTips.map((t, j) => (
                            <li key={j}>{t}</li>
                          ))}
                        </ul>
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
