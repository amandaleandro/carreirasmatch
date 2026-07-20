"use client";

import Link from "next/link";
import { useState } from "react";
import { useRouter } from "next/navigation";

export function VagaActions({
  vagaId,
  status,
  publishedToFeed,
}: {
  vagaId: string;
  status: string;
  publishedToFeed: boolean;
}) {
  const router = useRouter();
  const [busy, setBusy] = useState(false);
  const isOpen = status !== "closed";

  async function patch(payload: Record<string, unknown>) {
    setBusy(true);
    try {
      const res = await fetch(`/api/empresa/vagas/${vagaId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      if (!res.ok) throw new Error();
      router.refresh();
    } catch {
      setBusy(false);
    }
  }

  async function toggleStatus() {
    await patch({ status: isOpen ? "closed" : "open" });
  }

  async function toggleFeed() {
    await patch({ publishedToFeed: !publishedToFeed });
  }

  async function duplicate() {
    setBusy(true);
    try {
      const res = await fetch(`/api/empresa/vagas/${vagaId}/duplicar`, { method: "POST" });
      const data = await res.json();
      if (!res.ok) throw new Error();
      router.push(`/empresa/vagas/${data.id}`);
      router.refresh();
    } catch {
      setBusy(false);
    }
  }

  async function remove() {
    if (!window.confirm("Excluir esta vaga? Essa ação não pode ser desfeita.")) return;
    setBusy(true);
    try {
      const res = await fetch(`/api/empresa/vagas/${vagaId}`, { method: "DELETE" });
      if (!res.ok) throw new Error();
      router.push("/empresa/vagas");
      router.refresh();
    } catch {
      setBusy(false);
    }
  }

  return (
    <div className="flex items-center gap-2 flex-wrap">
      <Link
        href={`/empresa/vagas/${vagaId}/editar`}
        className="rounded-lg border border-neutral-200 dark:border-neutral-800 px-3 py-1.5 text-sm font-medium hover:bg-neutral-50 dark:hover:bg-neutral-900 transition-colors"
      >
        Editar
      </Link>
      <button
        type="button"
        onClick={toggleFeed}
        disabled={busy || (!publishedToFeed && !isOpen)}
        title={!publishedToFeed && !isOpen ? "Reabra a vaga para publicar" : undefined}
        className={`rounded-lg px-3 py-1.5 text-sm font-medium transition-colors disabled:opacity-50 ${
          publishedToFeed
            ? "border border-neutral-200 dark:border-neutral-800 hover:bg-neutral-50 dark:hover:bg-neutral-900"
            : "bg-blue-600 text-white hover:bg-blue-700"
        }`}
      >
        {publishedToFeed ? "Tirar do feed" : "Publicar no feed"}
      </button>
      <button
        type="button"
        onClick={toggleStatus}
        disabled={busy}
        className="rounded-lg border border-neutral-200 dark:border-neutral-800 px-3 py-1.5 text-sm font-medium hover:bg-neutral-50 dark:hover:bg-neutral-900 transition-colors disabled:opacity-50"
      >
        {isOpen ? "Fechar vaga" : "Reabrir vaga"}
      </button>
      <button
        type="button"
        onClick={duplicate}
        disabled={busy}
        className="rounded-lg border border-neutral-200 dark:border-neutral-800 px-3 py-1.5 text-sm font-medium hover:bg-neutral-50 dark:hover:bg-neutral-900 transition-colors disabled:opacity-50"
      >
        Duplicar
      </button>
      <button
        type="button"
        onClick={remove}
        disabled={busy}
        className="rounded-lg border border-red-200 dark:border-red-900 px-3 py-1.5 text-sm font-medium text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-950/40 transition-colors disabled:opacity-50"
      >
        Excluir
      </button>
    </div>
  );
}
