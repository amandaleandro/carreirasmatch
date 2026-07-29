"use client";

import { TrendingUp, CheckCircle2, ShieldCheck, Sparkles } from "lucide-react";

interface ScoreBeforeAfterProps {
  initialScore: number;
  optimizedScore: number;
  requirementsMetCount?: number;
}

export function ScoreBeforeAfter({
  initialScore,
  optimizedScore,
  requirementsMetCount = 5,
}: ScoreBeforeAfterProps) {
  const diff = Math.max(0, optimizedScore - initialScore);

  return (
    <div className="rounded-2xl border border-blue-500/20 bg-slate-950 p-6 md:p-8 text-white space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <span className="inline-flex items-center gap-1.5 text-xs font-semibold text-blue-200 bg-blue-500/20 px-3 py-1 rounded-full border border-blue-400/30">
          <ShieldCheck className="w-4 h-4 text-blue-400" />
          Sem alucinação de dados (100% fiel à sua história)
        </span>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 items-center justify-between gap-6 py-2">
        {/* Antes */}
        <div className="rounded-2xl bg-white/5 border border-white/10 p-4 text-center space-y-1">
          <span className="text-xs font-semibold uppercase tracking-wider text-slate-400">
            Score Atual
          </span>
          <div className="text-4xl font-extrabold text-slate-300">{initialScore}%</div>
          <p className="text-[11px] text-slate-400">Antes dos ajustes</p>
        </div>

        {/* Ganho */}
        <div className="flex flex-col items-center justify-center text-center space-y-1">
          <div className="inline-flex items-center gap-1 text-2xl font-bold text-emerald-400 bg-emerald-500/10 px-4 py-1.5 rounded-2xl border border-emerald-500/30">
            +{diff}%
          </div>
          <span className="text-xs font-medium text-slate-300">
            +{requirementsMetCount} requisitos fortalecidos
          </span>
        </div>

        {/* Depois */}
        <div className="rounded-2xl bg-emerald-600/15 border border-emerald-400/40 p-4 text-center space-y-1">
          <span className="text-xs font-bold uppercase tracking-wider text-emerald-300">
            Match Otimizado
          </span>
          <div className="text-4xl font-bold text-emerald-300">{optimizedScore}%</div>
          <p className="text-[11px] text-emerald-200/80 font-medium">Após aplicar o Kit</p>
        </div>
      </div>

      <div className="pt-2 border-t border-white/10 flex flex-wrap items-center justify-between text-xs text-slate-300 gap-2">
        <span className="flex items-center gap-1.5">
          <CheckCircle2 className="w-4 h-4 text-emerald-400" />
          Formatado para leitura perfeita em leitores automáticos (ATS)
        </span>
        <span className="text-slate-400 text-[11px]">
          Baseado na análise da vaga
        </span>
      </div>
    </div>
  );
}
