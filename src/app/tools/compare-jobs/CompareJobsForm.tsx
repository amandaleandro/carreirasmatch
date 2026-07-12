"use client";

import { useState, FormEvent } from "react";
import Link from "next/link";

type JobType = "estagio" | "trainee" | "junior" | "pleno" | "outro";

type Job = { jobTitle: string; jobText: string; jobType?: JobType };

const JOB_TYPE_OPTIONS: { value: JobType; label: string }[] = [
  { value: "estagio", label: "Estágio" },
  { value: "trainee", label: "Trainee" },
  { value: "junior", label: "Júnior" },
  { value: "pleno", label: "Pleno" },
  { value: "outro", label: "Outro" },
];

type Result = {
  ranking: { jobTitle: string; fitScore: number; reason: string }[];
  recommendation: string;
};

export function CompareJobsForm() {
  const [file, setFile] = useState<File | null>(null);
  const [jobs, setJobs] = useState<Job[]>([
    { jobTitle: "", jobText: "" },
    { jobTitle: "", jobText: "" },
  ]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<Result | null>(null);

  function updateJob(index: number, field: keyof Job, value: string) {
    setJobs((prev) =>
      prev.map((j, i) => (i === index ? { ...j, [field]: value } : j))
    );
  }

  function addJob() {
    if (jobs.length < 4) setJobs((prev) => [...prev, { jobTitle: "", jobText: "" }]);
  }

  function updateJobType(index: number, value: string) {
    setJobs((prev) =>
      prev.map((j, i) =>
        i === index ? { ...j, jobType: value ? (value as JobType) : undefined } : j
      )
    );
  }

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setError(null);

    const validJobs = jobs.filter((j) => j.jobTitle.trim() && j.jobText.trim());

    if (!file || validJobs.length < 2) {
      setError("Envie o currículo e preencha pelo menos 2 vagas.");
      return;
    }

    setLoading(true);
    setResult(null);

    try {
      const formData = new FormData();
      formData.append("resume", file);
      formData.append("jobs", JSON.stringify(validJobs));

      const res = await fetch("/api/tools/compare-jobs", {
        method: "POST",
        body: formData,
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

  return (
    <main className="max-w-3xl mx-auto px-4 py-12 w-full">
      <Link href="/tools" className="text-sm text-blue-600 dark:text-blue-400 hover:underline">
        ← Voltar para ferramentas
      </Link>
      <header className="mt-4 mb-10">
        <span className="inline-flex items-center gap-1.5 text-[11px] font-semibold uppercase tracking-wider rounded-full px-3 py-1 mb-3 bg-blue-50 text-blue-600 border border-blue-200 dark:bg-blue-950/40 dark:text-blue-300 dark:border-blue-900">
          Comparador
        </span>
        <h1 className="text-2xl md:text-3xl font-bold tracking-tight">Comparador de vagas</h1>
        <p className="text-neutral-600 dark:text-neutral-400 mt-2">
          Cole 2 a 4 vagas e descubra qual delas faz mais sentido pra você aplicar
          agora.
        </p>
      </header>

      <form onSubmit={handleSubmit} className="space-y-5">
        <div>
          <label className="block text-sm font-medium mb-1">Currículo (PDF)</label>
          <input
            type="file"
            accept="application/pdf"
            onChange={(e) => setFile(e.target.files?.[0] ?? null)}
            className="block w-full text-sm file:mr-4 file:rounded-xl file:border-0 file:bg-neutral-900 file:text-white file:px-4 file:py-2 dark:file:bg-white dark:file:text-neutral-900"
          />
        </div>

        {jobs.map((job, i) => (
          <div key={i} className="rounded-2xl border border-neutral-200/80 dark:border-neutral-800 bg-white dark:bg-neutral-950 p-6 shadow-sm shadow-slate-900/5 space-y-3">
            <p className="text-sm font-semibold">Vaga {i + 1}</p>
            <input
              type="text"
              value={job.jobTitle}
              onChange={(e) => updateJob(i, "jobTitle", e.target.value)}
              placeholder="Cargo"
              className="w-full rounded-xl border border-neutral-200 dark:border-white/10 bg-white dark:bg-white/[0.03] px-3.5 py-2.5 text-sm outline-none focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 transition-colors"
            />
            <select
              value={job.jobType ?? ""}
              onChange={(e) => updateJobType(i, e.target.value)}
              className="w-full rounded-xl border border-neutral-200 dark:border-white/10 bg-white dark:bg-white/[0.03] px-3.5 py-2.5 text-sm outline-none focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 transition-colors"
            >
              <option value="">Tipo de vaga (opcional)</option>
              {JOB_TYPE_OPTIONS.map((opt) => (
                <option key={opt.value} value={opt.value}>
                  {opt.label}
                </option>
              ))}
            </select>
            <textarea
              value={job.jobText}
              onChange={(e) => updateJob(i, "jobText", e.target.value)}
              rows={4}
              placeholder="Cole a descrição da vaga"
              className="w-full rounded-xl border border-neutral-200 dark:border-white/10 bg-white dark:bg-white/[0.03] px-3.5 py-2.5 text-sm outline-none focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 transition-colors"
            />
          </div>
        ))}

        {jobs.length < 4 && (
          <button
            type="button"
            onClick={addJob}
            className="text-sm text-blue-600 dark:text-blue-400 hover:underline"
          >
            + Adicionar outra vaga
          </button>
        )}

        {error && <p className="text-sm text-red-600 dark:text-red-400">{error}</p>}

        <button
          type="submit"
          disabled={loading}
          className="w-full rounded-xl bg-blue-600 text-white font-semibold px-5 py-2.5 shadow-sm shadow-blue-600/20 hover:bg-blue-700 transition-all disabled:opacity-50"
        >
          {loading ? "Comparando..." : "Comparar vagas"}
        </button>
      </form>

      {result && (
        <div className="mt-10 space-y-6">
          <div className="rounded-2xl border border-neutral-200/80 dark:border-neutral-800 bg-white dark:bg-neutral-950 p-6 shadow-sm shadow-slate-900/5 space-y-4">
            <h2 className="font-semibold text-lg">Ranking</h2>
            {result.ranking.map((r, i) => (
              <div key={i}>
                <div className="flex justify-between text-sm mb-1">
                  <span className="font-medium">
                    {i + 1}. {r.jobTitle}
                  </span>
                  <span className="font-semibold">{r.fitScore}%</span>
                </div>
                <p className="text-sm text-neutral-600 dark:text-neutral-400">
                  {r.reason}
                </p>
              </div>
            ))}
          </div>
          <div className="rounded-2xl border border-neutral-200/80 dark:border-neutral-800 bg-white dark:bg-neutral-950 p-6 shadow-sm shadow-slate-900/5">
            <h3 className="font-semibold mb-3">Recomendação</h3>
            <p className="text-sm text-neutral-700 dark:text-neutral-300">
              {result.recommendation}
            </p>
          </div>
        </div>
      )}
    </main>
  );
}
