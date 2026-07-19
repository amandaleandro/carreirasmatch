"use client";

import { useCallback, useEffect, useId } from "react";
import Link from "next/link";
import { useUiPanels } from "@/components/ui-panels";
import {
  Bell,
  CheckCircle2,
  GraduationCap,
  Landmark,
  Mail,
  RefreshCw,
  Rss,
  ScrollText,
  Sparkles,
  X,
} from "lucide-react";

// Sobe a versão sempre que a lista muda de verdade: quem já fechou a modal
// precisa ver o que saiu depois.
const STORAGE_KEY = "upcoming-features-modal:v3:seen";

/** Já está no ar - o que a pessoa pode usar agora. */
const SHIPPED = [
  {
    title: "Radar de concursos",
    description: "Novos editais, inscrições e provas de concursos públicos reunidos e atualizados ao longo do dia.",
    href: "/concursos",
    icon: Landmark,
  },
  {
    title: "Radar de vestibulares",
    description: "Vestibulares, ENEM, Sisu, ProUni e bolsas mais recentes, tudo num lugar só.",
    href: "/vestibulares",
    icon: ScrollText,
  },
  {
    title: "Mentorias em vídeo",
    description: "Mentorias e cursos gratuitos de carreira, entrevista e currículo, selecionados do YouTube.",
    href: "/mentorias",
    icon: GraduationCap,
  },
  {
    title: "Feed aberto a todos",
    description: "Agora dá para ver todas as vagas disponíveis mesmo antes de enviar o currículo.",
    href: "/feed",
    icon: Rss,
  },
];

/** Ainda não existe - o que estamos priorizando. */
const UPCOMING = [
  {
    title: "Alertas de concursos e vestibulares",
    description: "Escolha seus temas e receba um aviso por e-mail assim que surgir um edital novo no radar.",
    status: "Próximo",
    icon: Mail,
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
    status: "Depois",
    icon: RefreshCw,
  },
];

export function UpcomingFeaturesModal() {
  const titleId = useId();
  const { newsOpen: open, openNews, closeNews } = useUiPanels();

  useEffect(() => {
    try {
      if (window.localStorage.getItem(STORAGE_KEY)) return;
    } catch {
      return;
    }

    const timer = window.setTimeout(() => openNews(), 1200);
    return () => window.clearTimeout(timer);
  }, [openNews]);

  const close = useCallback(() => {
    closeNews();
    try {
      window.localStorage.setItem(STORAGE_KEY, "1");
    } catch {
      /* ignore */
    }
  }, [closeNews]);

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
                    Novidades
                  </p>
                  <h2 id={titleId} className="mt-2 text-xl font-bold tracking-tight text-neutral-950 dark:text-white">
                    O que acabou de chegar no CarreirasMatch
                  </h2>
                  <p className="mt-1.5 max-w-xl text-sm leading-relaxed text-neutral-600 dark:text-neutral-300">
                    Agora você acompanha vagas, concursos e vestibulares e ainda estuda de graça — tudo num lugar só.
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
              <h3 className="mb-3 inline-flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wide text-emerald-700 dark:text-emerald-400">
                <CheckCircle2 className="h-3.5 w-3.5" strokeWidth={2} />
                Já disponível
              </h3>
              <div className="grid gap-3">
                {SHIPPED.map((feature) => {
                  const Icon = feature.icon;
                  return (
                    <Link
                      key={feature.title}
                      href={feature.href}
                      onClick={close}
                      className="block rounded-lg border border-emerald-200 bg-emerald-50/50 p-4 transition hover:border-emerald-300 hover:bg-emerald-50 dark:border-emerald-900/60 dark:bg-emerald-950/20 dark:hover:bg-emerald-950/40"
                    >
                      <div className="flex gap-3">
                        <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-emerald-100 text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-300">
                          <Icon className="h-5 w-5" strokeWidth={1.9} />
                        </span>
                        <div className="min-w-0 flex-1">
                          <div className="flex flex-wrap items-start justify-between gap-2">
                            <h4 className="text-sm font-bold text-neutral-950 dark:text-white">
                              {feature.title}
                            </h4>
                            <span className="text-[11px] font-semibold text-emerald-700 dark:text-emerald-300">
                              Testar agora →
                            </span>
                          </div>
                          <p className="mt-1 text-sm leading-relaxed text-neutral-600 dark:text-neutral-300">
                            {feature.description}
                          </p>
                        </div>
                      </div>
                    </Link>
                  );
                })}
              </div>

              <h3 className="mb-3 mt-6 inline-flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wide text-blue-700 dark:text-blue-300">
                <Sparkles className="h-3.5 w-3.5" strokeWidth={2} />
                Em construção
              </h3>
              <div className="grid gap-3">
                {UPCOMING.map((feature) => {
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
                            <h4 className="text-sm font-bold text-neutral-950 dark:text-white">
                              {feature.title}
                            </h4>
                            <span className="inline-flex items-center gap-1 rounded-full bg-amber-50 px-2 py-1 text-[11px] font-semibold text-amber-700 dark:bg-amber-950/40 dark:text-amber-300">
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
