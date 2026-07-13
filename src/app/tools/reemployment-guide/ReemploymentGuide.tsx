"use client";

import { useState } from "react";
import Link from "next/link";
import {
  REEMPLOYMENT_GUIDE,
  REEMPLOYMENT_GUIDE_BY_SECTION,
  type ReemploymentGuideSection,
} from "@/lib/reemployment-guide";

const RELATED_LINKS: Partial<Record<ReemploymentGuideSection, { href: string; label: string }[]>> = {
  rede_de_contatos: [{ href: "/tools/linkedin-review", label: "Análise de LinkedIn →" }],
  estrategia_de_candidatura: [{ href: "/applications", label: "Ver meu kanban de candidaturas →" }],
  objecoes_na_entrevista: [
    { href: "/tools/interview-guide", label: "Guia de entrevista →" },
    { href: "/interviews", label: "Treinar simulação de entrevista →" },
  ],
  motivacao_na_busca: [{ href: "/applications", label: "Ver minha jornada de busca →" }],
};

export function ReemploymentGuide() {
  const [section, setSection] = useState<ReemploymentGuideSection>("desligamento_e_gap");
  const content = REEMPLOYMENT_GUIDE_BY_SECTION[section];
  const related = RELATED_LINKS[section];

  return (
    <main className="max-w-3xl mx-auto px-4 py-12 w-full">
      <Link href="/tools" className="text-sm text-blue-600 dark:text-blue-400 hover:underline">
        ← Voltar
      </Link>

      <header className="mt-4 mb-8">
        <p className="inline-flex items-center gap-1.5 text-[11px] font-semibold uppercase tracking-wide text-rose-600 dark:text-rose-400 bg-rose-50 dark:bg-rose-950/40 border border-rose-100 dark:border-rose-900/50 rounded-full px-3 py-1">
          Recurso do Plano Recolocação
        </p>
        <h1 className="text-2xl md:text-3xl font-bold tracking-tight mt-3">
          Guia completo de recolocação
        </h1>
        <p className="text-neutral-600 dark:text-neutral-400 mt-2">
          Do desligamento à próxima oferta, como voltar ao mercado com estratégia e sem perder o ritmo.
        </p>
      </header>

      <div className="flex flex-wrap gap-2 mb-8">
        {REEMPLOYMENT_GUIDE.map((s) => {
          const active = s.key === section;
          return (
            <button
              key={s.key}
              type="button"
              onClick={() => setSection(s.key)}
              className={`rounded-full px-4 py-2 text-xs font-semibold border transition-all ${
                active
                  ? "border-rose-600 bg-rose-600 text-white shadow-sm shadow-rose-500/25"
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
              <span className="mt-0.5 h-7 w-7 shrink-0 rounded-full bg-rose-50 dark:bg-rose-950/30 text-rose-600 dark:text-rose-400 flex items-center justify-center text-xs font-bold">
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

      {related && related.length > 0 && (
        <div className="mt-8 rounded-2xl border border-blue-100 dark:border-blue-900/50 bg-blue-50/60 dark:bg-blue-950/20 p-5">
          <p className="text-sm font-semibold mb-3">Continue por aqui</p>
          <div className="flex flex-wrap gap-3">
            {related.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className="text-sm font-medium text-blue-600 dark:text-blue-400 hover:underline"
              >
                {link.label}
              </Link>
            ))}
          </div>
        </div>
      )}
    </main>
  );
}
