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
  const [selectedQuestion, setSelectedQuestion] = useState(questions[0] ?? "");
  const [answer, setAnswer] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [feedback, setFeedback] = useState<Feedback | null>(null);

  async function handleSubmit() {
    setError(null);

    if (!answer.trim()) {
      setError("Escreva sua resposta antes de pedir feedback.");
      return;
    }

    setLoading(true);
    setFeedback(null);

    try {
      const res = await fetch("/api/tools/interview-feedback", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ question: selectedQuestion, answer, jobTitle }),
      });
      const data = await res.json();

      if (!res.ok) throw new Error(data.error ?? "Erro ao processar.");

      setFeedback(data as Feedback);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Erro inesperado.");
    } finally {
      setLoading(false);
    }
  }

  if (questions.length === 0) return null;

  return (
    <div className="rounded-2xl border border-neutral-200/80 dark:border-neutral-800 bg-white dark:bg-neutral-950 p-5 shadow-sm shadow-slate-900/5 space-y-4">
      <h3 className="font-semibold">Simulado de entrevista</h3>

      <div>
        <label className="block text-sm font-medium mb-1">Escolha uma pergunta</label>
        <select
          value={selectedQuestion}
          onChange={(e) => {
            setSelectedQuestion(e.target.value);
            setFeedback(null);
          }}
          className="w-full rounded-xl border border-neutral-200 dark:border-white/10 bg-white dark:bg-neutral-900 text-neutral-900 dark:text-neutral-100 px-3.5 py-2.5 text-sm outline-none focus:border-blue-500"
        >
          {questions.map((q, i) => (
            <option key={i} value={q}>
              {q}
            </option>
          ))}
        </select>
      </div>

      <div>
        <label className="block text-sm font-medium mb-1">Sua resposta</label>
        <textarea
          value={answer}
          onChange={(e) => setAnswer(e.target.value)}
          rows={5}
          placeholder="Escreva como você responderia essa pergunta em uma entrevista real"
          className="w-full rounded-xl border border-neutral-200 dark:border-white/10 bg-white dark:bg-white/[0.03] px-3.5 py-2.5 text-sm outline-none focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 transition-colors"
        />
      </div>

      {error && <p className="text-sm text-red-500">{error}</p>}

      <button
        type="button"
        onClick={handleSubmit}
        disabled={loading}
        className="rounded-xl bg-blue-600 text-white font-semibold px-5 py-2.5 text-sm shadow-sm shadow-blue-600/20 hover:bg-blue-700 transition-all disabled:opacity-50"
      >
        {loading ? "Avaliando..." : "Pedir feedback"}
      </button>

      {feedback && (
        <div className="border-t border-neutral-200 dark:border-neutral-800 pt-4 space-y-3">
          <p className="text-sm text-neutral-700 dark:text-neutral-300">
            {feedback.feedback}
          </p>
          {feedback.strongPoints.length > 0 && (
            <div>
              <p className="text-xs font-semibold uppercase tracking-wide text-neutral-500 mb-1">
                Pontos fortes
              </p>
              <ul className="space-y-1 list-disc list-inside text-sm text-neutral-700 dark:text-neutral-300">
                {feedback.strongPoints.map((p, i) => (
                  <li key={i}>{p}</li>
                ))}
              </ul>
            </div>
          )}
          <div>
            <p className="text-xs font-semibold uppercase tracking-wide text-neutral-500 mb-1">
              Como melhorar
            </p>
            <ul className="space-y-1 list-disc list-inside text-sm text-neutral-700 dark:text-neutral-300">
              {feedback.improvementTips.map((t, i) => (
                <li key={i}>{t}</li>
              ))}
            </ul>
          </div>
        </div>
      )}
    </div>
  );
}
