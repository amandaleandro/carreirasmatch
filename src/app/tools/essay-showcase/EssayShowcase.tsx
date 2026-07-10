"use client";

import { useState } from "react";
import Link from "next/link";
import { ESSAY_SHOWCASE } from "@/lib/essay-showcase";

export function EssayShowcase() {
  const [activeSlug, setActiveSlug] = useState(ESSAY_SHOWCASE[0].slug);
  const essay = ESSAY_SHOWCASE.find((e) => e.slug === activeSlug) ?? ESSAY_SHOWCASE[0];
  const total = essay.competencies.reduce((sum, c) => sum + c.score, 0);

  return (
    <main className="max-w-3xl mx-auto px-4 py-12 w-full">
      <Link href="/tools" className="text-sm text-blue-600 dark:text-blue-400 hover:underline">
        ← Voltar
      </Link>

      <header className="mt-4 mb-8">
        <p className="inline-flex items-center gap-1.5 text-[11px] font-semibold uppercase tracking-wide text-rose-600 dark:text-rose-400 bg-rose-50 dark:bg-rose-950/40 border border-rose-100 dark:border-rose-900/50 rounded-full px-3 py-1">
          Mostra de redações nota 1000
        </p>
        <h1 className="text-2xl md:text-3xl font-bold tracking-tight mt-3">
          Veja o texto, não só a técnica
        </h1>
        <p className="text-neutral-600 dark:text-neutral-400 mt-2">
          Redações modelo, competência por competência, com o porquê da nota em cada uma.
        </p>
        <Link
          href="/tools/essay-grader"
          className="inline-block mt-3 text-sm text-blue-600 dark:text-blue-400 hover:underline"
        >
          Corrigir a sua redação agora →
        </Link>
      </header>

      <div className="flex flex-wrap gap-2 mb-8">
        {ESSAY_SHOWCASE.map((e) => {
          const active = e.slug === activeSlug;
          return (
            <button
              key={e.slug}
              type="button"
              onClick={() => setActiveSlug(e.slug)}
              className={`rounded-full px-4 py-2 text-xs font-semibold border transition-all ${
                active
                  ? "border-rose-600 bg-rose-600 text-white shadow-sm shadow-rose-500/25"
                  : "border-neutral-200 dark:border-neutral-800 text-neutral-600 dark:text-neutral-300 hover:border-neutral-300 dark:hover:border-neutral-700"
              }`}
            >
              {e.theme.length > 34 ? `${e.theme.slice(0, 34)}…` : e.theme}
            </button>
          );
        })}
      </div>

      <div className="rounded-2xl border border-neutral-200 dark:border-neutral-800 bg-white/95 dark:bg-neutral-950/95 p-6 shadow-sm mb-6">
        <p className="text-xs text-neutral-400">{essay.year}</p>
        <h2 className="font-bold text-lg mt-1">{essay.theme}</h2>
        <div className="mt-4 flex items-center gap-3">
          <span className="text-2xl font-extrabold text-rose-600 dark:text-rose-400">{total}</span>
          <span className="text-sm text-neutral-500">de 1000 pontos</span>
        </div>
      </div>

      <div className="rounded-2xl border border-neutral-200 dark:border-neutral-800 bg-white/95 dark:bg-neutral-950/95 p-6 shadow-sm mb-6 space-y-4">
        <p className="text-xs font-semibold uppercase tracking-wide text-neutral-400">Texto</p>
        {essay.paragraphs.map((p, i) => (
          <p key={i} className="text-sm text-neutral-700 dark:text-neutral-300 leading-relaxed">
            {p}
          </p>
        ))}
      </div>

      <div className="space-y-3 mb-6">
        <p className="text-xs font-semibold uppercase tracking-wide text-neutral-400">
          Nota por competência
        </p>
        {essay.competencies.map((c) => (
          <div
            key={c.competency}
            className="rounded-2xl border border-neutral-200 dark:border-neutral-800 bg-white/95 dark:bg-neutral-950/95 p-5 shadow-sm"
          >
            <div className="flex items-center justify-between gap-2 mb-1.5">
              <p className="font-semibold text-sm">{c.competency}</p>
              <span className="text-sm font-bold shrink-0 text-rose-600 dark:text-rose-400">{c.score}/200</span>
            </div>
            <p className="text-sm text-neutral-600 dark:text-neutral-400 leading-relaxed">{c.whyItScored}</p>
          </div>
        ))}
      </div>

      <div className="rounded-2xl border border-emerald-100 dark:border-emerald-900/50 bg-emerald-50/60 dark:bg-emerald-950/20 p-6">
        <p className="text-xs font-semibold uppercase tracking-wide text-emerald-700 dark:text-emerald-400 mb-3">
          Técnicas para copiar no seu texto
        </p>
        <ul className="space-y-2">
          {essay.keyTechniques.map((t) => (
            <li key={t} className="flex items-start gap-2 text-sm text-emerald-900 dark:text-emerald-200">
              <span className="mt-0.5 h-4 w-4 shrink-0 rounded-full bg-emerald-100 dark:bg-emerald-900/50 text-emerald-700 dark:text-emerald-400 flex items-center justify-center text-[10px] font-bold">
                ✓
              </span>
              {t}
            </li>
          ))}
        </ul>
      </div>
    </main>
  );
}
