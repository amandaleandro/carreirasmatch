"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";

function TrashIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" className={className} stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M3 6h18" />
      <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" />
      <line x1="10" x2="10" y1="11" y2="17" />
      <line x1="14" x2="14" y1="11" y2="17" />
    </svg>
  );
}

export function DeleteAnalysisButton({ analysisId, jobTitle }: { analysisId: string; jobTitle: string }) {
  const router = useRouter();
  const [confirming, setConfirming] = useState(false);
  const [isPending, startTransition] = useTransition();

  async function handleDelete() {
    startTransition(async () => {
      const res = await fetch(`/api/analysis/${analysisId}`, { method: "DELETE" });
      if (res.ok) {
        router.refresh();
      } else {
        setConfirming(false);
      }
    });
  }

  if (confirming) {
    return (
      <div className="flex items-center gap-2 text-xs">
        <span className="text-neutral-500">Remover vaga?</span>
        <button
          onClick={handleDelete}
          disabled={isPending}
          className="font-semibold text-red-600 dark:text-red-400 hover:underline disabled:opacity-50"
        >
          {isPending ? "Removendo..." : "Sim"}
        </button>
        <button
          onClick={() => setConfirming(false)}
          disabled={isPending}
          className="text-neutral-500 hover:underline disabled:opacity-50"
        >
          Não
        </button>
      </div>
    );
  }

  return (
    <button
      onClick={() => setConfirming(true)}
      title={`Remover análise de "${jobTitle}"`}
      aria-label={`Remover análise de ${jobTitle}`}
      className="text-neutral-400 hover:text-red-600 dark:hover:text-red-400 transition-colors"
    >
      <TrashIcon className="h-4 w-4" />
    </button>
  );
}
