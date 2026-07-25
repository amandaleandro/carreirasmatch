"use client";

import React, { useState } from "react";
import Link from "next/link";

type SoftSkillsResult = {
  projectTitle: string;
  softSkillsIdentified: string[];
  resumeExperienceBlock: { roleTitle: string; bullets: string[] };
  interviewTalkingPoints: string[];
};

export default function ExtratorSoftSkillsPage() {
  const [targetRole, setTargetRole] = useState("");
  const [projectDescription, setProjectDescription] = useState("");
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<SoftSkillsResult | null>(null);
  const [error, setError] = useState("");

  const handleExtract = async () => {
    if (!projectDescription.trim()) return;
    setLoading(true);
    setError("");
    setResult(null);

    try {
      const res = await fetch("/api/tools/extract-soft-skills", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ targetRole, projectDescription }),
      });

      const data = await res.json();
      if (!res.ok) {
        setError(data.error || "Erro ao extrair competências.");
      } else {
        setResult(data.extracted);
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
        <span className="text-[11px] font-bold uppercase tracking-wider text-emerald-600 dark:text-emerald-400 bg-emerald-100/60 dark:bg-emerald-950/40 px-2.5 py-0.5 rounded-full">
          🌱 Nicho Jovem Aprendiz & Primeiro Emprego
        </span>
        <h1 className="text-2xl md:text-3xl font-bold tracking-tight text-neutral-900 dark:text-white">
          Extrator de Soft Skills & Projetos Pessoais
        </h1>
        <p className="text-sm text-neutral-600 dark:text-neutral-400">
          Transforme trabalhos escolares, feiras de ciências, liderança jovem ou voluntariado em tópicos de experiência para o seu currículo.
        </p>
      </header>

      <div className="space-y-4 rounded-2xl border border-neutral-200 dark:border-neutral-800 bg-white dark:bg-neutral-900 p-6 shadow-sm">
        <div>
          <label className="block text-xs font-bold uppercase tracking-wider text-neutral-700 dark:text-neutral-300 mb-1">
            Vaga ou Programa Desejado (opcional)
          </label>
          <input
            type="text"
            placeholder="Ex: Jovem Aprendiz Administrativo, Auxiliar de Loja..."
            value={targetRole}
            onChange={(e) => setTargetRole(e.target.value)}
            className="w-full text-sm rounded-xl border border-neutral-300 dark:border-neutral-700 bg-neutral-50 dark:bg-neutral-800 p-3 text-neutral-900 dark:text-white focus:outline-hidden focus:ring-2 focus:ring-emerald-500"
          />
        </div>

        <div>
          <label className="block text-xs font-bold uppercase tracking-wider text-neutral-700 dark:text-neutral-300 mb-1">
            Descreva a atividade, trabalho escolar ou projeto que você realizou *
          </label>
          <textarea
            rows={5}
            placeholder="Ex: Organizei a feira de ciências da escola, liderei o grupo de 4 pessoas, apresentei para a turma e criei a apresentação no PowerPoint..."
            value={projectDescription}
            onChange={(e) => setProjectDescription(e.target.value)}
            className="w-full text-sm rounded-xl border border-neutral-300 dark:border-neutral-700 bg-neutral-50 dark:bg-neutral-800 p-3 text-neutral-900 dark:text-white focus:outline-hidden focus:ring-2 focus:ring-emerald-500"
          />
        </div>

        {error && <p className="text-xs font-semibold text-red-600 dark:text-red-400">{error}</p>}

        <button
          onClick={handleExtract}
          disabled={loading || !projectDescription.trim()}
          className="w-full py-3 px-4 font-bold text-sm rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white transition-colors disabled:opacity-50"
        >
          {loading ? "Transformando projeto em experiência..." : "✨ Transformar em Experiência Profissional"}
        </button>
      </div>

      {result && (
        <div className="space-y-6">
          {result.softSkillsIdentified?.length > 0 && (
            <section className="space-y-2">
              <h3 className="text-xs font-bold uppercase tracking-wider text-emerald-700 dark:text-emerald-400">
                Soft Skills Identificadas
              </h3>
              <div className="flex flex-wrap gap-2">
                {result.softSkillsIdentified.map((skill: string, idx: number) => (
                  <span key={idx} className="text-xs font-bold px-3 py-1 rounded-full bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300">
                    ✓ {skill}
                  </span>
                ))}
              </div>
            </section>
          )}

          {result.resumeExperienceBlock && (
            <section className="space-y-3">
              <h3 className="text-sm font-bold text-neutral-900 dark:text-white uppercase tracking-wider text-emerald-700 dark:text-emerald-400">
                Bloco para Copiar e Colar no Currículo
              </h3>
              <div className="p-4 rounded-xl border border-emerald-200 dark:border-emerald-900 bg-emerald-50/40 dark:bg-emerald-950/20 space-y-2 text-xs">
                <p className="font-bold text-neutral-900 dark:text-white text-sm">
                  {result.resumeExperienceBlock.roleTitle || result.projectTitle}
                </p>
                <ul className="list-disc list-inside space-y-1 text-neutral-800 dark:text-neutral-200">
                  {result.resumeExperienceBlock.bullets?.map((b: string, i: number) => (
                    <li key={i}>{b}</li>
                  ))}
                </ul>
              </div>
            </section>
          )}

          {result.interviewTalkingPoints?.length > 0 && (
            <section className="space-y-2">
              <h3 className="text-xs font-bold uppercase tracking-wider text-purple-700 dark:text-purple-400">
                Como Falar Sobre Isso na Entrevista
              </h3>
              <ul className="list-disc list-inside space-y-1 text-xs text-neutral-700 dark:text-neutral-300 bg-purple-50/50 dark:bg-purple-950/20 p-3.5 rounded-xl border border-purple-100 dark:border-purple-900/40">
                {result.interviewTalkingPoints.map((pt: string, idx: number) => (
                  <li key={idx}>{pt}</li>
                ))}
              </ul>
            </section>
          )}
        </div>
      )}
    </main>
  );
}
