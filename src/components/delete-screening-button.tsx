"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export function DeleteScreeningButton({ jobId }: { jobId: string }) {
  const router = useRouter();
  const [busy, setBusy] = useState(false);

  async function remove() {
    if (!window.confirm("Excluir esta triagem e todos os currículos analisados? Essa ação não pode ser desfeita."))
      return;
    setBusy(true);
    try {
      const res = await fetch(`/api/empresa/triagem/${jobId}`, { method: "DELETE" });
      if (!res.ok) throw new Error();
      router.push("/empresa");
      router.refresh();
    } catch {
      setBusy(false);
    }
  }

  return (
    <button
      type="button"
      onClick={remove}
      disabled={busy}
      className="rounded-lg border border-red-200 dark:border-red-900 px-3 py-1.5 text-sm font-medium text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-950/40 transition-colors disabled:opacity-50"
    >
      Excluir triagem
    </button>
  );
}
