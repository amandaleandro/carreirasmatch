"use client";

import { useState, FormEvent } from "react";
import Link from "next/link";
import type { ConcursoStudyPlanResult } from "@/lib/tools";

function PhaseList({ title, items }: { title: string; items: string[] }) {
  if (!items?.length) return null;
  return (
    <div>
      <p className="text-[11px] font-bold uppercase tracking-wide text-neutral-400 mb-1.5">{title}</p>
      <ul className="space-y-1 list-disc list-inside text-sm text-neutral-700 dark:text-neutral-300">
        {items.map((it, i) => (
          <li key={i}>{it}</li>
        ))}
      </ul>
    </div>
  );
}

function ResultView({ result }: { result: ConcursoStudyPlanResult }) {
  return (
    <div className="space-y-4">
      <div className="rounded-2xl border border-neutral-200/80 dark:border-neutral-800 bg-white dark:bg-neutral-950 p-6 shadow-sm shadow-slate-900/5">
        <h3 className="font-semibold mb-2">Perfil da banca</h3>
        <p className="text-sm text-neutral-700 dark:text-neutral-300">{result.bancaProfile}</p>
      </div>

      <div className="rounded-2xl border border-neutral-200/80 dark:border-neutral-800 bg-white dark:bg-neutral-950 p-6 shadow-sm shadow-slate-900/5 space-y-4">
        <h3 className="font-semibold">Prioridades de estudo</h3>
        <PhaseList title="Essencial agora" items={result.studyPlan.essential} />
        <PhaseList title="Importante depois" items={result.studyPlan.niceToHave} />
        <PhaseList title="Pode ficar para o final" items={result.studyPlan.later} />
      </div>

      <div className="rounded-2xl border border-neutral-200/80 dark:border-neutral-800 bg-white dark:bg-neutral-950 p-6 shadow-sm shadow-slate-900/5">
        <h3 className="font-semibold mb-3">Cronograma semanal</h3>
        <div className="space-y-3">
          {result.weeklySchedule.map((w) => (
            <div key={w.week} className="rounded-xl border border-neutral-200 dark:border-neutral-800 p-3">
              <p className="text-sm font-semibold mb-1">
                Semana {w.week}: {w.focus}
              </p>
              <ul className="space-y-1 list-disc list-inside text-sm text-neutral-600 dark:text-neutral-400">
                {w.tasks.map((t, i) => (
                  <li key={i}>{t}</li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </div>

      <div className="rounded-2xl border border-neutral-200/80 dark:border-neutral-800 bg-white dark:bg-neutral-950 p-6 shadow-sm shadow-slate-900/5">
        <h3 className="font-semibold mb-2">Dicas de revisão e questões</h3>
        <ul className="space-y-1 list-disc list-inside text-sm text-neutral-700 dark:text-neutral-300">
          {result.reviewTips.map((t, i) => (
            <li key={i}>{t}</li>
          ))}
        </ul>
      </div>

      <div className="rounded-xl border border-amber-200 dark:border-amber-900/50 bg-amber-50/70 dark:bg-amber-950/20 p-4 text-sm text-amber-900 dark:text-amber-200">
        <p className="font-semibold mb-1">Sobre a nota de corte</p>
        <p>{result.cutoffNote}</p>
      </div>

      <p className="text-sm text-neutral-600 dark:text-neutral-400 italic">{result.motivationalNote}</p>
    </div>
  );
}

export function ConcursoStudyPlanForm() {
  const [cargo, setCargo] = useState("");
  const [banca, setBanca] = useState("");
  const [disciplinas, setDisciplinas] = useState("");
  const [weeklyStudyHours, setWeeklyStudyHours] = useState("");
  const [timeUntilExam, setTimeUntilExam] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<ConcursoStudyPlanResult | null>(null);
  const [showForm, setShowForm] = useState(true);

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setError(null);

    if (!cargo.trim()) {
      setError("Informe o cargo ou exame que você vai prestar.");
      return;
    }
    if (!disciplinas.trim()) {
      setError("Liste as disciplinas do edital.");
      return;
    }

    setLoading(true);
    setResult(null);

    try {
      const res = await fetch("/api/tools/concurso/plano-de-estudo", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ cargo, banca, disciplinas, weeklyStudyHours, timeUntilExam }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "Erro ao processar.");
      setResult(data as ConcursoStudyPlanResult);
      setShowForm(false);
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
          Plano de estudo por edital
        </span>
        <h1 className="text-2xl md:text-3xl font-bold tracking-tight">Plano de estudo por edital</h1>
        <p className="text-neutral-600 dark:text-neutral-400 mt-2">
          Informe o cargo, a banca e as disciplinas do edital e receba um ciclo de estudos por peso das
          matérias, com cronograma semanal até a prova.
        </p>
      </header>

      {result && !showForm && (
        <div className="mb-10 space-y-4">
          <ResultView result={result} />
          <button
            type="button"
            onClick={() => setShowForm(true)}
            className="text-sm text-indigo-600 dark:text-indigo-400 hover:underline"
          >
            Gerar outro plano
          </button>
        </div>
      )}

      {showForm && (
        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label className="block text-sm font-medium mb-1">Cargo ou exame</label>
            <input
              type="text"
              value={cargo}
              onChange={(e) => setCargo(e.target.value)}
              placeholder="Ex: Analista Judiciário do TRT, Técnico do INSS, OAB"
              className={inputClass}
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">Banca (opcional)</label>
            <input
              type="text"
              value={banca}
              onChange={(e) => setBanca(e.target.value)}
              placeholder="Ex: CESPE/Cebraspe, FGV, FCC, Vunesp"
              className={inputClass}
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">Disciplinas do edital (com pesos, se souber)</label>
            <textarea
              value={disciplinas}
              onChange={(e) => setDisciplinas(e.target.value)}
              rows={5}
              placeholder="Ex: Português (peso 2), Direito Constitucional (peso 3), Direito Administrativo (peso 3), Raciocínio Lógico (peso 1)..."
              className={inputClass}
            />
          </div>

          <div className="grid sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium mb-1">Horas de estudo por semana</label>
              <input
                type="text"
                value={weeklyStudyHours}
                onChange={(e) => setWeeklyStudyHours(e.target.value)}
                placeholder="Ex: 20 horas"
                className={inputClass}
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Tempo até a prova</label>
              <input
                type="text"
                value={timeUntilExam}
                onChange={(e) => setTimeUntilExam(e.target.value)}
                placeholder="Ex: 4 meses"
                className={inputClass}
              />
            </div>
          </div>

          {error && <p className="text-sm text-red-600 dark:text-red-400">{error}</p>}

          <button
            type="submit"
            disabled={loading}
            className="w-full rounded-xl bg-indigo-600 text-white font-semibold px-5 py-2.5 shadow-sm shadow-indigo-600/20 hover:bg-indigo-700 transition-all disabled:opacity-50"
          >
            {loading ? "Montando plano..." : "Montar meu plano de estudo"}
          </button>
        </form>
      )}
    </main>
  );
}
