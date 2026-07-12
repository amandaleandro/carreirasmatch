"use client";

import { useState } from "react";
import Link from "next/link";
import { CAREER_GUIDE } from "@/lib/career-guide";

export function CareerGuide() {
  const [activeSlug, setActiveSlug] = useState(CAREER_GUIDE[0].slug);
  const area = CAREER_GUIDE.find((a) => a.slug === activeSlug) ?? CAREER_GUIDE[0];

  return (
    <main className="max-w-4xl mx-auto px-4 py-12 w-full">
      <Link href="/tools" className="text-sm text-blue-600 dark:text-blue-400 hover:underline">
        ← Voltar
      </Link>

      <header className="mt-4 mb-8">
        <p className="inline-flex items-center gap-1.5 text-[11px] font-semibold uppercase tracking-wide text-indigo-600 dark:text-indigo-400 bg-indigo-50 dark:bg-indigo-950/40 border border-indigo-100 dark:border-indigo-900/50 rounded-full px-3 py-1">
          Guia do estudante
        </p>
        <h1 className="text-2xl md:text-3xl font-bold tracking-tight mt-3">
          Como é a profissão na prática?
        </h1>
        <p className="text-neutral-600 dark:text-neutral-400 mt-2">
          Rotina real, faixa de salário e as habilidades técnicas e comportamentais que pesam em cada área — antes de você escolher.
        </p>
        <Link
          href="/tools/vocation-test"
          className="inline-block mt-3 text-sm text-blue-600 dark:text-blue-400 hover:underline"
        >
          Ainda não sabe sua área? Fazer o teste vocacional →
        </Link>
      </header>

      <div className="flex flex-wrap gap-2 mb-8">
        {CAREER_GUIDE.map((a) => {
          const active = a.slug === activeSlug;
          return (
            <button
              key={a.slug}
              type="button"
              onClick={() => setActiveSlug(a.slug)}
              className={`rounded-full px-4 py-2 text-xs font-semibold border transition-all ${
                active
                  ? "border-indigo-600 bg-indigo-600 text-white shadow-sm shadow-indigo-500/25"
                  : "border-neutral-200 dark:border-neutral-800 text-neutral-600 dark:text-neutral-300 hover:border-neutral-300 dark:hover:border-neutral-700"
              }`}
            >
              {a.label}
            </button>
          );
        })}
      </div>

      <div className="space-y-5">
        <section className="rounded-2xl border border-neutral-200/80 dark:border-neutral-800 bg-white dark:bg-neutral-950 p-6 shadow-sm shadow-slate-900/5">
          <p className="text-xs font-semibold uppercase tracking-wide text-neutral-400 mb-2">
            Dia a dia
          </p>
          <p className="text-sm text-neutral-700 dark:text-neutral-300 leading-relaxed">{area.dayToDay}</p>
        </section>

        <section className="rounded-2xl border border-neutral-200/80 dark:border-neutral-800 bg-white dark:bg-neutral-950 p-6 shadow-sm shadow-slate-900/5">
          <p className="text-xs font-semibold uppercase tracking-wide text-neutral-400 mb-2">
            Faixa de salário (referência de mercado)
          </p>
          <p className="text-sm font-semibold text-emerald-700 dark:text-emerald-400">{area.salaryRange}</p>
        </section>

        <div className="grid sm:grid-cols-2 gap-5">
          <section className="rounded-2xl border border-neutral-200/80 dark:border-neutral-800 bg-white dark:bg-neutral-950 p-6 shadow-sm shadow-slate-900/5">
            <p className="text-xs font-semibold uppercase tracking-wide text-blue-600 dark:text-blue-400 mb-3">
              Habilidades técnicas
            </p>
            <ul className="space-y-2">
              {area.technicalSkills.map((skill) => (
                <li key={skill} className="flex items-start gap-2 text-sm text-neutral-700 dark:text-neutral-300">
                  <span className="mt-0.5 h-4 w-4 shrink-0 rounded-full bg-blue-50 dark:bg-blue-950/30 text-blue-600 dark:text-blue-400 flex items-center justify-center text-[10px] font-bold">
                    ✓
                  </span>
                  {skill}
                </li>
              ))}
            </ul>
          </section>

          <section className="rounded-2xl border border-neutral-200/80 dark:border-neutral-800 bg-white dark:bg-neutral-950 p-6 shadow-sm shadow-slate-900/5">
            <p className="text-xs font-semibold uppercase tracking-wide text-violet-600 dark:text-violet-400 mb-3">
              Habilidades não técnicas
            </p>
            <ul className="space-y-2">
              {area.softSkills.map((skill) => (
                <li key={skill} className="flex items-start gap-2 text-sm text-neutral-700 dark:text-neutral-300">
                  <span className="mt-0.5 h-4 w-4 shrink-0 rounded-full bg-violet-50 dark:bg-violet-950/30 text-violet-600 dark:text-violet-400 flex items-center justify-center text-[10px] font-bold">
                    ✓
                  </span>
                  {skill}
                </li>
              ))}
            </ul>
          </section>
        </div>

        <section className="rounded-2xl border border-neutral-200/80 dark:border-neutral-800 bg-white dark:bg-neutral-950 p-6 shadow-sm shadow-slate-900/5">
          <p className="text-xs font-semibold uppercase tracking-wide text-amber-600 dark:text-amber-400 mb-3">
            Curiosidades
          </p>
          <ul className="space-y-2">
            {area.curiosities.map((c) => (
              <li key={c} className="flex items-start gap-2 text-sm text-neutral-700 dark:text-neutral-300">
                <span className="mt-0.5 h-4 w-4 shrink-0 rounded-full bg-amber-50 dark:bg-amber-950/30 text-amber-600 dark:text-amber-400 flex items-center justify-center text-[10px] font-bold">
                  !
                </span>
                {c}
              </li>
            ))}
          </ul>
        </section>
      </div>
    </main>
  );
}
