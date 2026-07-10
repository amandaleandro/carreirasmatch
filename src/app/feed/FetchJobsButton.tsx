"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export function FetchJobsButton() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<string | null>(null);

  async function handleClick() {
    setMessage(null);
    setLoading(true);
    try {
      const res = await fetch("/api/feed/fetch-jobs", { method: "POST" });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "Erro ao buscar novas vagas.");

      const summary =
        data.added > 0
          ? `${data.added} nova(s) vaga(s) adicionada(s) ao feed.`
          : "Nenhuma vaga nova encontrada no momento.";
      const errorNote =
        data.errors?.length > 0 ? ` (falha em: ${data.errors.join("; ")})` : "";
      setMessage(summary + errorNote);
      router.refresh();
    } catch (err) {
      setMessage(err instanceof Error ? err.message : "Erro inesperado.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="flex flex-col sm:flex-row sm:items-center gap-2">
      <button
        onClick={handleClick}
        disabled={loading}
        className="rounded-md border border-neutral-300 dark:border-neutral-700 font-medium px-4 py-2 text-sm hover:bg-neutral-100 dark:hover:bg-neutral-800 transition-colors disabled:opacity-50 whitespace-nowrap"
      >
        {loading ? "Buscando..." : "Buscar novas vagas"}
      </button>
      {message && (
        <p className="text-sm text-neutral-600 dark:text-neutral-400">{message}</p>
      )}
    </div>
  );
}
