"use client";

import { useState } from "react";
import Link from "next/link";
import {
  ENTREPRENEURSHIP_GUIDE,
  ENTREPRENEURSHIP_GUIDE_BY_STAGE,
  type EntrepreneurshipStage,
} from "@/lib/entrepreneurship-tips";

export function EntrepreneurshipTips() {
  const [stage, setStage] = useState<EntrepreneurshipStage>("ideia");
  const content = ENTREPRENEURSHIP_GUIDE_BY_STAGE[stage];

  return (
    <main className="max-w-3xl mx-auto px-4 py-12 w-full">
      <Link href="/tools" className="text-sm text-blue-600 dark:text-blue-400 hover:underline">
        ← Voltar
      </Link>

      <header className="mt-4 mb-8">
        <p className="inline-flex items-center gap-1.5 text-[11px] font-semibold uppercase tracking-wide text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-100 dark:border-emerald-900/50 rounded-full px-3 py-1">
          Dicas de empreendedorismo
        </p>
        <h1 className="text-2xl md:text-3xl font-bold tracking-tight mt-3">
          Da ideia ao primeiro cliente, sem travar
        </h1>
        <p className="text-neutral-600 dark:text-neutral-400 mt-2">
          Um caminho prático por etapa, o que fazer agora, sem precisar saber tudo de negócios antes de começar.
        </p>
      </header>

      <div className="flex flex-wrap gap-2 mb-8">
        {ENTREPRENEURSHIP_GUIDE.map((s) => {
          const active = s.key === stage;
          return (
            <button
              key={s.key}
              type="button"
              onClick={() => setStage(s.key)}
              className={`rounded-full px-4 py-2 text-xs font-semibold border transition-all ${
                active
                  ? "border-emerald-600 bg-emerald-600 text-white shadow-sm shadow-emerald-500/25"
                  : "border-neutral-200 dark:border-neutral-800 text-neutral-600 dark:text-neutral-300 hover:border-neutral-300 dark:hover:border-neutral-700"
              }`}
            >
              {s.label}
            </button>
          );
        })}
      </div>

      <p className="text-neutral-600 dark:text-neutral-400 mb-8">{content.intro}</p>

      <div className="space-y-5">
        {content.tips.map((tip, i) => (
          <div
            key={tip.title}
            className="rounded-2xl border border-neutral-200 dark:border-neutral-800 bg-white/95 dark:bg-neutral-950/95 p-6 shadow-sm"
          >
            <div className="flex items-start gap-3">
              <span className="mt-0.5 h-7 w-7 shrink-0 rounded-full bg-emerald-50 dark:bg-emerald-950/30 text-emerald-600 dark:text-emerald-400 flex items-center justify-center text-xs font-bold">
                {i + 1}
              </span>
              <div className="min-w-0">
                <p className="font-semibold text-sm">{tip.title}</p>
                <p className="text-sm text-neutral-600 dark:text-neutral-400 mt-2 leading-relaxed">{tip.body}</p>
                <div className="mt-3 rounded-lg bg-blue-50 dark:bg-blue-950/30 border border-blue-100 dark:border-blue-900/50 px-3 py-2">
                  <p className="text-xs font-semibold uppercase tracking-wide text-blue-700 dark:text-blue-400">
                    Como aplicar
                  </p>
                  <p className="text-sm text-blue-800 dark:text-blue-300 mt-1">{tip.action}</p>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </main>
  );
}
