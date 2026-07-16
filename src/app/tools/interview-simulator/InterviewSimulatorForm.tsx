"use client";

import { useState, FormEvent } from "react";
import Link from "next/link";

const TOTAL_QUESTIONS = 5;

type Feedback = {
  score: number;
  strengths: string[];
  gaps: string[];
  improvedAnswer: string;
};

type Turn = { question: string; answer: string; feedback: Feedback };

type AnswerResponse = Feedback & { nextQuestion: string | null };

const INPUT_CLASS =
  "w-full rounded-xl border border-neutral-200 dark:border-white/10 bg-white dark:bg-white/[0.03] px-3.5 py-2.5 text-sm outline-none focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 transition-colors";

function scoreClass(score: number) {
  if (score >= 8) return "bg-emerald-100 text-emerald-800 dark:bg-emerald-900/50 dark:text-emerald-300";
  if (score >= 5) return "bg-amber-100 text-amber-800 dark:bg-amber-900/50 dark:text-amber-300";
  return "bg-red-100 text-red-800 dark:bg-red-900/50 dark:text-red-300";
}

export function InterviewSimulatorForm() {
  const [targetRole, setTargetRole] = useState("");
  const [area, setArea] = useState("");
  const [seniority, setSeniority] = useState("Júnior");

  const [started, setStarted] = useState(false);
  const [currentQuestion, setCurrentQuestion] = useState<string | null>(null);
  const [answer, setAnswer] = useState("");
  const [turns, setTurns] = useState<Turn[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const finished = started && currentQuestion === null;

  async function callApi(history: { question: string; answer: string }[]) {
    const res = await fetch("/api/tools/interview-simulator", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ targetRole, area, seniority, history }),
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error ?? "Erro ao processar.");
    return data;
  }

  async function handleStart(e: FormEvent) {
    e.preventDefault();
    setError(null);

    if (!targetRole.trim()) {
      setError("Informe o cargo-alvo da entrevista.");
      return;
    }

    setLoading(true);
    try {
      const data = (await callApi([])) as { question: string };
      setCurrentQuestion(data.question);
      setStarted(true);
      setTurns([]);
      setAnswer("");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Erro inesperado.");
    } finally {
      setLoading(false);
    }
  }

  async function handleAnswer(e: FormEvent) {
    e.preventDefault();
    setError(null);

    if (!answer.trim() || !currentQuestion) {
      setError("Escreva sua resposta antes de enviar.");
      return;
    }

    setLoading(true);
    try {
      const history = [
        ...turns.map((turn) => ({ question: turn.question, answer: turn.answer })),
        { question: currentQuestion, answer },
      ];
      const data = (await callApi(history)) as AnswerResponse;

      setTurns([
        ...turns,
        {
          question: currentQuestion,
          answer,
          feedback: {
            score: data.score,
            strengths: data.strengths,
            gaps: data.gaps,
            improvedAnswer: data.improvedAnswer,
          },
        },
      ]);
      setCurrentQuestion(data.nextQuestion);
      setAnswer("");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Erro inesperado.");
    } finally {
      setLoading(false);
    }
  }

  function handleRestart() {
    setStarted(false);
    setCurrentQuestion(null);
    setTurns([]);
    setAnswer("");
    setError(null);
  }

  const averageScore =
    turns.length > 0
      ? Math.round((turns.reduce((sum, turn) => sum + turn.feedback.score, 0) / turns.length) * 10) / 10
      : 0;

  return (
    <main className="max-w-3xl mx-auto px-4 py-12 w-full">
      <Link href="/tools" className="text-sm text-blue-600 dark:text-blue-400 hover:underline">
        ← Voltar para ferramentas
      </Link>
      <header className="mt-4 mb-10">
        <span className="inline-flex items-center gap-1.5 text-[11px] font-semibold uppercase tracking-wider rounded-full px-3 py-1 mb-3 bg-blue-50 text-blue-600 border border-blue-200 dark:bg-blue-950/40 dark:text-blue-300 dark:border-blue-900">
          Preparação para entrevista
        </span>
        <h1 className="text-2xl md:text-3xl font-bold tracking-tight">Simulador de entrevista</h1>
        <p className="text-neutral-600 dark:text-neutral-400 mt-2">
          {TOTAL_QUESTIONS} perguntas reais do seu cargo, com nota e feedback a
          cada resposta. Funciona para qualquer área - saúde, vendas, logística,
          educação, tecnologia.
        </p>
      </header>

      {!started && (
        <form onSubmit={handleStart} className="space-y-5">
          <div>
            <label className="block text-sm font-medium mb-1">Cargo-alvo</label>
            <input
              type="text"
              value={targetRole}
              onChange={(e) => setTargetRole(e.target.value)}
              placeholder="Ex: Enfermeiro plantonista"
              className={INPUT_CLASS}
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium mb-1">Área (opcional)</label>
              <input
                type="text"
                value={area}
                onChange={(e) => setArea(e.target.value)}
                placeholder="Ex: Saúde"
                className={INPUT_CLASS}
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Nível</label>
              <select
                value={seniority}
                onChange={(e) => setSeniority(e.target.value)}
                className={INPUT_CLASS}
              >
                <option>Estágio</option>
                <option>Júnior</option>
                <option>Pleno</option>
                <option>Sênior</option>
              </select>
            </div>
          </div>

          {error && <p className="text-sm text-red-600 dark:text-red-400">{error}</p>}

          <button
            type="submit"
            disabled={loading}
            className="w-full rounded-xl bg-blue-600 text-white font-semibold px-5 py-2.5 shadow-sm shadow-blue-600/20 hover:bg-blue-700 transition-all disabled:opacity-50"
          >
            {loading ? "Preparando..." : "Iniciar simulação"}
          </button>
        </form>
      )}

      {started && (
        <div className="space-y-6">
          <div className="flex items-center justify-between gap-4">
            <p className="text-sm text-neutral-500">
              {finished
                ? `Entrevista concluída - ${turns.length} de ${TOTAL_QUESTIONS} perguntas`
                : `Pergunta ${turns.length + 1} de ${TOTAL_QUESTIONS}`}
            </p>
            <button
              type="button"
              onClick={handleRestart}
              className="text-sm text-blue-600 dark:text-blue-400 hover:underline"
            >
              Recomeçar
            </button>
          </div>

          {turns.map((turn, index) => (
            <div
              key={index}
              className="rounded-2xl border border-neutral-200/80 dark:border-neutral-800 bg-white dark:bg-neutral-950 p-6 shadow-sm shadow-slate-900/5 space-y-4"
            >
              <div className="flex items-start justify-between gap-3">
                <p className="text-sm font-semibold">{turn.question}</p>
                <span
                  className={`shrink-0 text-xs font-bold rounded-full px-2.5 py-1 ${scoreClass(turn.feedback.score)}`}
                >
                  {turn.feedback.score}/10
                </span>
              </div>

              <p className="text-sm text-neutral-600 dark:text-neutral-400 whitespace-pre-wrap border-l-2 border-neutral-200 dark:border-neutral-800 pl-3">
                {turn.answer}
              </p>

              {turn.feedback.strengths.length > 0 && (
                <div>
                  <h4 className="text-xs font-semibold uppercase tracking-wide text-emerald-700 dark:text-emerald-400 mb-1.5">
                    Acertos
                  </h4>
                  <ul className="space-y-1 list-disc list-inside text-sm text-neutral-700 dark:text-neutral-300">
                    {turn.feedback.strengths.map((item, i) => (
                      <li key={i}>{item}</li>
                    ))}
                  </ul>
                </div>
              )}

              {turn.feedback.gaps.length > 0 && (
                <div>
                  <h4 className="text-xs font-semibold uppercase tracking-wide text-amber-700 dark:text-amber-400 mb-1.5">
                    O que faltou
                  </h4>
                  <ul className="space-y-1 list-disc list-inside text-sm text-neutral-700 dark:text-neutral-300">
                    {turn.feedback.gaps.map((item, i) => (
                      <li key={i}>{item}</li>
                    ))}
                  </ul>
                </div>
              )}

              <div>
                <h4 className="text-xs font-semibold uppercase tracking-wide text-blue-700 dark:text-blue-400 mb-1.5">
                  Como ficaria mais forte
                </h4>
                <p className="text-sm text-neutral-700 dark:text-neutral-300 whitespace-pre-wrap">
                  {turn.feedback.improvedAnswer}
                </p>
              </div>
            </div>
          ))}

          {currentQuestion && (
            <form
              onSubmit={handleAnswer}
              className="rounded-2xl border border-blue-200 dark:border-blue-900 bg-blue-50/50 dark:bg-blue-950/20 p-6 space-y-4"
            >
              <p className="text-sm font-semibold">{currentQuestion}</p>
              <textarea
                value={answer}
                onChange={(e) => setAnswer(e.target.value)}
                rows={6}
                placeholder="Responda como responderia na entrevista de verdade..."
                className={INPUT_CLASS}
              />
              {error && <p className="text-sm text-red-600 dark:text-red-400">{error}</p>}
              <button
                type="submit"
                disabled={loading}
                className="w-full rounded-xl bg-blue-600 text-white font-semibold px-5 py-2.5 shadow-sm shadow-blue-600/20 hover:bg-blue-700 transition-all disabled:opacity-50"
              >
                {loading ? "Avaliando..." : "Enviar resposta"}
              </button>
            </form>
          )}

          {finished && (
            <div className="rounded-2xl border border-neutral-200/80 dark:border-neutral-800 bg-white dark:bg-neutral-950 p-6 shadow-sm shadow-slate-900/5 text-center">
              <p className="text-sm text-neutral-500">Média da entrevista</p>
              <p className="text-4xl font-bold text-blue-600 mt-1">{averageScore}/10</p>
              <p className="text-sm text-neutral-600 dark:text-neutral-400 mt-3">
                Revise os pontos que faltaram acima e refaça a simulação - as
                perguntas mudam a cada rodada.
              </p>
              <button
                type="button"
                onClick={handleRestart}
                className="mt-4 rounded-xl bg-blue-600 text-white font-semibold px-5 py-2.5 hover:bg-blue-700 transition-colors"
              >
                Nova simulação
              </button>
            </div>
          )}
        </div>
      )}
    </main>
  );
}
