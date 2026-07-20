"use client";

import { useState, FormEvent } from "react";
import { useRouter } from "next/navigation";

export function NewVagaForm() {
  const router = useRouter();
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [area, setArea] = useState("");
  const [state, setState] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [generating, setGenerating] = useState(false);

  async function generateDescription() {
    if (!title.trim()) {
      setError("Informe o cargo da vaga primeiro.");
      return;
    }
    setGenerating(true);
    setError(null);
    try {
      const res = await fetch("/api/empresa/vagas/descricao", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ title, notes: description }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "Não foi possível gerar agora.");
      setDescription(data.description as string);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Erro inesperado.");
    } finally {
      setGenerating(false);
    }
  }

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setError(null);
    if (!title.trim() || !description.trim()) {
      setError("Preencha o cargo e a descrição da vaga.");
      return;
    }
    setLoading(true);
    try {
      const res = await fetch("/api/empresa/vagas", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ title, description, area, state }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "Erro ao cadastrar a vaga.");
      router.push(`/empresa/vagas/${data.id}`);
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Erro inesperado.");
    } finally {
      setLoading(false);
    }
  }

  const inputClass =
    "w-full rounded-xl border border-neutral-200 dark:border-white/10 bg-white dark:bg-white/[0.03] px-3.5 py-3 text-sm outline-none focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 transition-colors";
  const labelClass = "block text-sm font-medium mb-1.5";

  return (
    <form onSubmit={handleSubmit} className="space-y-5 rounded-2xl border border-neutral-200 dark:border-neutral-800 bg-white dark:bg-neutral-950 p-6 shadow-sm shadow-slate-900/5">
      <div>
        <label className={labelClass}>Cargo da vaga</label>
        <input
          type="text"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="Ex: Vendedor(a) externo(a), Analista de RH..."
          className={inputClass}
          maxLength={140}
        />
      </div>
      <div>
        <div className="flex items-center justify-between mb-1.5">
          <label className="block text-sm font-medium">Descrição da vaga</label>
          <button
            type="button"
            onClick={generateDescription}
            disabled={generating}
            className="text-xs font-semibold text-blue-600 dark:text-blue-400 hover:underline disabled:opacity-50"
          >
            {generating ? "Gerando..." : "✨ Gerar com IA"}
          </button>
        </div>
        <textarea
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          placeholder="Requisitos, responsabilidades e o perfil desejado. Ou clique em Gerar com IA."
          rows={6}
          className={inputClass}
          maxLength={5000}
        />
      </div>
      <div className="flex gap-3">
        <div className="flex-1">
          <label className={labelClass}>Filtrar por área (opcional)</label>
          <input type="text" value={area} onChange={(e) => setArea(e.target.value)} className={inputClass} placeholder="Ex: Administração" />
        </div>
        <div className="w-24">
          <label className={labelClass}>UF (opcional)</label>
          <input type="text" value={state} onChange={(e) => setState(e.target.value.toUpperCase())} maxLength={2} className={inputClass} />
        </div>
      </div>

      {error && <p className="text-sm font-semibold text-red-500">{error}</p>}

      <button
        type="submit"
        disabled={loading}
        className="w-full rounded-xl bg-blue-600 px-6 py-3 text-sm font-semibold text-white shadow-sm shadow-blue-600/20 transition-all hover:bg-blue-700 disabled:opacity-50"
      >
        {loading ? "Buscando candidatos..." : "Cadastrar vaga e buscar candidatos"}
      </button>
      {loading && (
        <p className="text-xs text-center text-neutral-500">
          Estamos varrendo o banco de talentos e ranqueando por aderência. Pode levar alguns segundos.
        </p>
      )}
    </form>
  );
}
