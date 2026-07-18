"use client";

import { useState } from "react";

/** Mostra o link de indicação completo (origem + /register?cupom=CODE) e copia com um clique. */
export function InfluencerReferralLink({ code }: { code: string }) {
  const [copied, setCopied] = useState(false);
  const path = `/register?cupom=${encodeURIComponent(code)}`;
  const fullUrl = typeof window !== "undefined" ? `${window.location.origin}${path}` : path;

  async function copy() {
    try {
      await navigator.clipboard.writeText(fullUrl);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // Sem clipboard (contexto inseguro): o usuário ainda pode selecionar o texto.
    }
  }

  return (
    <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
      <code className="flex-1 truncate rounded-md border border-neutral-200 bg-neutral-50 px-3 py-2 text-sm dark:border-neutral-800 dark:bg-neutral-900">
        {fullUrl}
      </code>
      <button
        type="button"
        onClick={copy}
        className="shrink-0 rounded-md bg-blue-600 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-blue-700"
      >
        {copied ? "Copiado!" : "Copiar link"}
      </button>
    </div>
  );
}
