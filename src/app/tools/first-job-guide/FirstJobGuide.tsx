"use client";

import { useState } from "react";
import Link from "next/link";
import { FIRST_JOB_GUIDE, FIRST_JOB_GUIDE_BY_PATH, type FirstJobPath } from "@/lib/first-job-tips";

export function FirstJobGuide() {
  const [path, setPath] = useState<FirstJobPath>("sem_formacao");
  const content = FIRST_JOB_GUIDE_BY_PATH[path];

  return (
    <main className="max-w-3xl mx-auto px-4 py-12 w-full">
      <Link href="/tools" className="text-sm text-blue-600 dark:text-blue-400 hover:underline">
        ← Voltar
      </Link>

      <header className="mt-4 mb-8">
        <p className="inline-flex items-center gap-1.5 text-[11px] font-semibold uppercase tracking-wide text-amber-600 dark:text-amber-400 bg-amber-50 dark:bg-amber-950/40 border border-amber-100 dark:border-amber-900/50 rounded-full px-3 py-1">
          Recurso do Plano Profissional
        </p>
        <h1 className="text-2xl md:text-3xl font-bold tracking-tight mt-3">
          Guia completo de primeiro emprego
        </h1>
        <p className="text-neutral-600 dark:text-neutral-400 mt-2">
          Dicas aprofundadas, com o que fazer na prática em cada etapa da sua busca.
        </p>
      </header>

      <div className="flex flex-wrap gap-2 mb-8">
        {FIRST_JOB_GUIDE.map((p) => {
          const active = p.key === path;
          return (
            <button
              key={p.key}
              type="button"
              onClick={() => setPath(p.key)}
              className={`rounded-full px-4 py-2 text-xs font-semibold border transition-all ${
                active
                  ? "border-blue-600 bg-blue-600 text-white shadow-sm shadow-blue-500/25"
                  : "border-neutral-200 dark:border-neutral-800 text-neutral-600 dark:text-neutral-300 hover:border-neutral-300 dark:hover:border-neutral-700"
              }`}
            >
              {p.label}
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
              <span className="mt-0.5 h-7 w-7 shrink-0 rounded-full bg-blue-50 dark:bg-blue-950/30 text-blue-600 dark:text-blue-400 flex items-center justify-center text-xs font-bold">
                {i + 1}
              </span>
              <div className="min-w-0">
                <p className="font-semibold text-sm">{tip.title}</p>
                <p className="text-sm text-neutral-600 dark:text-neutral-400 mt-2 leading-relaxed">{tip.body}</p>
                <div className="mt-3 rounded-lg bg-emerald-50 dark:bg-emerald-950/30 border border-emerald-100 dark:border-emerald-900/50 px-3 py-2">
                  <p className="text-xs font-semibold uppercase tracking-wide text-emerald-700 dark:text-emerald-400">
                    Como aplicar
                  </p>
                  <p className="text-sm text-emerald-800 dark:text-emerald-300 mt-1">{tip.action}</p>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </main>
  );
}
