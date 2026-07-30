"use client";

import { useState } from "react";
import { GraduationCap, Search, ShieldCheck } from "lucide-react";

type UniversityResult = { id: string; name: string; city: string; state: string };

type Metrics = {
  totalStudents: number;
  withResume: number;
  withAnalysis: number;
  avgMatchScore: number | null;
  withApplications: number;
} | null;

type CourseBreakdown = { title: string; count: number }[];

function StatCard({ label, value, sub }: { label: string; value: string; sub?: string }) {
  return (
    <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-5 shadow-2xs">
      <p className="text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400">{label}</p>
      <p className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white mt-1">{value}</p>
      {sub && <p className="text-xs text-slate-400 mt-1">{sub}</p>}
    </div>
  );
}

function LinkUniversityForm() {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<UniversityResult[]>([]);
  const [linking, setLinking] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function search(q: string) {
    setQuery(q);
    if (q.trim().length < 2) {
      setResults([]);
      return;
    }
    const res = await fetch(`/api/parceiro/university?q=${encodeURIComponent(q)}`);
    const data = await res.json();
    setResults(data.universities ?? []);
  }

  async function link(universityId: string) {
    setLinking(true);
    setError(null);
    try {
      const res = await fetch("/api/parceiro/university", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ universityId }),
      });
      if (!res.ok) throw new Error("Não foi possível vincular. Tente novamente.");
      window.location.reload();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Erro inesperado.");
      setLinking(false);
    }
  }

  return (
    <div className="rounded-3xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-6 sm:p-8 space-y-4 shadow-sm max-w-xl">
      <h2 className="text-lg font-bold text-slate-900 dark:text-white flex items-center gap-2">
        <GraduationCap className="w-5 h-5 text-blue-600" />
        Vincular minha instituição
      </h2>
      <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
        Busque sua instituição no catálogo real de universidades pra ver métricas agregadas e anônimas dos seus
        alunos que já usam o CarreirasMatch — nunca dado individual, sempre números consolidados.
      </p>

      <div className="relative">
        <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
        <input
          type="text"
          value={query}
          onChange={(e) => search(e.target.value)}
          placeholder="Busque sua instituição..."
          className="w-full rounded-xl border border-neutral-200 dark:border-white/10 bg-white dark:bg-white/[0.03] pl-9.5 pr-4 py-2.5 text-sm outline-none focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 transition-colors"
        />
        {results.length > 0 && (
          <div className="absolute z-10 mt-1 w-full rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-lg max-h-64 overflow-y-auto">
            {results.map((u) => (
              <button
                key={u.id}
                type="button"
                disabled={linking}
                onClick={() => link(u.id)}
                className="block w-full text-left px-4 py-2.5 text-xs hover:bg-slate-50 dark:hover:bg-slate-800 border-b border-slate-100 dark:border-slate-800 last:border-0 disabled:opacity-50"
              >
                <span className="font-semibold text-slate-900 dark:text-white">{u.name}</span>
                <span className="block text-slate-500">{u.city}/{u.state}</span>
              </button>
            ))}
          </div>
        )}
      </div>
      {error && <p className="text-xs font-bold text-red-600">{error}</p>}
      <p className="text-[11px] text-slate-400">Não achou sua instituição? Ainda não fizemos a coleta da grade dela no catálogo.</p>
    </div>
  );
}

export function EmployabilityDashboard({
  linked,
  universityName,
  metrics,
  courseBreakdown,
  minThreshold,
}: {
  linked: boolean;
  universityName?: string | null;
  metrics: Metrics;
  courseBreakdown?: CourseBreakdown;
  minThreshold?: number;
}) {
  return (
    <main className="p-6 md:p-8 space-y-8 max-w-6xl mx-auto font-sans">
      <div className="pb-4 border-b border-slate-200 dark:border-slate-800">
        <span className="inline-flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wider rounded-full px-3 py-1 mb-2 bg-blue-500/10 text-blue-600 dark:text-blue-400 border border-blue-500/20">
          <GraduationCap className="w-3.5 h-3.5" />
          Empregabilidade
        </span>
        <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-slate-900 dark:text-white">
          {linked ? universityName ?? "Sua instituição" : "Painel de Empregabilidade"}
        </h1>
        <p className="text-slate-600 dark:text-slate-400 mt-1 text-sm">
          Métricas agregadas e anônimas dos alunos da sua instituição que usam o CarreirasMatch.
        </p>
      </div>

      {!linked ? (
        <LinkUniversityForm />
      ) : !metrics ? (
        <div className="rounded-3xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-8 text-center space-y-2">
          <p className="text-sm font-semibold text-slate-700 dark:text-slate-300">
            Ainda não temos alunos suficientes desta instituição na plataforma
          </p>
          <p className="text-xs text-slate-500 dark:text-slate-400">
            Por privacidade, só mostramos métricas quando pelo menos {minThreshold ?? 5} alunos estão vinculados.
          </p>
        </div>
      ) : (
        <div className="space-y-8">
          <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
            <StatCard label="Alunos na plataforma" value={String(metrics.totalStudents)} />
            <StatCard
              label="Com currículo pronto"
              value={`${Math.round((metrics.withResume / metrics.totalStudents) * 100)}%`}
              sub={`${metrics.withResume} de ${metrics.totalStudents}`}
            />
            <StatCard
              label="Já analisaram currículo x vaga"
              value={`${Math.round((metrics.withAnalysis / metrics.totalStudents) * 100)}%`}
              sub={`${metrics.withAnalysis} de ${metrics.totalStudents}`}
            />
            <StatCard label="Match médio" value={metrics.avgMatchScore != null ? `${metrics.avgMatchScore}%` : "—"} />
          </div>

          {courseBreakdown && courseBreakdown.length > 0 && (
            <div className="rounded-3xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-6 sm:p-8 space-y-4 shadow-sm">
              <h2 className="text-sm font-bold text-slate-900 dark:text-white">Alunos por curso</h2>
              <div className="space-y-2">
                {courseBreakdown.map((c) => (
                  <div key={c.title} className="flex items-center justify-between text-xs py-2 border-b border-slate-100 dark:border-slate-800 last:border-0">
                    <span className="text-slate-700 dark:text-slate-300 font-medium">{c.title}</span>
                    <span className="font-bold text-slate-900 dark:text-white">{c.count} aluno{c.count > 1 ? "s" : ""}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          <p className="text-[11px] text-slate-400 flex items-center gap-1.5">
            <ShieldCheck className="h-3.5 w-3.5 shrink-0" />
            Nenhum dado individual de aluno é exibido — todas as métricas são agregadas e só aparecem com no mínimo {minThreshold ?? 5} alunos por grupo.
          </p>
        </div>
      )}
    </main>
  );
}
