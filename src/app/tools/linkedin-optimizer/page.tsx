"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { useFeedback } from "@/components/feedback-provider";

type LinkedInOptimization = {
  headlineOptions: string[];
  aboutSection: string;
  experienceBullets: string[];
  authorityPostSample: { title: string; content: string };
};

export default function LinkedinOptimizerPage() {
  const [currentRole, setCurrentRole] = useState("");
  const [targetRole, setTargetRole] = useState("");
  const [keySkills, setKeySkills] = useState("");
  const bioSummary = "";
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<LinkedInOptimization | null>(null);
  const [error, setError] = useState("");
  const [loadedFromSaved, setLoadedFromSaved] = useState(false);
  const { notify } = useFeedback();

  useEffect(() => {
    fetch("/api/tools/linkedin-optimizer")
      .then((res) => (res.ok ? res.json() : null))
      .then((data) => {
        if (data?.result) {
          setResult(data.result);
          setLoadedFromSaved(true);
        }
      })
      .catch(() => {});
  }, []);

  const handleOptimize = async () => {
    if (!targetRole.trim()) {
      notify("error", "Informe o cargo desejado para otimizar seu perfil.");
      return;
    }
    setLoading(true);
    setError("");
    setResult(null);

    try {
      const res = await fetch("/api/tools/linkedin-optimizer", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ currentRole, targetRole, keySkills, bioSummary }),
      });

      const data = await res.json();
      if (!res.ok) {
        notify("error", data.error || "Não foi possível otimizar o perfil.");
        setError(data.error || "Erro ao otimizar perfil.");
      } else {
        notify("success", "Perfil otimizado. Revise as sugestões antes de publicar.");
        setResult(data.linkedin);
        setLoadedFromSaved(false);
      }
    } catch {
      notify("error", "Erro de conexão. Tente novamente.");
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
        <span className="text-[11px] font-bold uppercase tracking-wider text-blue-600 dark:text-blue-400 bg-blue-100/60 dark:bg-blue-950/40 px-2.5 py-0.5 rounded-full">
          💼 Nicho Recolocação & Carreira Pro
        </span>
        <h1 className="text-2xl md:text-3xl font-bold tracking-tight text-neutral-900 dark:text-white">
          LinkedIn Profile & Post Optimizer por IA
        </h1>
        <p className="text-sm text-neutral-600 dark:text-neutral-400">
          Gere um título irresistível, uma seção &ldquo;Sobre&rdquo; de alta conversão e posts autorais para se destacar para recrutadores.
        </p>
      </header>

      <div className="space-y-4 rounded-2xl border border-neutral-200 dark:border-neutral-800 bg-white dark:bg-neutral-900 p-6 shadow-sm">
        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-neutral-700 dark:text-neutral-300 mb-1">
              Cargo Pretendido / Foco *
            </label>
            <input
              type="text"
              placeholder="Ex: Gerente de Projetos, Desenvolvedor Fullstack..."
              value={targetRole}
              onChange={(e) => setTargetRole(e.target.value)}
              className="w-full text-sm rounded-xl border border-neutral-300 dark:border-neutral-700 bg-neutral-50 dark:bg-neutral-800 p-3 text-neutral-900 dark:text-white focus:outline-hidden focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-neutral-700 dark:text-neutral-300 mb-1">
              Cargo Atual ou Último
            </label>
            <input
              type="text"
              placeholder="Ex: Coordenador de TI"
              value={currentRole}
              onChange={(e) => setCurrentRole(e.target.value)}
              className="w-full text-sm rounded-xl border border-neutral-300 dark:border-neutral-700 bg-neutral-50 dark:bg-neutral-800 p-3 text-neutral-900 dark:text-white focus:outline-hidden focus:ring-2 focus:ring-blue-500"
            />
          </div>
        </div>

        <div>
          <label className="block text-xs font-bold uppercase tracking-wider text-neutral-700 dark:text-neutral-300 mb-1">
            Principais Competências e Ferramentas (separadas por vírgula)
          </label>
          <input
            type="text"
            placeholder="Ex: Scrum, React, Gestão de Equipes, SQL, AWS..."
            value={keySkills}
            onChange={(e) => setKeySkills(e.target.value)}
            className="w-full text-sm rounded-xl border border-neutral-300 dark:border-neutral-700 bg-neutral-50 dark:bg-neutral-800 p-3 text-neutral-900 dark:text-white focus:outline-hidden focus:ring-2 focus:ring-blue-500"
          />
        </div>

        {error && <p className="text-xs font-semibold text-red-600 dark:text-red-400">{error}</p>}

        <button
          onClick={handleOptimize}
          disabled={loading || !targetRole.trim()}
          className="w-full py-3 px-4 font-bold text-sm rounded-xl bg-blue-600 hover:bg-blue-700 text-white transition-colors disabled:opacity-50"
        >
          {loading ? "Otimizando perfil no LinkedIn..." : "🚀 Gerar Otimização do LinkedIn"}
        </button>
      </div>

      {result && (
        <div className="space-y-6">
          {loadedFromSaved && (
            <p className="text-xs font-semibold text-neutral-500 dark:text-neutral-400">
              Mostrando a última otimização gerada para você. Gere de novo se algo mudou.
            </p>
          )}
          {result.headlineOptions?.length > 0 && (
            <section className="space-y-3">
              <h3 className="text-sm font-bold text-neutral-900 dark:text-white uppercase tracking-wider text-blue-600 dark:text-blue-400">
                Opções de Título (Headline) Otimizados
              </h3>
              <div className="space-y-2">
                {result.headlineOptions.map((h: string, idx: number) => (
                  <div key={idx} className="p-3.5 rounded-xl border border-blue-100 dark:border-blue-900/50 bg-blue-50/40 dark:bg-blue-950/20 text-xs font-semibold text-neutral-800 dark:text-neutral-200">
                    {h}
                  </div>
                ))}
              </div>
            </section>
          )}

          {result.aboutSection && (
            <section className="space-y-3">
              <h3 className="text-sm font-bold text-neutral-900 dark:text-white uppercase tracking-wider text-blue-600 dark:text-blue-400">
                Seção &ldquo;Sobre&rdquo; (Resumo Campeão)
              </h3>
              <div className="p-4 rounded-xl border border-neutral-200 dark:border-neutral-800 bg-white dark:bg-neutral-900 text-xs text-neutral-800 dark:text-neutral-200 leading-relaxed whitespace-pre-wrap">
                {result.aboutSection}
              </div>
            </section>
          )}

          {result.authorityPostSample && (
            <section className="space-y-3">
              <h3 className="text-sm font-bold text-neutral-900 dark:text-white uppercase tracking-wider text-purple-600 dark:text-purple-400">
                Modelo de Post Autoral para Atração de Recrutadores
              </h3>
              <div className="p-4 rounded-xl border border-purple-100 dark:border-purple-900/50 bg-purple-50/30 dark:bg-purple-950/20 space-y-2 text-xs">
                <p className="font-bold text-purple-900 dark:text-purple-200 text-sm">
                  {result.authorityPostSample.title}
                </p>
                <p className="text-neutral-800 dark:text-neutral-200 leading-relaxed whitespace-pre-wrap">
                  {result.authorityPostSample.content}
                </p>
              </div>
            </section>
          )}
        </div>
      )}
    </main>
  );
}
