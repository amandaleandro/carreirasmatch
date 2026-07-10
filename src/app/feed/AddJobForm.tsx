"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export function AddJobForm() {
  const router = useRouter();
  const [url, setUrl] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);

    if (!url.trim()) {
      setError("Informe o link da vaga.");
      return;
    }

    setLoading(true);
    try {
      const res = await fetch("/api/feed/add-job", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ url: url.trim() }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "Erro ao adicionar a vaga.");

      setUrl("");
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Erro inesperado.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-3">
      <div className="flex flex-col sm:flex-row gap-3">
        <input
          type="url"
          value={url}
          onChange={(e) => setUrl(e.target.value)}
          placeholder="Cole o link da vaga (ex: https://...)"
          className="w-full rounded-md border border-neutral-300 dark:border-neutral-700 bg-transparent px-3 py-2 text-sm"
        />
        <button
          type="submit"
          disabled={loading}
          className="rounded-md bg-blue-600 text-white font-medium px-5 py-2.5 hover:bg-blue-700 transition-colors disabled:opacity-50 whitespace-nowrap"
        >
          {loading ? "Adicionando..." : "Adicionar ao feed"}
        </button>
      </div>
      {error && <p className="text-sm text-red-600 dark:text-red-400">{error}</p>}
    </form>
  );
}
