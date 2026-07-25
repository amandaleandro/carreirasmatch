"use client";

import React, { useState } from "react";
import Link from "next/link";

type EditalSubject = {
  name: string;
  weight: "Alta" | "Média" | "Baixa";
  estimatedHoursWeek: number;
  keyTopics: string[];
};

type StudyPlanDay = {
  day: string;
  focusSubject: string;
  activity: string;
};

type EditalAnalysisResult = {
  concursoTitle: string;
  banca: string;
  totalVagas: string;
  salaryLabel: string;
  subjects: EditalSubject[];
  studyPlanCycle: StudyPlanDay[];
  criticalDates: string[];
};

export default function LeitorEditalPage() {
  const [editalText, setEditalText] = useState("");
  const [targetRole, setTargetRole] = useState("");
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<EditalAnalysisResult | null>(null);
  const [error, setError] = useState("");

  const handleAnalyze = async () => {
    if (!editalText.trim()) return;
    setLoading(true);
    setError("");
    setResult(null);

    try {
      const res = await fetch("/api/tools/parse-edital", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ editalText, targetRole }),
      });

      const data = await res.json();
      if (!res.ok) {
        setError(data.error || "Erro ao analisar edital.");
      } else {
        setResult(data.parsedData);
      }
    } catch {
      setError("Erro de conexão. Tente novamente.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="max-w-3xl mx-auto px-4 py-10 space-y-8">
      <Link href="/tools" className="text-sm font-semibold text-blue-600 dark:text-blue-400 hover:underline">
        ← Voltar para Ferramentas
      </Link>

      <header className="space-y-2">
        <span className="text-[11px] font-bold uppercase tracking-wider text-amber-600 dark:text-amber-400 bg-amber-100/60 dark:bg-amber-950/40 px-2.5 py-0.5 rounded-full">
          📜 Nicho Concurseiro & OAB
        </span>
        <h1 className="text-2xl md:text-3xl font-bold tracking-tight text-neutral-900 dark:text-white">
          Leitor de Edital Inteligente por IA
        </h1>
        <p className="text-sm text-neutral-600 dark:text-neutral-400">
          Cole o trecho ou resumo do edital para extrair matérias, disciplinas prioritárias e ciclo semanal de estudos.
        </p>
      </header>

      <div className="space-y-4 rounded-2xl border border-neutral-200 dark:border-neutral-800 bg-white dark:bg-neutral-900 p-6 shadow-sm">
        <div>
          <label className="block text-xs font-bold uppercase tracking-wider text-neutral-700 dark:text-neutral-300 mb-1">
            Cargo ou Especialidade de Interesse (opcional)
          </label>
          <input
            type="text"
            placeholder="Ex: Analista Judiciário, Técnico de TI, Advogado..."
            value={targetRole}
            onChange={(e) => setTargetRole(e.target.value)}
            className="w-full text-sm rounded-xl border border-neutral-300 dark:border-neutral-700 bg-neutral-50 dark:bg-neutral-800 p-3 text-neutral-900 dark:text-white focus:outline-hidden focus:ring-2 focus:ring-amber-500"
          />
        </div>

        <div>
          <label className="block text-xs font-bold uppercase tracking-wider text-neutral-700 dark:text-neutral-300 mb-1">
            Texto do Edital (Conteúdo Programático ou Regulamento)
          </label>
          <textarea
            rows={8}
            placeholder="Cole aqui o trecho do edital contendo as disciplinas, número de vagas e provas..."
            value={editalText}
            onChange={(e) => setEditalText(e.target.value)}
            className="w-full text-sm rounded-xl border border-neutral-300 dark:border-neutral-700 bg-neutral-50 dark:bg-neutral-800 p-3 text-neutral-900 dark:text-white focus:outline-hidden focus:ring-2 focus:ring-amber-500"
          />
        </div>

        {error && <p className="text-xs font-semibold text-red-600 dark:text-red-400">{error}</p>}

        <button
          onClick={handleAnalyze}
          disabled={loading || !editalText.trim()}
          className="w-full py-3 px-4 font-bold text-sm rounded-xl bg-amber-600 hover:bg-amber-700 text-white transition-colors disabled:opacity-50"
        >
          {loading ? "Extraindo estrutura do edital..." : "📊 Extrair Matérias e Ciclo de Estudos"}
        </button>
      </div>

      {result && (
        <div className="space-y-6">
          <div className="p-5 rounded-2xl border border-amber-200 dark:border-amber-900 bg-amber-50/50 dark:bg-amber-950/30 space-y-2">
            <h2 className="text-lg font-bold text-amber-900 dark:text-amber-200">
              {result.concursoTitle || "Análise do Edital"}
            </h2>
            <div className="flex flex-wrap gap-4 text-xs font-medium text-amber-800 dark:text-amber-300">
              {result.banca && <span>Banca: <strong>{result.banca}</strong></span>}
              {result.totalVagas && <span>Vagas: <strong>{result.totalVagas}</strong></span>}
              {result.salaryLabel && <span>Remuneração: <strong>{result.salaryLabel}</strong></span>}
            </div>
          </div>

          {result.subjects?.length > 0 && (
            <section className="space-y-3">
              <h3 className="text-base font-bold text-neutral-900 dark:text-white">
                Disciplinas e Pesos de Estudo
              </h3>
              <div className="grid gap-3 sm:grid-cols-2">
                {result.subjects.map((sub, i) => (
                  <div key={i} className="p-4 rounded-xl border border-neutral-200 dark:border-neutral-800 bg-white dark:bg-neutral-900 space-y-1.5">
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-sm text-neutral-900 dark:text-white">{sub.name}</span>
                      <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300">
                        Peso: {sub.weight}
                      </span>
                    </div>
                    <p className="text-xs text-neutral-500">Estimativa: {sub.estimatedHoursWeek}h por semana</p>
                    {sub.keyTopics?.length > 0 && (
                      <div className="flex flex-wrap gap-1 pt-1">
                        {sub.keyTopics.map((top: string, idx: number) => (
                          <span key={idx} className="text-[10px] px-1.5 py-0.5 rounded bg-neutral-100 dark:bg-neutral-800 text-neutral-600 dark:text-neutral-400">
                            {top}
                          </span>
                        ))}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </section>
          )}

          {result.studyPlanCycle?.length > 0 && (
            <section className="space-y-3">
              <h3 className="text-base font-bold text-neutral-900 dark:text-white">
                Ciclo de Estudos Sugerido
              </h3>
              <div className="space-y-2">
                {result.studyPlanCycle.map((item, idx) => (
                  <div key={idx} className="p-3 rounded-xl border border-neutral-200 dark:border-neutral-800 bg-white dark:bg-neutral-900 flex items-center justify-between text-xs">
                    <span className="font-bold text-amber-700 dark:text-amber-400 w-16">{item.day}</span>
                    <span className="font-semibold text-neutral-900 dark:text-white flex-1">{item.focusSubject}</span>
                    <span className="text-neutral-500 text-right">{item.activity}</span>
                  </div>
                ))}
              </div>
            </section>
          )}
        </div>
      )}
    </main>
  );
}
