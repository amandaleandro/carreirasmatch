"use client";

import { useState, FormEvent } from "react";
import { useRouter } from "next/navigation";

export function NewScreeningForm() {
  const router = useRouter();
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [files, setFiles] = useState<File[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setError(null);

    if (!title.trim() || !description.trim()) {
      setError("Preencha o cargo e a descrição da vaga.");
      return;
    }
    if (files.length === 0) {
      setError("Envie ao menos um currículo em PDF.");
      return;
    }

    setLoading(true);
    try {
      const formData = new FormData();
      formData.append("title", title);
      formData.append("description", description);
      for (const file of files) formData.append("resumes", file);

      const res = await fetch("/api/empresa/triagem", { method: "POST", body: formData });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "Erro ao processar a triagem.");

      router.push(`/empresa/triagem/${data.id}`);
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
        <label className={labelClass}>Descrição da vaga</label>
        <textarea
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          placeholder="Cole aqui os requisitos, responsabilidades e o perfil desejado."
          rows={6}
          className={inputClass}
          maxLength={5000}
        />
      </div>

      <div>
        <label className={labelClass}>Currículos (PDF, até 30)</label>
        <input
          type="file"
          accept="application/pdf"
          multiple
          onChange={(e) => setFiles(Array.from(e.target.files ?? []))}
          className="block w-full text-sm text-neutral-600 dark:text-neutral-400 file:mr-4 file:rounded-lg file:border-0 file:bg-blue-50 dark:file:bg-blue-950/40 file:px-4 file:py-2 file:text-sm file:font-semibold file:text-blue-600 dark:file:text-blue-300 hover:file:bg-blue-100 dark:hover:file:bg-blue-900/40"
        />
        {files.length > 0 && (
          <p className="text-xs text-neutral-500 mt-2">
            {files.length} {files.length === 1 ? "arquivo selecionado" : "arquivos selecionados"}
          </p>
        )}
      </div>

      {error && <p className="text-sm font-semibold text-red-500">{error}</p>}

      <button
        type="submit"
        disabled={loading}
        className="w-full rounded-xl bg-blue-600 px-6 py-3 text-sm font-semibold text-white shadow-sm shadow-blue-600/20 transition-all hover:bg-blue-700 disabled:opacity-50"
      >
        {loading ? "Analisando currículos..." : "Ranquear candidatos"}
      </button>
      {loading && (
        <p className="text-xs text-center text-neutral-500">
          Isso pode levar alguns segundos dependendo do número de currículos.
        </p>
      )}
    </form>
  );
}
