"use client";

import { useState } from "react";
import { BadgeCheck, Copy, Check } from "lucide-react";

/**
 * Bloco no relatório que entrega o selo público verificável: link /selo/[id]
 * + texto pronto para colar no LinkedIn. O selo é público por escolha do
 * usuário (só existe acesso a quem receber o link).
 */
export function VerifiedBadgeBox({ analysisId, overallScore }: { analysisId: string; overallScore: number }) {
  const [copied, setCopied] = useState<"link" | "text" | null>(null);

  const origin = typeof window !== "undefined" ? window.location.origin : "https://carreirasmatch.com.br";
  const badgeUrl = `${origin}/selo/${analysisId}`;
  const linkedInText = `Passei meu currículo pela análise de aderência do CarreirasMatch e tirei nota ${overallScore}/100 ✓\n\nA análise compara o currículo com a vaga real: palavras-chave, compatibilidade com ATS e pontos de melhoria.\n\nSelo verificado: ${badgeUrl}`;

  async function copy(value: string, which: "link" | "text") {
    try {
      await navigator.clipboard.writeText(value);
      setCopied(which);
      setTimeout(() => setCopied(null), 2500);
    } catch {
      window.prompt("Copie:", value);
    }
  }

  return (
    <div className="rounded-3xl border border-[#22C55E]/25 bg-[#22C55E]/5 dark:bg-[#22C55E]/10 p-5 space-y-3">
      <div className="flex items-center gap-2">
        <BadgeCheck className="h-5 w-5 text-[#22C55E]" />
        <h3 className="font-title font-bold text-sm text-[#071827] dark:text-white">
          Seu selo de currículo verificado
        </h3>
      </div>
      <p className="text-xs text-[#64748B] leading-relaxed">
        Página pública com sua nota, pronta para colocar no LinkedIn ou enviar a recrutadores.
        Mostra só seu primeiro nome e a nota, a vaga e o currículo continuam privados.
      </p>
      <div className="flex flex-wrap gap-2">
        <button
          type="button"
          onClick={() => copy(badgeUrl, "link")}
          className="inline-flex items-center gap-1.5 rounded-xl border border-[#22C55E]/30 bg-white dark:bg-neutral-900 px-3.5 py-2 text-xs font-semibold text-[#071827] dark:text-white hover:border-[#22C55E] transition-colors"
        >
          {copied === "link" ? <Check className="h-3.5 w-3.5 text-[#22C55E]" /> : <Copy className="h-3.5 w-3.5" />}
          {copied === "link" ? "Link copiado!" : "Copiar link do selo"}
        </button>
        <button
          type="button"
          onClick={() => copy(linkedInText, "text")}
          className="inline-flex items-center gap-1.5 rounded-xl bg-[#22C55E] px-3.5 py-2 text-xs font-semibold text-white hover:bg-[#16A34A] transition-colors"
        >
          {copied === "text" ? <Check className="h-3.5 w-3.5" /> : <Copy className="h-3.5 w-3.5" />}
          {copied === "text" ? "Texto copiado!" : "Copiar post para LinkedIn"}
        </button>
        <a
          href={badgeUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center rounded-xl px-3.5 py-2 text-xs font-semibold text-[#2563EB] hover:underline"
        >
          Ver selo →
        </a>
      </div>
    </div>
  );
}
