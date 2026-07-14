"use client";

import { useCallback, useEffect, useId, useState } from "react";
import Link from "next/link";
import {
  Bell,
  CalendarClock,
  CheckCircle2,
  Clock3,
  RefreshCw,
  Sparkles,
  X,
} from "lucide-react";

const STORAGE_KEY = "upcoming-features-modal:v1:seen";

const FEATURES = [
  {
    title: "Dashboard de jornada",
    description: "Uma visão clara do seu score, próximas ações, prazos, entrevistas e candidaturas.",
    status: "Em planejamento",
    icon: CalendarClock,
  },
  {
    title: "Lembretes de prazo e entrevista",
    description: "Avisos por e-mail para não perder data de candidatura, teste técnico ou entrevista.",
    status: "Próximo",
    icon: Bell,
  },
  {
    title: "Reanálise rápida do currículo",
    description: "Depois de editar o currículo, comparar de novo com a mesma vaga sem refazer tudo.",
    status: "Próximo",
    icon: RefreshCw,
  },
  {
    title: "Recuperação de leads",
    description: "Sequência curta para quem fez uma análise ou teste e ainda não desbloqueou o diagnóstico.",
    status: "Depois",
    icon: Clock3,
  },
];

export function UpcomingFeaturesModal() {
  const titleId = useId();
  const [open, setOpen] = useState(false);

  useEffect(() => {
    try {
      if (window.localStorage.getItem(STORAGE_KEY)) return;
    } catch {
      return;
    }

    const timer = window.setTimeout(() => setOpen(true), 1200);
    return () => window.clearTimeout(timer);
  }, []);

  const close = useCallback(() => {
    setOpen(false);
    try {
      window.localStorage.setItem(STORAGE_KEY, "1");
    } catch {
      /* ignore */
    }
  }, []);

  useEffect(() => {
    if (!open) return;

    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") close();
    };

    document.addEventListener("keydown", onKeyDown);
    return () => document.removeEventListener("keydown", onKeyDown);
  }, [close, open]);

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="fixed bottom-5 left-5 z-[55] inline-flex items-center gap-2 rounded-full border border-blue-200 bg-white px-3.5 py-2.5 text-sm font-semibold text-blue-700 shadow-lg shadow-slate-900/10 transition hover:border-blue-300 hover:bg-blue-50 dark:border-blue-900/70 dark:bg-neutral-950 dark:text-blue-300 dark:hover:bg-blue-950/40"
        aria-haspopup="dialog"
        aria-expanded={open}
      >
        <Sparkles className="h-4 w-4" strokeWidth={1.9} />
        <span className="hidden sm:inline">Novidades</span>
      </button>

      {open && (
        <div className="fixed inset-0 z-[70] flex items-center justify-center px-4 py-6">
          <button
            type="button"
            aria-label="Fechar novidades"
            className="absolute inset-0 bg-slate-950/55 backdrop-blur-sm"
            onClick={close}
          />

          <section
            role="dialog"
            aria-modal="true"
            aria-labelledby={titleId}
            className="relative w-full max-w-2xl overflow-hidden rounded-2xl border border-neutral-200 bg-white shadow-2xl shadow-slate-950/25 dark:border-neutral-800 dark:bg-neutral-950"
          >
            <div className="border-b border-neutral-200 bg-gradient-to-r from-blue-50 via-white to-amber-50 px-5 py-5 dark:border-neutral-800 dark:from-blue-950/35 dark:via-neutral-950 dark:to-amber-950/20 sm:px-6">
              <div className="flex items-start justify-between gap-4">
                <div>
                  <p className="inline-flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wide text-blue-700 dark:text-blue-300">
                    <Sparkles className="h-3.5 w-3.5" strokeWidth={2} />
                    Próximas novidades
                  </p>
                  <h2 id={titleId} className="mt-2 text-xl font-bold tracking-tight text-neutral-950 dark:text-white">
                    O que está chegando no CarreirasMatch
                  </h2>
                  <p className="mt-1.5 max-w-xl text-sm leading-relaxed text-neutral-600 dark:text-neutral-300">
                    Estamos priorizando recursos que ajudam você a voltar com clareza, acompanhar oportunidades e transformar análise em ação.
                  </p>
                </div>
                <button
                  type="button"
                  onClick={close}
                  className="rounded-lg p-2 text-neutral-500 transition hover:bg-white/70 hover:text-neutral-900 dark:hover:bg-neutral-900 dark:hover:text-white"
                  aria-label="Fechar modal de novidades"
                >
                  <X className="h-5 w-5" strokeWidth={1.9} />
                </button>
              </div>
            </div>

            <div className="max-h-[70vh] overflow-y-auto px-5 py-5 sm:px-6">
              <div className="grid gap-3">
                {FEATURES.map((feature) => {
                  const Icon = feature.icon;
                  return (
                    <article
                      key={feature.title}
                      className="rounded-lg border border-neutral-200 bg-white p-4 dark:border-neutral-800 dark:bg-neutral-900/70"
                    >
                      <div className="flex gap-3">
                        <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-blue-50 text-blue-700 dark:bg-blue-950/50 dark:text-blue-300">
                          <Icon className="h-5 w-5" strokeWidth={1.9} />
                        </span>
                        <div className="min-w-0 flex-1">
                          <div className="flex flex-wrap items-start justify-between gap-2">
                            <h3 className="text-sm font-bold text-neutral-950 dark:text-white">
                              {feature.title}
                            </h3>
                            <span className="inline-flex items-center gap-1 rounded-full bg-amber-50 px-2 py-1 text-[11px] font-semibold text-amber-700 dark:bg-amber-950/40 dark:text-amber-300">
                              <CheckCircle2 className="h-3.5 w-3.5" strokeWidth={2} />
                              {feature.status}
                            </span>
                          </div>
                          <p className="mt-1 text-sm leading-relaxed text-neutral-600 dark:text-neutral-300">
                            {feature.description}
                          </p>
                        </div>
                      </div>
                    </article>
                  );
                })}
              </div>

              <div className="mt-5 flex flex-col gap-3 rounded-lg border border-blue-100 bg-blue-50 p-4 dark:border-blue-900/60 dark:bg-blue-950/25 sm:flex-row sm:items-center sm:justify-between">
                <p className="text-sm font-medium text-blue-950 dark:text-blue-100">
                  Quer acompanhar a evolução? O roadmap completo fica registrado na documentação do produto.
                </p>
                <Link
                  href="/contato"
                  onClick={close}
                  className="inline-flex shrink-0 items-center justify-center rounded-lg bg-blue-600 px-4 py-2 text-sm font-semibold text-white transition hover:bg-blue-700"
                >
                  Sugerir feature
                </Link>
              </div>
            </div>
          </section>
        </div>
      )}
    </>
  );
}
