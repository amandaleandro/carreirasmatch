"use client";

import Link from "next/link";
import { useState } from "react";
import { useRouter } from "next/navigation";

export function VagaActions({ vagaId, status }: { vagaId: string; status: string }) {
  const router = useRouter();
  const [busy, setBusy] = useState(false);
  const isOpen = status !== "closed";

  async function toggleStatus() {
    setBusy(true);
    try {
      const res = await fetch(`/api/empresa/vagas/${vagaId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: isOpen ? "closed" : "open" }),
      });
      if (!res.ok) throw new Error();
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
        onClick={toggleStatus}
        disabled={busy}
        className="rounded-lg border border-neutral-200 dark:border-neutral-800 px-3 py-1.5 text-sm font-medium hover:bg-neutral-50 dark:hover:bg-neutral-900 transition-colors disabled:opacity-50"
      >
        {isOpen ? "Fechar vaga" : "Reabrir vaga"}
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
