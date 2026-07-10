"use client";

import { useState, FormEvent } from "react";
import Link from "next/link";
import type { VocationAreaConfig } from "@/lib/vocation-areas";
import type { CutoffEstimateResult } from "@/lib/tools";

const INSTITUTION_TYPE_OPTIONS = [
  "Federal muito concorrida (ex: USP, UNICAMP, UFRJ, UFMG)",
  "Federal/estadual de concorrência média",
  "Federal/estadual menos concorrida ou campus do interior",
  "Instituição privada com bolsa (ProUni/FIES)",
];

function ResultView({ result }: { result: CutoffEstimateResult }) {
  return (
    <div className="space-y-4">
      <div className="rounded-xl border border-neutral-200 dark:border-neutral-800 p-5">
        <h3 className="font-semibold mb-2">{result.estimateLabel}</h3>
        <p className="text-sm text-neutral-700 dark:text-neutral-300">{result.reasoning}</p>
      </div>
      <div className="rounded-xl border border-neutral-200 dark:border-neutral-800 p-5">
        <h3 className="font-semibold mb-2">Faixa de corte típica</h3>
        <p className="text-sm text-neutral-700 dark:text-neutral-300">{result.typicalCutoffRange}</p>
      </div>
      <div className="rounded-xl border border-neutral-200 dark:border-neutral-800 p-5">
        <h3 className="font-semibold mb-2">Sua distância dessa faixa</h3>
        <p className="text-sm text-neutral-700 dark:text-neutral-300">{result.gapAnalysis}</p>
      </div>
      <div className="rounded-xl border border-neutral-200 dark:border-neutral-800 p-5">
        <h3 className="font-semibold mb-3">O que fazer a partir daqui</h3>
        <ul className="space-y-1 list-disc list-inside text-sm text-neutral-700 dark:text-neutral-300">
          {result.improvementTips.map((t, i) => (
            <li key={i}>{t}</li>
          ))}
        </ul>
      </div>
      <p className="text-xs text-neutral-500 italic">
        Estimativa aproximada — notas de corte reais variam por instituição, campus, turno e ano.
      </p>
    </div>
  );
}

export function CutoffEstimateForm({ area }: { area: VocationAreaConfig }) {
  const [userScore, setUserScore] = useState("");
  const [targetInstitutionType, setTargetInstitutionType] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<CutoffEstimateResult | null>(null);
  const [showForm, setShowForm] = useState(true);

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setError(null);

    const score = Number(userScore);
    if (!Number.isFinite(score) || score <= 0 || score > 1000 || !targetInstitutionType) {
      setError("Informe uma nota válida (0-1000) e o tipo de instituição.");
      return;
    }

    setLoading(true);
    setResult(null);

    try {
      const res = await fetch(`/api/tools/cutoff-estimate/${area.slug}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userScore: score, targetInstitutionType }),
      });
      const data = await res.json();

      if (!res.ok) throw new Error(data.error ?? "Erro ao processar.");

      setResult(data as CutoffEstimateResult);
      setShowForm(false);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Erro inesperado.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="max-w-2xl mx-auto px-4 py-12 w-full">
      <Link
        href={`/tools/vocation-test/${area.slug}`}
        className="text-sm text-blue-600 dark:text-blue-400 hover:underline"
      >
        ← Voltar para {area.label}
      </Link>
      <header className="mt-4 mb-10">
        <h1 className="text-2xl md:text-3xl font-bold tracking-tight">
          Chance no SISU — {area.label}
        </h1>
        <p className="text-neutral-600 dark:text-neutral-400 mt-2">
          Informe sua nota (real ou estimada) e veja uma comparação aproximada com a
          concorrência típica de {area.label}.
        </p>
      </header>

      {result && !showForm && (
        <div className="mb-10 space-y-4">
          <ResultView result={result} />
          <button
            type="button"
            onClick={() => setShowForm(true)}
            className="text-sm text-blue-600 dark:text-blue-400 hover:underline"
          >
            Refazer cálculo
          </button>
        </div>
      )}

      {showForm && (
        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label className="block text-sm font-medium mb-1">
              Sua nota (média ponderada estimada, 0-1000)
            </label>
            <input
              type="number"
              min={0}
              max={1000}
              value={userScore}
              onChange={(e) => setUserScore(e.target.value)}
              placeholder="Ex: 720"
              className="w-full rounded-md border border-neutral-300 dark:border-neutral-700 bg-transparent px-3 py-2 text-sm"
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-2">Tipo de instituição-alvo</label>
            <div className="grid gap-2">
              {INSTITUTION_TYPE_OPTIONS.map((option) => {
                const checked = targetInstitutionType === option;
                return (
                  <label
                    key={option}
                    className={`flex items-center gap-2 rounded-md border px-3 py-2 text-sm cursor-pointer transition-colors ${
                      checked
                        ? "border-blue-600 bg-blue-50 dark:bg-blue-950/40 dark:border-blue-500"
                        : "border-neutral-300 dark:border-neutral-700"
                    }`}
                  >
                    <input
                      type="radio"
                      name="targetInstitutionType"
                      checked={checked}
                      onChange={() => setTargetInstitutionType(option)}
                      className="h-4 w-4 accent-blue-600"
                    />
                    {option}
                  </label>
                );
              })}
            </div>
          </div>

          {error && <p className="text-sm text-red-500">{error}</p>}

          <button
            type="submit"
            disabled={loading}
            className="w-full rounded-md bg-neutral-900 dark:bg-white text-white dark:text-neutral-900 font-medium py-2.5 disabled:opacity-50"
          >
            {loading ? "Calculando..." : "Calcular minha chance"}
          </button>
        </form>
      )}
    </main>
  );
}
