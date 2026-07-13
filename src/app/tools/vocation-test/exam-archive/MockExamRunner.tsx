"use client";

import { useState } from "react";
import type { MockExamQuestion } from "@/lib/tools";

export function MockExamLauncher({
  path,
  label,
}: {
  path: string;
  label: string;
}) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [questions, setQuestions] = useState<MockExamQuestion[] | null>(null);

  async function generate() {
    setLoading(true);
    setError(null);
    setQuestions(null);
    try {
      const res = await fetch("/api/tools/mock-exam", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ path }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "Erro ao gerar simulado.");
      setQuestions(data.questions as MockExamQuestion[]);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Erro inesperado.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="inline-flex flex-col">
      <button
        type="button"
        onClick={generate}
        disabled={loading}
        className="text-xs rounded-full px-3 py-1 bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-300 hover:underline disabled:opacity-50"
      >
        {loading ? "Gerando..." : `Simulado (${label})`}
      </button>
      {error && <p className="text-xs text-red-500 mt-1">{error}</p>}
      {questions && <MockExamQuiz questions={questions} label={label} />}
    </div>
  );
}

function MockExamQuiz({ questions, label }: { questions: MockExamQuestion[]; label: string }) {
  const [answers, setAnswers] = useState<Record<number, number>>({});
  const [submitted, setSubmitted] = useState(false);

  const score = questions.reduce(
    (acc, q, i) => (answers[i] === q.correctIndex ? acc + 1 : acc),
    0
  );

  return (
    <div className="mt-4 w-full max-w-2xl rounded-xl border border-neutral-200 dark:border-neutral-800 p-5 space-y-5">
      <h4 className="font-semibold text-sm">Simulado, {label}</h4>
      {questions.map((q, qi) => (
        <div key={qi}>
          <p className="text-sm font-medium mb-2">
            {qi + 1}. {q.question}
          </p>
          <div className="space-y-1">
            {q.options.map((opt, oi) => {
              const checked = answers[qi] === oi;
              const isCorrect = submitted && oi === q.correctIndex;
              const isWrongChoice = submitted && checked && oi !== q.correctIndex;
              return (
                <label
                  key={oi}
                  className={`flex items-center gap-2 rounded-md border px-3 py-1.5 text-sm cursor-pointer ${
                    isCorrect
                      ? "border-emerald-500 bg-emerald-50 dark:bg-emerald-950/40"
                      : isWrongChoice
                      ? "border-red-500 bg-red-50 dark:bg-red-950/40"
                      : checked
                      ? "border-blue-600 bg-blue-50 dark:bg-blue-950/40"
                      : "border-neutral-300 dark:border-neutral-700"
                  }`}
                >
                  <input
                    type="radio"
                    name={`q${qi}`}
                    checked={checked}
                    disabled={submitted}
                    onChange={() => setAnswers((prev) => ({ ...prev, [qi]: oi }))}
                    className="h-3.5 w-3.5 accent-blue-600"
                  />
                  {opt}
                </label>
              );
            })}
          </div>
          {submitted && (
            <p className="text-xs text-neutral-500 mt-1.5">{q.explanation}</p>
          )}
        </div>
      ))}

      {!submitted ? (
        <button
          type="button"
          onClick={() => setSubmitted(true)}
          disabled={Object.keys(answers).length < questions.length}
          className="text-sm rounded-md bg-neutral-900 dark:bg-white text-white dark:text-neutral-900 font-medium px-4 py-2 disabled:opacity-50"
        >
          Corrigir simulado
        </button>
      ) : (
        <p className="text-sm font-medium">
          Você acertou {score} de {questions.length} questões.
        </p>
      )}
    </div>
  );
}
