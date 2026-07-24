"use client";

import React, { useState } from "react";
import Link from "next/link";

export default function MatrizDeSkillsPage() {
  const [previousRole, setPreviousRole] = useState("");
  const [targetRole, setTargetRole] = useState("");
  const [previousSkills, setPreviousSkills] = useState("");
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<any>(null);
  const [error, setError] = useState("");

  const handleGenerate = async () => {
    if (!previousRole.trim() || !targetRole.trim()) return;
    setLoading(true);
    setError("");
    setResult(null);

    try {
      const res = await fetch("/api/tools/skill-matrix", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ previousRole, targetRole, previousSkills }),
      });

      const data = await res.json();
      if (!res.ok) {
        setError(data.error || "Erro ao gerar matriz.");
      } else {
        setResult(data.matrix);
      }
    } catch (e) {
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
        <span className="text-[11px] font-bold uppercase tracking-wider text-violet-600 dark:text-violet-400 bg-violet-100/60 dark:bg-violet-950/40 px-2.5 py-0.5 rounded-full">
          🔄 Nicho Transição de Carreira
        </span>
        <h1 className="text-2xl md:text-3xl font-bold tracking-tight text-neutral-900 dark:text-white">
          Matriz de Equivalência de Competências
        </h1>
        <p className="text-sm text-neutral-600 dark:text-neutral-400">
          Traduza termos da sua carreira passada no vocabulário técnico exigido no seu novo objetivo profissional.
        </p>
      </header>

      <div className="space-y-4 rounded-2xl border border-neutral-200 dark:border-neutral-800 bg-white dark:bg-neutral-900 p-6 shadow-sm">
        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-neutral-700 dark:text-neutral-300 mb-1">
              Cargo / Área Anterior *
            </label>
            <input
              type="text"
              placeholder="Ex: Professor, Vendedor, Atendimento..."
              value={previousRole}
              onChange={(e) => setPreviousRole(e.target.value)}
              className="w-full text-sm rounded-xl border border-neutral-300 dark:border-neutral-700 bg-neutral-50 dark:bg-neutral-800 p-3 text-neutral-900 dark:text-white focus:outline-hidden focus:ring-2 focus:ring-violet-500"
            />
          </div>
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-neutral-700 dark:text-neutral-300 mb-1">
              Nova Área Pretendida *
            </label>
            <input
              type="text"
              placeholder="Ex: Scrum Master, Product Manager, Dev Frontend..."
              value={targetRole}
              onChange={(e) => setTargetRole(e.target.value)}
              className="w-full text-sm rounded-xl border border-neutral-300 dark:border-neutral-700 bg-neutral-50 dark:bg-neutral-800 p-3 text-neutral-900 dark:text-white focus:outline-hidden focus:ring-2 focus:ring-violet-500"
            />
          </div>
        </div>

        <div>
          <label className="block text-xs font-bold uppercase tracking-wider text-neutral-700 dark:text-neutral-300 mb-1">
            Principais Atividades do Cargo Antigo (opcional)
          </label>
          <textarea
            rows={3}
            placeholder="Ex: Organizava reuniões, resolvia conflitos com clientes, montava planilhas..."
            value={previousSkills}
            onChange={(e) => setPreviousSkills(e.target.value)}
            className="w-full text-sm rounded-xl border border-neutral-300 dark:border-neutral-700 bg-neutral-50 dark:bg-neutral-800 p-3 text-neutral-900 dark:text-white focus:outline-hidden focus:ring-2 focus:ring-violet-500"
          />
        </div>

        {error && <p className="text-xs font-semibold text-red-600 dark:text-red-400">{error}</p>}

        <button
          onClick={handleGenerate}
          disabled={loading || !previousRole.trim() || !targetRole.trim()}
          className="w-full py-3 px-4 font-bold text-sm rounded-xl bg-violet-600 hover:bg-violet-700 text-white transition-colors disabled:opacity-50"
        >
          {loading ? "Mapeando equivalência de skills..." : "⚖️ Gerar Matriz de Equivalência"}
        </button>
      </div>

      {result && (
        <div className="space-y-6">
          {result.transitionalNarrative && (
            <div className="p-5 rounded-2xl border border-violet-200 dark:border-violet-900 bg-violet-50/50 dark:bg-violet-950/30 space-y-2">
              <h3 className="text-xs font-bold uppercase tracking-wider text-violet-800 dark:text-violet-300">
                Narrativa de Transição Recomendada
              </h3>
              <p className="text-sm text-neutral-800 dark:text-neutral-200 leading-relaxed">
                "{result.transitionalNarrative}"
              </p>
            </div>
          )}

          {result.skillEquivalencies?.length > 0 && (
            <section className="space-y-3">
              <h3 className="text-base font-bold text-neutral-900 dark:text-white">
                Tradução de Competências (Experiência Passada ➔ Nova Área)
              </h3>
              <div className="space-y-3">
                {result.skillEquivalencies.map((eq: any, idx: number) => (
                  <div key={idx} className="p-4 rounded-xl border border-neutral-200 dark:border-neutral-800 bg-white dark:bg-neutral-900 space-y-2">
                    <div className="flex flex-wrap items-center justify-between gap-2 text-xs font-bold">
                      <span className="text-neutral-500">De: {eq.previousSkill}</span>
                      <span className="text-violet-600 dark:text-violet-400">➔ Para: {eq.targetEquivalent}</span>
                    </div>
                    <p className="text-xs text-neutral-700 dark:text-neutral-300 bg-neutral-50 dark:bg-neutral-800 p-2.5 rounded-lg">
                      <strong className="font-semibold text-neutral-900 dark:text-white">Como colocar no currículo:</strong> {eq.howToDescribeInResume}
                    </p>
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
