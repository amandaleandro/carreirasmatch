"use client";

import Link from "next/link";
import {
  APPRENTICE_ORGANIZATIONS,
  FIND_APPRENTICE_JOBS_TIPS,
  HIGH_SCHOOL_INTERNSHIP_NOTE,
  type ApprenticeOrganization,
} from "@/lib/apprentice-companies";

const CATEGORIES: ApprenticeOrganization["category"][] = [
  "Agente de integração / entidade formadora",
  "Setor que mais contrata",
  "Estágio para estudante de ensino médio",
];

export function ApprenticeCompanies() {
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
          Empresas e como encontrar vagas de Jovem Aprendiz
        </h1>
        <p className="text-neutral-600 dark:text-neutral-400 mt-2">
          Onde se cadastrar e quais setores mais contratam aprendizes no Brasil.
        </p>
      </header>

      <section className="mb-10">
        <h2 className="text-sm font-bold text-neutral-500 uppercase tracking-wider mb-4">
          Como encontrar vagas
        </h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {FIND_APPRENTICE_JOBS_TIPS.map((tip) => (
            <div
              key={tip.title}
              className="rounded-2xl border border-neutral-200 dark:border-neutral-800 bg-white/95 dark:bg-neutral-950/95 p-5 shadow-sm"
            >
              <p className="font-semibold text-sm">{tip.title}</p>
              <p className="text-xs text-neutral-500 dark:text-neutral-400 mt-1.5 leading-relaxed">{tip.description}</p>
            </div>
          ))}
        </div>
        <div className="mt-4 rounded-2xl border border-blue-100 dark:border-blue-900/50 bg-blue-50/60 dark:bg-blue-950/20 p-5 flex flex-col sm:flex-row items-center justify-between gap-4">
          <p className="text-sm text-blue-900 dark:text-blue-200">
            Veja vagas de Jovem Aprendiz compatíveis com o seu perfil direto no feed.
          </p>
          <Link
            href="/feed"
            className="shrink-0 inline-flex items-center justify-center rounded-lg bg-blue-600 hover:bg-blue-700 text-white font-semibold px-5 py-2.5 text-sm transition-colors"
          >
            Ver feed de vagas
          </Link>
        </div>
      </section>

      {CATEGORIES.map((category) => (
        <section key={category} className="mb-10">
          <h2 className="text-sm font-bold text-neutral-500 uppercase tracking-wider mb-4">
            {category}
          </h2>
          {category === "Estágio para estudante de ensino médio" && (
            <div className="mb-4 rounded-2xl border border-amber-100 dark:border-amber-900/50 bg-amber-50/60 dark:bg-amber-950/20 p-4">
              <p className="text-sm text-amber-900 dark:text-amber-200 leading-relaxed">
                {HIGH_SCHOOL_INTERNSHIP_NOTE}
              </p>
            </div>
          )}
          <div className="space-y-4">
            {APPRENTICE_ORGANIZATIONS.filter((org) => org.category === category).map((org) => (
              <div
                key={org.name}
                className="rounded-2xl border border-neutral-200 dark:border-neutral-800 bg-white/95 dark:bg-neutral-950/95 p-6 shadow-sm"
              >
                <p className="font-semibold text-sm">{org.name}</p>
                <p className="text-sm text-neutral-600 dark:text-neutral-400 mt-2 leading-relaxed">{org.description}</p>
                <div className="mt-3 rounded-lg bg-emerald-50 dark:bg-emerald-950/30 border border-emerald-100 dark:border-emerald-900/50 px-3 py-2">
                  <p className="text-xs font-semibold uppercase tracking-wide text-emerald-700 dark:text-emerald-400">
                    Como se candidatar
                  </p>
                  <p className="text-sm text-emerald-800 dark:text-emerald-300 mt-1">{org.howToApply}</p>
                </div>
              </div>
            ))}
          </div>
        </section>
      ))}
    </main>
  );
}
