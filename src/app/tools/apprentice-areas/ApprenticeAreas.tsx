"use client";

import { useState } from "react";
import Link from "next/link";
import { APPRENTICE_AREAS } from "@/lib/apprentice-areas";

export function ApprenticeAreas() {
  const [openKey, setOpenKey] = useState<string | null>(APPRENTICE_AREAS[0]?.key ?? null);

  return (
    <main className="max-w-3xl mx-auto px-4 py-12 w-full">
      <Link href="/tools" className="text-sm text-blue-600 dark:text-blue-400 hover:underline">
        ← Voltar
      </Link>

      <header className="mt-4 mb-8">
        <p className="inline-flex items-center gap-1.5 text-[11px] font-semibold uppercase tracking-wide text-cyan-600 dark:text-cyan-400 bg-cyan-50 dark:bg-cyan-950/40 border border-cyan-100 dark:border-cyan-900/50 rounded-full px-3 py-1">
          Recurso do Plano Profissional
        </p>
        <h1 className="text-2xl md:text-3xl font-bold tracking-tight mt-3">
          Áreas de atuação e cursos recomendados
        </h1>
        <p className="text-neutral-600 dark:text-neutral-400 mt-2">
          Onde um jovem aprendiz costuma atuar e cursos gratuitos para se preparar em cada área.
        </p>
      </header>

      <div className="space-y-3">
        {APPRENTICE_AREAS.map((area) => {
          const open = openKey === area.key;
          return (
            <div
              key={area.key}
              className="rounded-2xl border border-neutral-200 dark:border-neutral-800 bg-white/95 dark:bg-neutral-950/95 shadow-sm overflow-hidden"
            >
              <button
                type="button"
                onClick={() => setOpenKey(open ? null : area.key)}
                className="w-full flex items-center justify-between gap-4 p-5 text-left"
              >
                <div>
                  <p className="font-semibold text-sm">{area.label}</p>
                  <p className="text-xs text-neutral-500 dark:text-neutral-400 mt-1.5 leading-relaxed">
                    {area.description}
                  </p>
                </div>
                <span
                  className={`shrink-0 h-6 w-6 rounded-full border border-neutral-200 dark:border-neutral-700 flex items-center justify-center text-xs transition-transform ${
                    open ? "rotate-180" : ""
                  }`}
                >
                  ▾
                </span>
              </button>
              {open && (
                <div className="px-5 pb-5">
                  <p className="text-xs font-semibold uppercase tracking-wide text-cyan-600 dark:text-cyan-400 mb-2">
                    Cursos gratuitos recomendados
                  </p>
                  <ul className="space-y-1.5">
                    {area.courses.map((course) => (
                      <li key={course.title} className="text-sm text-neutral-700 dark:text-neutral-300">
                        {course.title} <span className="text-neutral-400">— {course.provider}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </main>
  );
}
