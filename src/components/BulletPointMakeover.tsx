"use client";

import { Sparkles, ArrowRight, CheckCircle, AlertTriangle, XCircle } from "lucide-react";

export interface MakeoverItem {
  role: string;
  company: string;
  step1DutyChecklist: string; // Duty checklist (Weak)
  step2AddingTools: string;    // Adding tools (Better)
  step3RecruiterGrade: string; // Recruiter-grade (Winner)
  whyItWins: string;
}

interface BulletPointMakeoverProps {
  makeovers?: MakeoverItem[];
}

export function BulletPointMakeover({ makeovers = [] }: BulletPointMakeoverProps) {
  if (!makeovers || makeovers.length === 0) return null;

  return (
    <div className="rounded-3xl border border-neutral-200 dark:border-neutral-800 bg-white dark:bg-neutral-900/40 p-5 md:p-6 shadow-[0_8px_30px_rgb(0,0,0,0.02)] space-y-6">
      <div className="flex items-center gap-3">
        <div className="p-2.5 rounded-2xl bg-purple-500/10 text-purple-600 dark:text-purple-400">
          <Sparkles className="w-5 h-5" />
        </div>
        <div>
          <h3 className="text-base font-semibold text-neutral-900 dark:text-white">
            Evolução de Descrição (3-Step Bullet Point Makeover)
          </h3>
          <p className="text-xs text-neutral-500 dark:text-neutral-400">
            Como transformar frases passivas de tarefas em descrições de alto impacto para o recrutador
          </p>
        </div>
      </div>

      <div className="space-y-6">
        {makeovers.map((item, idx) => (
          <div
            key={idx}
            className="p-5 rounded-2xl bg-neutral-50/60 dark:bg-neutral-950/40 border border-neutral-200/80 dark:border-neutral-800 space-y-4"
          >
            <div className="flex items-center justify-between border-b border-neutral-200/60 dark:border-neutral-800 pb-3">
              <span className="text-xs font-semibold text-neutral-900 dark:text-white">
                {item.role} — <span className="text-neutral-500">{item.company}</span>
              </span>
              <span className="text-[10px] font-mono tracking-wider uppercase px-2.5 py-1 rounded-full bg-purple-500/10 text-purple-600 dark:text-purple-400 border border-purple-500/20">
                Transformação de Impacto #{idx + 1}
              </span>
            </div>

            {/* 3 Step Grid */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3 text-xs">
              {/* Step 1 */}
              <div className="p-3.5 rounded-xl bg-red-50/50 dark:bg-red-950/20 border border-red-200/50 dark:border-red-900/30 space-y-2 flex flex-col justify-between">
                <div>
                  <div className="flex items-center gap-1.5 font-semibold text-red-700 dark:text-red-400 mb-1">
                    <XCircle className="w-4 h-4 text-red-500 shrink-0" />
                    Passo 1: Lista de Tarefas (Fraco)
                  </div>
                  <p className="text-neutral-700 dark:text-neutral-300 italic font-mono text-[11px] leading-relaxed">
                    &quot;{item.step1DutyChecklist}&quot;
                  </p>
                </div>
                <div className="text-[10px] text-red-600 dark:text-red-400 font-medium pt-2 border-t border-red-200/40 dark:border-red-900/30">
                  Por que falha: Parece apenas uma lista genérica de funções.
                </div>
              </div>

              {/* Step 2 */}
              <div className="p-3.5 rounded-xl bg-amber-50/50 dark:bg-amber-950/20 border border-amber-200/50 dark:border-amber-900/30 space-y-2 flex flex-col justify-between">
                <div>
                  <div className="flex items-center gap-1.5 font-semibold text-amber-700 dark:text-amber-400 mb-1">
                    <AlertTriangle className="w-4 h-4 text-amber-500 shrink-0" />
                    Passo 2: Cita Ferramenta (Melhor)
                  </div>
                  <p className="text-neutral-700 dark:text-neutral-300 italic font-mono text-[11px] leading-relaxed">
                    &quot;{item.step2AddingTools}&quot;
                  </p>
                </div>
                <div className="text-[10px] text-amber-600 dark:text-amber-400 font-medium pt-2 border-t border-amber-200/40 dark:border-amber-900/30">
                  Por que melhora: Nomeia ferramentas, mas ainda falta o resultado real.
                </div>
              </div>

              {/* Step 3 */}
              <div className="p-3.5 rounded-xl bg-emerald-50/60 dark:bg-emerald-950/30 border border-emerald-300/60 dark:border-emerald-800/50 space-y-2 flex flex-col justify-between shadow-sm">
                <div>
                  <div className="flex items-center gap-1.5 font-semibold text-emerald-700 dark:text-emerald-400 mb-1">
                    <CheckCircle className="w-4 h-4 text-emerald-500 shrink-0" />
                    Passo 3: Nível Recrutador (Campeão)
                  </div>
                  <p className="text-neutral-900 dark:text-white font-semibold font-mono text-[11px] leading-relaxed">
                    &quot;{item.step3RecruiterGrade}&quot;
                  </p>
                </div>
                <div className="text-[10px] text-emerald-700 dark:text-emerald-300 font-medium pt-2 border-t border-emerald-200/60 dark:border-emerald-800/50">
                  Por que vence: Ação clara + Ferramenta + Métrica de resultado.
                </div>
              </div>
            </div>

            {item.whyItWins && (
              <div className="p-3 rounded-xl bg-purple-500/5 border border-purple-500/10 text-xs text-purple-900 dark:text-purple-200 flex items-center gap-2">
                <ArrowRight className="w-4 h-4 text-purple-500 shrink-0" />
                <span>
                  <strong className="font-semibold">Veredito do Recrutador:</strong> {item.whyItWins}
                </span>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
