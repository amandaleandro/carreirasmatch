"use client";

import { useState, FormEvent } from "react";
import Link from "next/link";

type Result = {
  title: string;
  bullets: string[];
};

export function ProjectToExperienceForm() {
  const [projectDescription, setProjectDescription] = useState("");
  const [targetArea, setTargetArea] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<Result | null>(null);

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setError(null);

    if (!projectDescription.trim()) {
      setError("Descreva o projeto, curso, TCC ou atividade.");
      return;
    }

    setLoading(true);
    setResult(null);

    try {
      const res = await fetch("/api/tools/project-to-experience", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ projectDescription, targetArea }),
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
          Transformar projeto em experiência
        </h1>
        <p className="text-neutral-600 dark:text-neutral-400 mt-2">
          Não tem experiência profissional ainda? Cole um projeto acadêmico, TCC,
          curso, projeto pessoal ou trabalho voluntário e a IA transforma em uma
          seção profissional pronta para o currículo.
        </p>
      </header>

      <form onSubmit={handleSubmit} className="space-y-5">
        <div>
          <label className="block text-sm font-medium mb-1">
            Cargo-alvo (opcional)
          </label>
          <input
            type="text"
            value={targetArea}
            onChange={(e) => setTargetArea(e.target.value)}
            placeholder="Ex: DevOps Júnior"
            className="w-full rounded-md border border-neutral-300 dark:border-neutral-700 bg-transparent px-3 py-2 text-sm"
          />
        </div>

        <div>
          <label className="block text-sm font-medium mb-1">
            Descreva o projeto, curso ou atividade
          </label>
          <textarea
            value={projectDescription}
            onChange={(e) => setProjectDescription(e.target.value)}
            rows={8}
            placeholder="Ex: Fiz um projeto da faculdade onde criei um site de controle de tarefas usando React e um banco de dados. Também usei Git para versionar o código."
            className="w-full rounded-md border border-neutral-300 dark:border-neutral-700 bg-transparent px-3 py-2 text-sm"
          />
        </div>

        {error && <p className="text-sm text-red-500">{error}</p>}

        <button
          type="submit"
          disabled={loading}
          className="w-full rounded-md bg-neutral-900 dark:bg-white text-white dark:text-neutral-900 font-medium py-2.5 disabled:opacity-50"
        >
          {loading ? "Gerando..." : "Transformar em experiência"}
        </button>
      </form>

      {result && (
        <div className="mt-10 rounded-xl border border-neutral-200 dark:border-neutral-800 p-5">
          <h3 className="font-semibold mb-3">{result.title}</h3>
          <ul className="space-y-2 list-disc list-inside text-sm text-neutral-700 dark:text-neutral-300">
            {result.bullets.map((b, i) => (
              <li key={i}>{b}</li>
            ))}
          </ul>
        </div>
      )}
    </main>
  );
}
