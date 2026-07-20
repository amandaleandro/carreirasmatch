"use client";

import { useState } from "react";
import { Share2, Check, Copy } from "lucide-react";

export function ShareJobCard() {
  const [copied, setCopied] = useState(false);
  
  // URL da página pública de vagas
  const shareUrl = typeof window !== "undefined" 
    ? `${window.location.origin}/todas-as-vagas` 
    : "https://carreirasmatch.com.br/todas-as-vagas";

  async function handleCopy() {
    try {
      await navigator.clipboard.writeText(shareUrl);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // Fallback silencioso
    }
  }

  return (
    <div className="mt-12 card-premium p-6 text-center max-w-2xl mx-auto">
      <div className="inline-flex h-12 w-12 items-center justify-center rounded-full bg-blue-50 dark:bg-blue-950/30 text-blue-600 dark:text-blue-400 mb-4">
        <Share2 className="h-5 w-5" />
      </div>
      <h3 className="text-lg font-bold">Gostou das vagas? Indique a um amigo!</h3>
      <p className="text-sm text-neutral-600 dark:text-neutral-400 mt-2">
        Compartilhe a nossa lista de todas as vagas com seus contatos e ajude outras pessoas a compararem seus currículos!
      </p>
      
      <div className="mt-5 flex flex-col sm:flex-row items-center gap-2">
        <input
          type="text"
          readOnly
          value={shareUrl}
          className="w-full flex-1 rounded-xl border border-neutral-200 dark:border-neutral-800 bg-neutral-50 dark:bg-neutral-900 px-3 py-2 text-sm outline-none text-neutral-600 dark:text-neutral-400"
        />
        <button
          onClick={handleCopy}
          className="w-full sm:w-auto shrink-0 inline-flex items-center justify-center gap-2 rounded-xl bg-blue-600 px-5 py-2 text-sm font-semibold text-white transition-colors hover:bg-blue-700 cursor-pointer"
        >
          {copied ? (
            <>
              <Check className="h-4 w-4" />
              Copiado!
            </>
          ) : (
            <>
              <Copy className="h-4 w-4" />
              Copiar Link
            </>
          )}
        </button>
      </div>
    </div>
  );
}
