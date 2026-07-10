"use client";

import { useState, FormEvent } from "react";
import Link from "next/link";

type Result = {
  suggestedHeadline: string;
  suggestedAbout: string;
  suggestedGithubBio: string;
  projectHighlights: string[];
  nextSteps: string[];
};

export function ProfileFromScratchForm() {
  const [education, setEducation] = useState("");
  const [projects, setProjects] = useState("");
  const [skills, setSkills] = useState("");
  const [targetRole, setTargetRole] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<Result | null>(null);

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setError(null);

    if (!education.trim() && !projects.trim() && !skills.trim()) {
      setError("Preencha ao menos formação, projetos ou habilidades.");
      return;
    }

    setLoading(true);
    setResult(null);

    try {
      const res = await fetch("/api/tools/profile-from-scratch", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ education, projects, skills, targetRole }),
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
        <h1 className="text-2xl md:text-3xl font-bold tracking-tight">
          Monte seu perfil do zero
        </h1>
        <p className="text-neutral-600 dark:text-neutral-400 mt-2">
          Ainda não tem LinkedIn ou GitHub? Conte sua formação, projetos e habilidades e receba
          um rascunho pronto para criar os dois perfis.
        </p>
      </header>

      <form onSubmit={handleSubmit} className="space-y-5">
        <div>
          <label className="block text-sm font-medium mb-1">Cargo-alvo</label>
          <input
            type="text"
            value={targetRole}
            onChange={(e) => setTargetRole(e.target.value)}
            placeholder="Ex: Estágio em Desenvolvimento"
            className="w-full rounded-md border border-neutral-300 dark:border-neutral-700 bg-transparent px-3 py-2 text-sm"
          />
        </div>

        <div>
          <label className="block text-sm font-medium mb-1">Formação</label>
          <textarea
            value={education}
            onChange={(e) => setEducation(e.target.value)}
            rows={3}
            placeholder="Ex: Cursando Análise e Desenvolvimento de Sistemas, previsão de conclusão 2027"
            className="w-full rounded-md border border-neutral-300 dark:border-neutral-700 bg-transparent px-3 py-2 text-sm"
          />
        </div>

        <div>
          <label className="block text-sm font-medium mb-1">
            Projetos/atividades (acadêmicos, pessoais, cursos, voluntariado)
          </label>
          <textarea
            value={projects}
            onChange={(e) => setProjects(e.target.value)}
            rows={5}
            placeholder="Ex: TCC sobre..., projeto pessoal de..., curso de..."
            className="w-full rounded-md border border-neutral-300 dark:border-neutral-700 bg-transparent px-3 py-2 text-sm"
          />
        </div>

        <div>
          <label className="block text-sm font-medium mb-1">Habilidades/tecnologias</label>
          <textarea
            value={skills}
            onChange={(e) => setSkills(e.target.value)}
            rows={3}
            placeholder="Ex: Python, Excel, Figma, inglês intermediário"
            className="w-full rounded-md border border-neutral-300 dark:border-neutral-700 bg-transparent px-3 py-2 text-sm"
          />
        </div>

        {error && <p className="text-sm text-red-500">{error}</p>}

        <button
          type="submit"
          disabled={loading}
          className="w-full rounded-md bg-neutral-900 dark:bg-white text-white dark:text-neutral-900 font-medium py-2.5 disabled:opacity-50"
        >
          {loading ? "Gerando..." : "Gerar perfil"}
        </button>
      </form>

      {result && (
        <div className="mt-10 space-y-6">
          <div className="rounded-xl border border-neutral-200 dark:border-neutral-800 p-5">
            <h3 className="font-semibold mb-3">Headline sugerida (LinkedIn)</h3>
            <p className="text-sm text-neutral-700 dark:text-neutral-300">
              {result.suggestedHeadline}
            </p>
          </div>
          <div className="rounded-xl border border-neutral-200 dark:border-neutral-800 p-5">
            <h3 className="font-semibold mb-3">Seção &quot;sobre&quot; sugerida (LinkedIn)</h3>
            <p className="text-sm text-neutral-700 dark:text-neutral-300 whitespace-pre-line">
              {result.suggestedAbout}
            </p>
          </div>
          <div className="rounded-xl border border-neutral-200 dark:border-neutral-800 p-5">
            <h3 className="font-semibold mb-3">Bio sugerida (GitHub)</h3>
            <p className="text-sm text-neutral-700 dark:text-neutral-300">
              {result.suggestedGithubBio}
            </p>
          </div>
          <div className="rounded-xl border border-neutral-200 dark:border-neutral-800 p-5">
            <h3 className="font-semibold mb-3">Como destacar seus projetos no GitHub</h3>
            <ul className="space-y-2 list-disc list-inside text-sm text-neutral-700 dark:text-neutral-300">
              {result.projectHighlights.map((p, i) => (
                <li key={i}>{p}</li>
              ))}
            </ul>
          </div>
          <div className="rounded-xl border border-neutral-200 dark:border-neutral-800 p-5">
            <h3 className="font-semibold mb-3">Próximos passos</h3>
            <ul className="space-y-2 list-disc list-inside text-sm text-neutral-700 dark:text-neutral-300">
              {result.nextSteps.map((s, i) => (
                <li key={i}>{s}</li>
              ))}
            </ul>
          </div>
        </div>
      )}
    </main>
  );
}
