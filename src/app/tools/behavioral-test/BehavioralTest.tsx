"use client";

import { useState, FormEvent } from "react";
import Link from "next/link";
import {
  BEHAVIORAL_QUESTIONS,
  SOFT_SKILL_LABELS,
  PERSONALITY_TRAIT_LABELS,
  PERSONALITY_TRAIT_DESCRIPTIONS,
  type SoftSkillDimension,
  type PersonalityTrait,
} from "@/lib/behavioral-test";

const LIKERT_OPTIONS = [
  { value: 1, label: "Discordo totalmente" },
  { value: 2, label: "Discordo" },
  { value: 3, label: "Neutro" },
  { value: 4, label: "Concordo" },
  { value: 5, label: "Concordo totalmente" },
];

type Result = {
  skillScores: Record<SoftSkillDimension, number>;
  personalityScores: Record<PersonalityTrait, number>;
  dominantTrait: PersonalityTrait;
  dominantTraitLabel: string;
  profileSummary: string;
  strengths: string[];
  growthAreas: string[];
  interviewTip: string;
};

function ScoreBar({ label, score }: { label: string; score: number }) {
  return (
    <div>
      <div className="flex items-center justify-between text-xs mb-1">
        <span className="font-medium text-neutral-700 dark:text-neutral-300">{label}</span>
        <span className="text-neutral-500">{score}/100</span>
      </div>
      <div className="h-2 rounded-full bg-neutral-100 dark:bg-neutral-800 overflow-hidden">
        <div
          className="h-full rounded-full bg-blue-600"
          style={{ width: `${Math.max(4, score)}%` }}
        />
      </div>
    </div>
  );
}

export function BehavioralTest() {
  const [answers, setAnswers] = useState<Record<string, number>>({});
  const [targetRole, setTargetRole] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<Result | null>(null);

  const answeredCount = Object.keys(answers).length;

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setError(null);

    if (answeredCount < BEHAVIORAL_QUESTIONS.length) {
      setError("Responda todas as afirmações antes de ver o resultado.");
      return;
    }

    setLoading(true);
    setResult(null);

    try {
      const res = await fetch("/api/tools/behavioral-test", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ answers, targetRole }),
      });
      const data = await res.json();

      if (!res.ok) throw new Error(data.error ?? "Erro ao processar.");

      setResult(data as Result);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Erro inesperado.");
    } finally {
      setLoading(false);
    }
  }

  if (result) {
    return (
      <main className="max-w-3xl mx-auto px-4 py-12 w-full">
        <Link href="/tools" className="text-sm text-blue-600 dark:text-blue-400 hover:underline">
          ← Voltar para ferramentas
        </Link>
        <header className="mt-4 mb-8">
          <span className="inline-flex items-center gap-1.5 text-[11px] font-semibold uppercase tracking-wider rounded-full px-3 py-1 mb-3 bg-blue-50 text-blue-600 border border-blue-200 dark:bg-blue-950/40 dark:text-blue-300 dark:border-blue-900">
            Resultado
          </span>
          <h1 className="text-2xl md:text-3xl font-bold tracking-tight">Seu resultado</h1>
          <p className="text-neutral-600 dark:text-neutral-400 mt-2">
            Perfil dominante:{" "}
            <span className="font-semibold text-neutral-900 dark:text-neutral-100">
              {result.dominantTraitLabel}
            </span>
          </p>
        </header>

        <div className="space-y-6">
          <div className="rounded-2xl border border-neutral-200/80 dark:border-neutral-800 bg-white dark:bg-neutral-950 p-6 shadow-sm shadow-slate-900/5">
            <h3 className="font-semibold mb-3">Resumo do perfil</h3>
            <p className="text-sm text-neutral-700 dark:text-neutral-300">{result.profileSummary}</p>
            <p className="text-sm text-neutral-500 dark:text-neutral-400 mt-3">
              {PERSONALITY_TRAIT_DESCRIPTIONS[result.dominantTrait]}
            </p>
          </div>

          <div className="rounded-2xl border border-neutral-200/80 dark:border-neutral-800 bg-white dark:bg-neutral-950 p-6 shadow-sm shadow-slate-900/5">
            <h3 className="font-semibold mb-4">Soft skills</h3>
            <div className="space-y-3">
              {(Object.entries(result.skillScores) as [SoftSkillDimension, number][]).map(
                ([dim, score]) => (
                  <ScoreBar key={dim} label={SOFT_SKILL_LABELS[dim]} score={score} />
                )
              )}
            </div>
          </div>

          <div className="rounded-2xl border border-neutral-200/80 dark:border-neutral-800 bg-white dark:bg-neutral-950 p-6 shadow-sm shadow-slate-900/5">
            <h3 className="font-semibold mb-4">Traços de personalidade</h3>
            <div className="space-y-3">
              {(Object.entries(result.personalityScores) as [PersonalityTrait, number][]).map(
                ([trait, score]) => (
                  <ScoreBar key={trait} label={PERSONALITY_TRAIT_LABELS[trait]} score={score} />
                )
              )}
            </div>
          </div>

          <div className="rounded-2xl border border-neutral-200/80 dark:border-neutral-800 bg-white dark:bg-neutral-950 p-6 shadow-sm shadow-slate-900/5">
            <h3 className="font-semibold mb-3">Pontos fortes</h3>
            <ul className="space-y-2 list-disc list-inside text-sm text-neutral-700 dark:text-neutral-300">
              {result.strengths.map((s, i) => (
                <li key={i}>{s}</li>
              ))}
            </ul>
          </div>

          <div className="rounded-2xl border border-neutral-200/80 dark:border-neutral-800 bg-white dark:bg-neutral-950 p-6 shadow-sm shadow-slate-900/5">
            <h3 className="font-semibold mb-3">Pontos de desenvolvimento</h3>
            <ul className="space-y-2 list-disc list-inside text-sm text-neutral-700 dark:text-neutral-300">
              {result.growthAreas.map((s, i) => (
                <li key={i}>{s}</li>
              ))}
            </ul>
          </div>

          <div className="rounded-xl bg-emerald-50 dark:bg-emerald-950/30 border border-emerald-100 dark:border-emerald-900/50 px-4 py-3">
            <p className="text-xs font-semibold uppercase tracking-wide text-emerald-700 dark:text-emerald-400">
              Dica para a entrevista
            </p>
            <p className="text-sm text-emerald-800 dark:text-emerald-300 mt-1">
              {result.interviewTip}
            </p>
          </div>
        </div>
      </main>
    );
  }

  return (
    <main className="max-w-3xl mx-auto px-4 py-12 w-full">
      <Link href="/tools" className="text-sm text-blue-600 dark:text-blue-400 hover:underline">
        ← Voltar para ferramentas
      </Link>
      <header className="mt-4 mb-8">
        <span className="inline-flex items-center gap-1.5 text-[11px] font-semibold uppercase tracking-wider rounded-full px-3 py-1 mb-3 bg-blue-50 text-blue-600 border border-blue-200 dark:bg-blue-950/40 dark:text-blue-300 dark:border-blue-900">
          Simulação
        </span>
        <h1 className="text-2xl md:text-3xl font-bold tracking-tight">
          Teste de soft skills e personalidade
        </h1>
        <p className="text-neutral-600 dark:text-neutral-400 mt-2">
          Responda o quanto cada afirmação combina com você. Não existe resposta certa ou
          errada, seja honesto(a).
        </p>
      </header>

      <form onSubmit={handleSubmit} className="space-y-6">
        <div>
          <label className="block text-sm font-medium mb-1">
            Cargo-alvo (opcional, melhora a dica final)
          </label>
          <input
            type="text"
            value={targetRole}
            onChange={(e) => setTargetRole(e.target.value)}
            placeholder="Ex: Assistente de atendimento"
            className="w-full rounded-xl border border-neutral-200 dark:border-white/10 bg-white dark:bg-white/[0.03] px-3.5 py-2.5 text-sm outline-none focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 transition-colors"
          />
        </div>

        <p className="text-xs text-neutral-500">
          {answeredCount}/{BEHAVIORAL_QUESTIONS.length} respondidas
        </p>

        <div className="space-y-5">
          {BEHAVIORAL_QUESTIONS.map((q, i) => (
            <div
              key={q.id}
              className="rounded-2xl border border-neutral-200/80 dark:border-neutral-800 bg-white dark:bg-neutral-950 p-6 shadow-sm shadow-slate-900/5"
            >
              <p className="text-sm font-medium mb-3">
                {i + 1}. {q.text}
              </p>
              <div className="grid grid-cols-5 gap-1.5">
                {LIKERT_OPTIONS.map((opt) => {
                  const checked = answers[q.id] === opt.value;
                  return (
                    <label
                      key={opt.value}
                      title={opt.label}
                      className={`flex flex-col items-center gap-1 rounded-xl border px-1 py-2 text-[10px] text-center cursor-pointer transition-all ${
                        checked
                          ? "border-blue-600 bg-blue-50 dark:bg-blue-950/40 dark:border-blue-500"
                          : "border-neutral-200 dark:border-neutral-800"
                      }`}
                    >
                      <input
                        type="radio"
                        name={q.id}
                        checked={checked}
                        onChange={() => setAnswers((prev) => ({ ...prev, [q.id]: opt.value }))}
                        className="h-3.5 w-3.5 accent-blue-600"
                      />
                      {opt.value}
                    </label>
                  );
                })}
              </div>
            </div>
          ))}
        </div>

        {error && <p className="text-sm text-red-600 dark:text-red-400">{error}</p>}

        <button
          type="submit"
          disabled={loading}
          className="w-full rounded-xl bg-blue-600 text-white font-semibold px-5 py-2.5 shadow-sm shadow-blue-600/20 hover:bg-blue-700 transition-all disabled:opacity-50"
        >
          {loading ? "Calculando resultado..." : "Ver meu resultado"}
        </button>
      </form>
    </main>
  );
}
