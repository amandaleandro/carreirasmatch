"use client";

import { useState, FormEvent } from "react";
import Link from "next/link";
import type { MockExamQuestion } from "@/lib/tools";

function Quiz({ questions, onRestart }: { questions: MockExamQuestion[]; onRestart: () => void }) {
  const [answers, setAnswers] = useState<Record<number, number>>({});
  const [submitted, setSubmitted] = useState(false);

  const score = questions.reduce(
    (acc, q, i) => (answers[i] === q.correctIndex ? acc + 1 : acc),
    0
  );

  return (
    <div className="space-y-5">
      {questions.map((q, qi) => (
        <div key={qi} className="rounded-xl border border-neutral-200 dark:border-neutral-800 p-4">
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
                      ? "border-indigo-600 bg-indigo-50 dark:bg-indigo-950/40"
                      : "border-neutral-300 dark:border-neutral-700"
                  }`}
                >
                  <input
                    type="radio"
                    name={`q${qi}`}
                    checked={checked}
                    disabled={submitted}
                    onChange={() => setAnswers((prev) => ({ ...prev, [qi]: oi }))}
                    className="h-3.5 w-3.5 accent-indigo-600"
                  />
                  {opt}
                </label>
              );
            })}
          </div>
          {submitted && <p className="text-xs text-neutral-500 mt-1.5">{q.explanation}</p>}
        </div>
      ))}

      {!submitted ? (
        <button
          type="button"
          onClick={() => setSubmitted(true)}
          disabled={Object.keys(answers).length < questions.length}
          className="rounded-md bg-neutral-900 dark:bg-white text-white dark:text-neutral-900 font-medium px-4 py-2 text-sm disabled:opacity-50"
        >
          Corrigir simulado
        </button>
      ) : (
        <div className="space-y-3">
          <p className="text-sm font-semibold">
            Você acertou {score} de {questions.length} questões.
          </p>
          <button
            type="button"
            onClick={onRestart}
            className="text-sm text-indigo-600 dark:text-indigo-400 hover:underline"
          >
            Gerar outro simulado
          </button>
        </div>
      )}
    </div>
  );
}

export function ConcursoMockExamForm() {
  const [cargo, setCargo] = useState("");
  const [banca, setBanca] = useState("");
  const [disciplina, setDisciplina] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [questions, setQuestions] = useState<MockExamQuestion[] | null>(null);

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setError(null);

    if (!disciplina.trim()) {
      setError("Escolha a disciplina do simulado.");
      return;
    }

    setLoading(true);
    setQuestions(null);

    try {
      const res = await fetch("/api/tools/concurso/simulado", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ cargo, banca, disciplina }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "Erro ao processar.");
      setQuestions(data.questions as MockExamQuestion[]);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Erro inesperado.");
    } finally {
      setLoading(false);
    }
  }

  const inputClass =
    "w-full rounded-xl border border-neutral-200 dark:border-white/10 bg-white dark:bg-white/[0.03] px-3.5 py-2.5 text-sm outline-none focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/10 transition-colors";

  return (
    <main className="max-w-3xl mx-auto px-4 py-12 w-full">
      <Link href="/tools/concurso" className="text-sm text-indigo-600 dark:text-indigo-400 hover:underline">
        ← Voltar para concurso
      </Link>
      <header className="mt-4 mb-10">
        <span className="inline-flex items-center gap-1.5 text-[11px] font-semibold uppercase tracking-wider rounded-full px-3 py-1 mb-3 bg-indigo-50 text-indigo-600 border border-indigo-200 dark:bg-indigo-950/40 dark:text-indigo-300 dark:border-indigo-900">
          Simulado por banca
        </span>
        <h1 className="text-2xl md:text-3xl font-bold tracking-tight">Simulado por banca e disciplina</h1>
        <p className="text-neutral-600 dark:text-neutral-400 mt-2">
          Escolha a banca e a disciplina e gere um simulado original no formato do exame, com gabarito
          comentado. Para a 1ª fase da OAB, selecione a banca FGV.
        </p>
      </header>

      {questions && (
        <div className="mb-10">
          <Quiz questions={questions} onRestart={() => setQuestions(null)} />
        </div>
      )}

      {!questions && (
        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label className="block text-sm font-medium mb-1">Cargo ou exame (opcional)</label>
            <input
              type="text"
              value={cargo}
              onChange={(e) => setCargo(e.target.value)}
              placeholder="Ex: Técnico do INSS, OAB 1ª fase"
              className={inputClass}
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">Banca</label>
            <input
              type="text"
              value={banca}
              onChange={(e) => setBanca(e.target.value)}
              placeholder="Ex: CESPE/Cebraspe, FGV, FCC, Vunesp"
              className={inputClass}
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">Disciplina</label>
            <input
              type="text"
              value={disciplina}
              onChange={(e) => setDisciplina(e.target.value)}
              placeholder="Ex: Direito Constitucional, Português, Ética (OAB)"
              className={inputClass}
            />
          </div>

          {error && <p className="text-sm text-red-600 dark:text-red-400">{error}</p>}

          <button
            type="submit"
            disabled={loading}
            className="w-full rounded-xl bg-indigo-600 text-white font-semibold px-5 py-2.5 shadow-sm shadow-indigo-600/20 hover:bg-indigo-700 transition-all disabled:opacity-50"
          >
            {loading ? "Gerando simulado..." : "Gerar simulado"}
          </button>
        </form>
      )}
    </main>
  );
}
