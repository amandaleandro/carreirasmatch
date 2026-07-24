"use client";

import { useState } from "react";
import { PublicSiteHeader } from "@/components/public-site-header";
import { SiteFooter } from "@/components/site-footer";
import { EnsinoMedioToolsNav } from "@/components/ensino-medio-tools-nav";
import { CourseComparison } from "@/lib/ensino-medio-tools";
import {
  Scale,
  Sparkles,
  GraduationCap,
  Briefcase,
  Search,
  CheckCircle2,
  XCircle,
  Clock,
  DollarSign,
  ArrowRight,
} from "lucide-react";

const SUGGESTED_AREAS = [
  "Ciência da Computação / Programação",
  "Enfermagem / Saúde",
  "Engenharia Elétrica / Eletrônica",
  "Administração / Gestão",
  "Química / Farmácia",
  "Design / Marketing Digital",
];

export default function CourseComparatorPage() {
  const [query, setQuery] = useState(SUGGESTED_AREAS[0]);
  const [customQuery, setCustomQuery] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [comparison, setComparison] = useState<CourseComparison | null>(null);

  const handleCompare = async (targetQuery?: string) => {
    const q = targetQuery || customQuery.trim() || query;
    if (!q) return;

    setLoading(true);
    setError(null);

    try {
      const res = await fetch("/api/ensino-medio/comparador/analisar", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ query: q }),
      });

      if (!res.ok) throw new Error("Erro na API");

      const json = await res.json();
      if (json.error) throw new Error(json.error);

      setComparison(json);
    } catch (err) {
      console.error(err);
      setError("Falha ao comparar as opções de formação.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-neutral-50 dark:bg-neutral-950 text-neutral-900 dark:text-neutral-50 font-sans">
      <PublicSiteHeader />
      <EnsinoMedioToolsNav />

      <main className="flex-1 max-w-5xl w-full mx-auto px-4 md:px-8 py-8 space-y-8">
        <header className="text-center max-w-2xl mx-auto space-y-3">
          <div className="inline-flex items-center gap-1.5 rounded-full bg-purple-500/10 text-purple-600 dark:text-purple-400 border border-purple-500/20 px-3 py-1 text-xs font-bold uppercase tracking-wider">
            <Scale className="h-3.5 w-3.5" />
            Comparador de Formação com Gemini AI
          </div>
          <h1 className="text-3xl md:text-4xl font-black text-neutral-900 dark:text-white">
            Faculdade vs Curso Técnico
          </h1>
          <p className="text-neutral-600 dark:text-neutral-400 text-xs md:text-sm leading-relaxed">
            Compare o tempo de estudo, estimativa de nota no SISU, mensalidade e velocidade de entrada no mercado para a área que você deseja seguir.
          </p>
        </header>

        {/* Form de Busca */}
        <div className="bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-3xl p-6 md:p-8 space-y-6 shadow-sm">
          <label className="block text-xs font-extrabold uppercase tracking-wider text-neutral-500">
            Escolha uma área ou digite o curso que você está considerando:
          </label>

          <div className="flex flex-wrap gap-2">
            {SUGGESTED_AREAS.map((area) => (
              <button
                key={area}
                onClick={() => {
                  setQuery(area);
                  setCustomQuery("");
                  handleCompare(area);
                }}
                className={`px-3.5 py-2 rounded-xl text-xs font-semibold transition-all ${
                  query === area && !customQuery
                    ? "bg-purple-600 text-white"
                    : "bg-neutral-100 dark:bg-neutral-800 text-neutral-700 dark:text-neutral-300"
                }`}
              >
                {area}
              </button>
            ))}
          </div>

          <div className="flex flex-col md:flex-row gap-3 pt-2">
            <div className="relative flex-1">
              <Search className="absolute left-3.5 top-3 h-4 w-4 text-neutral-400" />
              <input
                type="text"
                placeholder="Ou digite o nome do curso (ex: Radiologia, Mecânica, Direito...)"
                value={customQuery}
                onChange={(e) => setCustomQuery(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && handleCompare()}
                className="w-full pl-10 pr-4 py-2.5 bg-neutral-50 dark:bg-neutral-950 border border-neutral-200 dark:border-neutral-800 rounded-xl text-xs text-neutral-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-purple-500"
              />
            </div>
            <button
              onClick={() => handleCompare()}
              disabled={loading}
              className="px-6 py-2.5 bg-purple-600 hover:bg-purple-700 disabled:opacity-50 text-white font-bold text-xs rounded-xl transition-all shadow-sm flex items-center justify-center gap-2 shrink-0"
            >
              {loading ? (
                <>
                  <Sparkles className="h-4 w-4 animate-spin" />
                  Comparando com Gemini...
                </>
              ) : (
                <>
                  <Scale className="h-4 w-4" />
                  Comparar Caminhos
                </>
              )}
            </button>
          </div>

          {error && (
            <div className="p-3 rounded-xl bg-red-50 text-red-700 text-xs font-semibold">
              {error}
            </div>
          )}
        </div>

        {/* Resultado da Comparação */}
        {comparison && (
          <div className="space-y-6">
            <div className="p-5 rounded-2xl bg-purple-50 dark:bg-purple-950/40 border border-purple-200 dark:border-purple-800 text-xs md:text-sm font-medium text-purple-900 dark:text-purple-200">
              <strong>Resumo da Análise:</strong> {comparison.summary}
            </div>

            <div className="grid gap-6 md:grid-cols-2">
              {/* Card Faculdade */}
              <div className="bg-white dark:bg-neutral-900 border-2 border-purple-200 dark:border-purple-900 rounded-3xl p-6 space-y-5">
                <div className="flex items-center gap-2 font-extrabold text-purple-900 dark:text-purple-200">
                  <GraduationCap className="h-6 w-6 text-purple-600" />
                  Faculdade / Graduação
                </div>

                <div className="space-y-3 border-b border-neutral-100 dark:border-neutral-800 pb-4">
                  <h3 className="text-lg font-black text-neutral-900 dark:text-white">
                    {comparison.collegePath.title}
                  </h3>
                  <div className="flex flex-wrap gap-2 text-xs">
                    <span className="px-2.5 py-1 rounded-md bg-purple-100 dark:bg-purple-950 text-purple-700 dark:text-purple-300 font-bold">
                      {comparison.collegePath.degreeType}
                    </span>
                    <span className="px-2.5 py-1 rounded-md bg-neutral-100 dark:bg-neutral-800 font-medium">
                      ~{comparison.collegePath.averageDurationYears} anos
                    </span>
                  </div>
                </div>

                <div className="space-y-2 text-xs">
                  <div className="flex items-center justify-between">
                    <span className="text-neutral-500 font-medium">Corte SISU Estimado:</span>
                    <span className="font-extrabold text-neutral-900 dark:text-white">
                      {comparison.collegePath.sisuCutoffScoreEstimate}
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-neutral-500 font-medium">Mensalidade Média:</span>
                    <span className="font-extrabold text-neutral-900 dark:text-white">
                      {comparison.collegePath.monthlyFeeRange}
                    </span>
                  </div>
                </div>

                <div className="space-y-2">
                  <span className="text-xs font-bold text-emerald-600 uppercase">Vantagens</span>
                  <ul className="space-y-1 text-xs text-neutral-700 dark:text-neutral-300">
                    {comparison.collegePath.pros.map((p, i) => (
                      <li key={i} className="flex items-start gap-1.5">
                        <CheckCircle2 className="h-3.5 w-3.5 text-emerald-500 shrink-0 mt-0.5" />
                        {p}
                      </li>
                    ))}
                  </ul>
                </div>
              </div>

              {/* Card Curso Técnico */}
              <div className="bg-white dark:bg-neutral-900 border-2 border-blue-200 dark:border-blue-900 rounded-3xl p-6 space-y-5">
                <div className="flex items-center gap-2 font-extrabold text-blue-900 dark:text-blue-200">
                  <Briefcase className="h-6 w-6 text-blue-600" />
                  Curso Técnico (Mercado Rápido)
                </div>

                <div className="space-y-3 border-b border-neutral-100 dark:border-neutral-800 pb-4">
                  <h3 className="text-lg font-black text-neutral-900 dark:text-white">
                    {comparison.technicalPath.title}
                  </h3>
                  <div className="flex flex-wrap gap-2 text-xs">
                    <span className="px-2.5 py-1 rounded-md bg-blue-100 dark:bg-blue-950 text-blue-700 dark:text-blue-300 font-bold">
                      Técnico Profissional
                    </span>
                    <span className="px-2.5 py-1 rounded-md bg-neutral-100 dark:bg-neutral-800 font-medium">
                      ~{comparison.technicalPath.averageDurationYears} anos
                    </span>
                  </div>
                </div>

                <div className="space-y-2 text-xs">
                  <div className="flex items-center justify-between">
                    <span className="text-neutral-500 font-medium">Entrada:</span>
                    <span className="font-extrabold text-neutral-900 dark:text-white">
                      {comparison.technicalPath.entryRequirements}
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-neutral-500 font-medium">Salário Inicial Estimado:</span>
                    <span className="font-extrabold text-emerald-600 dark:text-emerald-400">
                      {comparison.technicalPath.initialSalaryEstimate}
                    </span>
                  </div>
                </div>

                <div className="space-y-2">
                  <span className="text-xs font-bold text-emerald-600 uppercase">Vantagens</span>
                  <ul className="space-y-1 text-xs text-neutral-700 dark:text-neutral-300">
                    {comparison.technicalPath.pros.map((p, i) => (
                      <li key={i} className="flex items-start gap-1.5">
                        <CheckCircle2 className="h-3.5 w-3.5 text-emerald-500 shrink-0 mt-0.5" />
                        {p}
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            </div>

            {/* Veredito */}
            <div className="p-6 rounded-3xl bg-neutral-900 text-white space-y-2">
              <span className="text-xs font-extrabold uppercase tracking-wider text-purple-400">
                Veredito & Recomendação Vocacional
              </span>
              <p className="text-xs md:text-sm leading-relaxed text-neutral-200">
                {comparison.verdict}
              </p>
            </div>
          </div>
        )}
      </main>

      <SiteFooter />
    </div>
  );
}
