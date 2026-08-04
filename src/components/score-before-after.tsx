"use client";

import { ArrowRight, CheckCircle2 } from "lucide-react";

interface ScoreBeforeAfterProps {
  currentSummary?: string;
  suggestedSummary: string;
  optimizedScore: number;
  requirementsStrengthened?: number;
}

export function ScoreBeforeAfter({
  currentSummary,
  suggestedSummary,
  optimizedScore,
  requirementsStrengthened = 0,
}: ScoreBeforeAfterProps) {
  return (
    <div className="space-y-6 rounded-2xl border border-blue-500/20 bg-slate-950 p-6 text-white md:p-8">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <p className="text-xs font-bold uppercase tracking-wider text-blue-300">Antes e depois</p>
          <p className="mt-1 text-sm font-semibold text-white">Veja o que a vaga muda na comunicação do seu currículo.</p>
        </div>
        <span className="rounded-full bg-emerald-500/15 px-3 py-1 text-xs font-bold text-emerald-300">Match analisado: {optimizedScore}%</span>
      </div>

      <div className="grid grid-cols-1 gap-4 md:grid-cols-[1fr_auto_1fr] md:items-stretch">
        <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
          <span className="text-xs font-semibold uppercase tracking-wider text-slate-400">Resumo atual</span>
          <p className="mt-3 text-sm leading-relaxed text-slate-300">{currentSummary || "Nenhum resumo profissional encontrado no currículo."}</p>
        </div>
        <div className="flex items-center justify-center text-blue-300"><ArrowRight className="h-5 w-5 rotate-90 md:rotate-0" /></div>
        <div className="rounded-2xl border border-emerald-400/40 bg-emerald-600/15 p-4">
          <span className="text-xs font-bold uppercase tracking-wider text-emerald-300">Sugestão para esta vaga</span>
          <p className="mt-3 text-sm leading-relaxed text-emerald-50">{suggestedSummary}</p>
        </div>
      </div>

      <div className="flex flex-wrap items-center justify-between gap-2 border-t border-white/10 pt-2 text-xs text-slate-300">
        <span className="flex items-center gap-1.5"><CheckCircle2 className="h-4 w-4 text-emerald-400" />{requirementsStrengthened > 0 ? `${requirementsStrengthened} requisito(s) fortalecidos na sugestão` : "Sugestão baseada nos requisitos identificados"}</span>
        <span className="text-[11px] text-slate-400">Revise e aprove as alterações antes de exportar.</span>
      </div>
    </div>
  );
}
