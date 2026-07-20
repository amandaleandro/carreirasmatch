"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export function AddResumesForm({ jobId }: { jobId: string }) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [files, setFiles] = useState<File[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function submit() {
    if (files.length === 0) {
      setError("Selecione ao menos um currículo em PDF.");
      return;
    }
    setLoading(true);
    setError(null);
    try {
      const formData = new FormData();
      for (const file of files) formData.append("resumes", file);
      const res = await fetch(`/api/empresa/triagem/${jobId}/curriculos`, { method: "POST", body: formData });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "Erro ao adicionar currículos.");
      setFiles([]);
      setOpen(false);
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Erro inesperado.");
    } finally {
      setLoading(false);
    }
  }

  if (!open) {
    return (
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="rounded-lg border border-neutral-200 dark:border-neutral-800 px-3 py-1.5 text-sm font-medium hover:bg-neutral-50 dark:hover:bg-neutral-900 transition-colors"
      >
        + Adicionar currículos
      </button>
    );
  }

  return (
    <div className="rounded-2xl border border-neutral-200 dark:border-neutral-800 bg-white dark:bg-neutral-950 p-5 space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="font-semibold">Adicionar currículos a esta triagem</h3>
        <button type="button" onClick={() => setOpen(false)} className="text-sm text-neutral-500 hover:underline">
          Cancelar
        </button>
      </div>
      <p className="text-xs text-neutral-500">
        Ranqueamos os novos currículos contra a mesma vaga e adicionamos ao ranking. Não consome
        crédito.
      </p>
      <input
        type="file"
        accept="application/pdf"
        multiple
        onChange={(e) => setFiles(Array.from(e.target.files ?? []))}
        className="block w-full text-sm text-neutral-600 dark:text-neutral-400 file:mr-4 file:rounded-lg file:border-0 file:bg-blue-50 dark:file:bg-blue-950/40 file:px-4 file:py-2 file:text-sm file:font-semibold file:text-blue-600 dark:file:text-blue-300 hover:file:bg-blue-100 dark:hover:file:bg-blue-900/40"
      />
      {files.length > 0 && (
        <p className="text-xs text-neutral-500">
          {files.length} {files.length === 1 ? "arquivo selecionado" : "arquivos selecionados"}
        </p>
      )}
      {error && <p className="text-sm font-semibold text-red-500">{error}</p>}
      <button
        type="button"
        onClick={submit}
        disabled={loading}
        className="rounded-xl bg-blue-600 px-5 py-2.5 text-sm font-semibold text-white hover:bg-blue-700 transition-colors disabled:opacity-50"
      >
        {loading ? "Analisando..." : "Adicionar ao ranking"}
      </button>
    </div>
  );
}
