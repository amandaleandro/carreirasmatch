"use client";

import { useCallback, useEffect, useId, useRef, useState } from "react";
import Link from "next/link";
import { useUiPanels } from "@/components/ui-panels";
import {
  ArrowRight,
  Bell,
  BookOpen,
  Building2,
  CheckCircle2,
  Clock,
  FileStack,
  Gamepad2,
  GitCompare,
  GraduationCap,
  Handshake,
  Landmark,
  Layers,
  Mail,
  MessageSquarePlus,
  RefreshCw,
  Rss,
  ScrollText,
  Sparkles,
  Trophy,
  Wand2,
  X,
} from "lucide-react";

// Versão atualizada da chave de novidades no localStorage
const STORAGE_KEY = "upcoming-features-modal:v7:seen";

export type FeatureTab = "shipped" | "upcoming" | "all";

/** Recursos já lançados e disponíveis para uso */
const SHIPPED = [
  {
    title: "Exercícios por Matéria na Universidade",
    description: "Pratique exercícios organizados por disciplina do seu curso, com correção guiada para fixar o conteúdo.",
    tag: "Universidade",
    badge: "Novo!",
    href: "/universidade",
    icon: BookOpen,
    colorClass: "cyan",
  },
  {
    title: "Kit de Candidatura Completo",
    description: "Gere de uma vez currículo ajustado, carta de apresentação e checklist de preparação para a vaga.",
    tag: "Inteligência Artificial",
    badge: "Novo!",
    href: "/applications",
    icon: FileStack,
    colorClass: "purple",
  },
  {
    title: "Comparador de Vagas",
    description: "Compare lado a lado salário, benefícios e aderência de várias vagas antes de decidir onde aplicar.",
    tag: "Decisão de Carreira",
    badge: "Novo!",
    href: "/tools/comparador-vagas",
    icon: GitCompare,
    colorClass: "blue",
  },
  {
    title: "Desafio do Match",
    description: "Indique amigos com seu link exclusivo e ganhe créditos de diagnóstico completo a cada 3 indicações confirmadas.",
    tag: "Indicação & Créditos",
    badge: "Novo!",
    href: "/desafio",
    icon: Trophy,
    colorClass: "emerald",
  },
  {
    title: "Marketplace Freelancer",
    description: "Ofereça seus serviços profissionais, publique portfólio ou contrate especialistas para seus projetos.",
    tag: "Serviços & Projetos",
    badge: "Popular",
    href: "/freelancer",
    icon: Handshake,
    colorClass: "indigo",
  },
  {
    title: "Gerador de Carta de Apresentação",
    description: "Crie cartas de apresentação personalizadas para cada vaga com ajuste de tom e dicas de envio.",
    tag: "Inteligência Artificial",
    badge: "Ferramenta",
    href: "/tools/cover-letter",
    icon: Wand2,
    colorClass: "purple",
  },
  {
    title: "7 Jogos de Carreira",
    description: "Minijogos interativos para treinar agilidade de digitação, vocabulário corporativo e mercado com ranking mensal.",
    tag: "Gamificação",
    badge: "7 Minijogos",
    href: "/jogos",
    icon: Gamepad2,
    colorClass: "purple",
  },
  {
    title: "Radar de Concursos Públicos",
    description: "Acompanhe editais abertos, prazos de inscrição, salários e provas atualizados diariamente.",
    tag: "Serviço Público",
    badge: "Atualizado 3x/dia",
    href: "/concursos",
    icon: Landmark,
    colorClass: "blue",
  },
  {
    title: "Radar de Vestibulares & Enem",
    description: "Painel completo de vestibulares, bolsas ProUni, Fies, Sisu e cronograma do ENEM.",
    tag: "Estudantes",
    badge: "Bolsas & Provas",
    href: "/vestibulares",
    icon: ScrollText,
    colorClass: "amber",
  },
  {
    title: "Mentorias & Cursos Gratuitos",
    description: "Aulas e mentorias em vídeo selecionadas dos melhores especialistas para currículo, entrevistas e carreira.",
    tag: "Capacitação",
    badge: "100% Grátis",
    href: "/mentorias",
    icon: GraduationCap,
    colorClass: "cyan",
  },
  {
    title: "Catálogo Global de Vagas",
    description: "Explore o catálogo completo de oportunidades abertas no mercado sem restrição de filtros automáticos.",
    tag: "Busca Completa",
    badge: "Feed Geral",
    href: "/todas-as-vagas",
    icon: Rss,
    colorClass: "rose",
  },
  {
    title: "Portal B2B & Triagem para Empresas",
    description: "Empresas podem publicar vagas e realizar triagem automatizada com Inteligência Artificial em lote.",
    tag: "Empresas",
    badge: "Módulo B2B",
    href: "/empresa/login",
    icon: Building2,
    colorClass: "violet",
  },
];

/** Recursos em desenvolvimento / Roadmap */
const UPCOMING = [
  {
    title: "Alertas de Concursos & Vestibulares por E-mail",
    description: "Cadastre suas áreas de interesse, banca ou estado e receba notificações no e-mail assim que sair edital novo.",
    status: "Em Breve",
    tag: "Notificações",
    icon: Mail,
    colorClass: "blue",
  },
  {
    title: "Lembretes de Prazos, Testes e Entrevistas",
    description: "Avisos automáticos por e-mail e painel para você não perder prazos de candidatura, testes ou entrevistas.",
    status: "Em Breve",
    tag: "Produtividade",
    icon: Bell,
    colorClass: "amber",
  },
  {
    title: "Reanálise Rápida de Currículo em 1 Clique",
    description: "Editou seu currículo no Otimizador? Compare de novo com a vaga original em 1 clique sem reenviar tudo.",
    status: "Em Breve",
    tag: "Inteligência Artificial",
    icon: RefreshCw,
    colorClass: "emerald",
  },
  {
    title: "Alertas & Resumos Semanais via WhatsApp",
    description: "Receba lembretes de candidaturas e resumo das melhores vagas da semana direto no seu WhatsApp.",
    status: "Em Planejamento",
    tag: "Canais Diretos",
    icon: MessageSquarePlus,
    colorClass: "emerald",
  },
  {
    title: "Simulador de Entrevista por Voz (Audio AI)",
    description: "Pratique respostas para entrevistas em tempo real conversando em áudio com avaliação de tom e clareza.",
    status: "Planejado",
    tag: "IA Interativa",
    icon: Sparkles,
    colorClass: "rose",
  },
];

export function UpcomingFeaturesModal() {
  const titleId = useId();
  const { newsOpen: open, tourOpen, openNews, closeNews } = useUiPanels();
  const [activeTab, setActiveTab] = useState<FeatureTab>("shipped");
  const closeButtonRef = useRef<HTMLButtonElement>(null);
  const previousFocusRef = useRef<HTMLElement | null>(null);

  useEffect(() => {
    try {
      if (window.localStorage.getItem(STORAGE_KEY)) return;
    } catch {
      return;
    }

    if (tourOpen) return;
    const timer = window.setTimeout(() => openNews(), 700);
    return () => window.clearTimeout(timer);
  }, [openNews, tourOpen]);

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

    previousFocusRef.current = document.activeElement as HTMLElement | null;
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    window.requestAnimationFrame(() => closeButtonRef.current?.focus());

    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") close();
      if (event.key === "Tab") {
        const dialog = document.querySelector<HTMLElement>("[data-news-dialog]");
        if (!dialog) return;
        const focusable = Array.from(dialog.querySelectorAll<HTMLElement>(
          'button:not([disabled]), a[href], [tabindex]:not([tabindex="-1"])'
        ));
        if (!focusable.length) return;
        const first = focusable[0];
        const last = focusable[focusable.length - 1];
        if (event.shiftKey && document.activeElement === first) {
          event.preventDefault();
          last.focus();
        } else if (!event.shiftKey && document.activeElement === last) {
          event.preventDefault();
          first.focus();
        }
      }
    };

    document.addEventListener("keydown", onKeyDown);
    return () => {
      document.removeEventListener("keydown", onKeyDown);
      document.body.style.overflow = previousOverflow;
      previousFocusRef.current?.focus();
    };
  }, [close, open]);

  return (
    <>
      {open && (
        <div className="fixed inset-0 z-[70] flex items-center justify-center p-3 sm:p-4 md:p-6 overflow-y-auto">
          {/* Backdrop com blur escuro elegante */}
          <button
            type="button"
            aria-label="Fechar novidades"
            className="fixed inset-0 bg-slate-950/70 backdrop-blur-md transition-opacity"
            onClick={close}
          />

          {/* Modal Container */}
          <section
            data-news-dialog
            role="dialog"
            aria-modal="true"
            aria-labelledby={titleId}
            className="relative w-full max-w-3xl overflow-hidden rounded-2xl border border-neutral-200 bg-white shadow-2xl shadow-slate-950/30 dark:border-neutral-800 dark:bg-neutral-950 my-auto"
          >
            {/* Header da Modal */}
            <div className="relative border-b border-neutral-200 bg-gradient-to-r from-blue-50/80 via-white to-indigo-50/80 px-6 py-5 dark:border-neutral-800 dark:from-blue-950/40 dark:via-neutral-950 dark:to-indigo-950/30">
              <div className="flex items-start justify-between gap-4">
                <div>
                  <div className="inline-flex items-center gap-1.5 rounded-full border border-blue-200/80 bg-blue-100/60 px-2.5 py-0.5 text-xs font-semibold text-blue-700 dark:border-blue-800/60 dark:bg-blue-950/60 dark:text-blue-300">
                    <Sparkles className="h-3.5 w-3.5 text-blue-600 dark:text-blue-400" />
                    Central de Novidades & Roadmap
                  </div>
                  <h2 id={titleId} className="mt-2 text-xl font-extrabold tracking-tight text-neutral-950 dark:text-white sm:text-2xl">
                    O que há de novo no CarreirasMatch
                  </h2>
                  <p className="mt-1 max-w-xl text-xs sm:text-sm text-neutral-600 dark:text-neutral-300 leading-relaxed">
                    Descubra os recursos recém-chegados à plataforma e acompanhe o que estamos construindo para acelerar sua carreira.
                  </p>
                </div>
                <button
                  type="button"
                  ref={closeButtonRef}
                  onClick={close}
                  className="rounded-xl border border-neutral-200/60 bg-white/80 p-2 text-neutral-500 transition hover:bg-neutral-100 hover:text-neutral-900 dark:border-neutral-800 dark:bg-neutral-900/80 dark:text-neutral-400 dark:hover:bg-neutral-800 dark:hover:text-white"
                  aria-label="Fechar modal de novidades"
                >
                  <X className="h-5 w-5" strokeWidth={2} />
                </button>
              </div>

              {/* Filtro por Abas */}
              <div className="mt-5 flex flex-wrap items-center gap-2">
                <button
                  type="button"
                  onClick={() => setActiveTab("shipped")}
                  className={`inline-flex items-center gap-2 rounded-xl px-3.5 py-1.5 text-xs font-bold transition-all ${
                    activeTab === "shipped"
                      ? "bg-emerald-600 text-white shadow-md shadow-emerald-600/25 dark:bg-emerald-500"
                      : "bg-neutral-100 text-neutral-600 hover:bg-neutral-200 dark:bg-neutral-900 dark:text-neutral-400 dark:hover:bg-neutral-800"
                  }`}
                >
                  <CheckCircle2 className="h-3.5 w-3.5" />
                  Já Disponíveis ({SHIPPED.length})
                </button>

                <button
                  type="button"
                  onClick={() => setActiveTab("upcoming")}
                  className={`inline-flex items-center gap-2 rounded-xl px-3.5 py-1.5 text-xs font-bold transition-all ${
                    activeTab === "upcoming"
                      ? "bg-blue-600 text-white shadow-md shadow-blue-600/25 dark:bg-blue-500"
                      : "bg-neutral-100 text-neutral-600 hover:bg-neutral-200 dark:bg-neutral-900 dark:text-neutral-400 dark:hover:bg-neutral-800"
                  }`}
                >
                  <Clock className="h-3.5 w-3.5" />
                  Em Breve ({UPCOMING.length})
                </button>

                <button
                  type="button"
                  onClick={() => setActiveTab("all")}
                  className={`inline-flex items-center gap-2 rounded-xl px-3.5 py-1.5 text-xs font-bold transition-all ${
                    activeTab === "all"
                      ? "bg-neutral-900 text-white shadow-md dark:bg-white dark:text-neutral-900"
                      : "bg-neutral-100 text-neutral-600 hover:bg-neutral-200 dark:bg-neutral-900 dark:text-neutral-400 dark:hover:bg-neutral-800"
                  }`}
                >
                  <Layers className="h-3.5 w-3.5" />
                  Ver Todos ({SHIPPED.length + UPCOMING.length})
                </button>
              </div>
            </div>

            {/* Conteúdo com Scroll */}
            <div className="max-h-[60vh] overflow-y-auto px-5 py-5 sm:px-6">
              {/* Seção 1: Já Disponíveis */}
              {(activeTab === "shipped" || activeTab === "all") && (
                <div className={activeTab === "all" ? "mb-8" : ""}>
                  {activeTab === "all" && (
                    <h3 className="mb-3.5 inline-flex items-center gap-2 text-xs font-extrabold uppercase tracking-wider text-emerald-700 dark:text-emerald-400">
                      <CheckCircle2 className="h-4 w-4" />
                      Já no Ar ({SHIPPED.length})
                    </h3>
                  )}

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                    {SHIPPED.map((feature) => {
                      const Icon = feature.icon;
                      return (
                        <Link
                          key={feature.title}
                          href={feature.href}
                          onClick={close}
                          className="group relative flex flex-col justify-between rounded-xl border border-emerald-200/80 bg-emerald-50/40 p-4 transition-all hover:-translate-y-0.5 hover:border-emerald-300 hover:bg-emerald-50 hover:shadow-md dark:border-emerald-900/50 dark:bg-emerald-950/15 dark:hover:border-emerald-800 dark:hover:bg-emerald-950/35"
                        >
                          <div>
                            <div className="flex items-center justify-between gap-2 mb-2.5">
                              <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-emerald-100 text-emerald-700 dark:bg-emerald-950/80 dark:text-emerald-300">
                                <Icon className="h-4.5 w-4.5" strokeWidth={2} />
                              </span>
                              <span className="inline-flex items-center rounded-md bg-emerald-100/80 px-2 py-0.5 text-[10px] font-bold text-emerald-800 dark:bg-emerald-900/60 dark:text-emerald-200">
                                {feature.badge}
                              </span>
                            </div>
                            <h4 className="text-sm font-bold text-neutral-900 dark:text-white group-hover:text-emerald-700 dark:group-hover:text-emerald-300 transition-colors">
                              {feature.title}
                            </h4>
                            <p className="mt-1 text-xs leading-relaxed text-neutral-600 dark:text-neutral-300">
                              {feature.description}
                            </p>
                          </div>

                          <div className="mt-3.5 flex items-center justify-between border-t border-emerald-200/50 pt-2.5 dark:border-emerald-900/40">
                            <span className="text-[11px] font-medium text-neutral-500 dark:text-neutral-400">
                              {feature.tag}
                            </span>
                            <span className="inline-flex items-center gap-1 text-xs font-bold text-emerald-700 dark:text-emerald-400 group-hover:translate-x-0.5 transition-transform">
                              Testar agora
                              <ArrowRight className="h-3.5 w-3.5" />
                            </span>
                          </div>
                        </Link>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* Seção 2: Em Breve */}
              {(activeTab === "upcoming" || activeTab === "all") && (
                <div>
                  {activeTab === "all" && (
                    <h3 className="mb-3.5 inline-flex items-center gap-2 text-xs font-extrabold uppercase tracking-wider text-blue-700 dark:text-blue-400">
                      <Clock className="h-4 w-4" />
                      Em Desenvolvimento ({UPCOMING.length})
                    </h3>
                  )}

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                    {UPCOMING.map((feature) => {
                      const Icon = feature.icon;
                      return (
                        <article
                          key={feature.title}
                          className="flex flex-col justify-between rounded-xl border border-neutral-200/90 bg-white p-4 transition-all hover:border-blue-200 dark:border-neutral-800 dark:bg-neutral-900/60 dark:hover:border-neutral-700"
                        >
                          <div>
                            <div className="flex items-center justify-between gap-2 mb-2.5">
                              <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-blue-50 text-blue-600 dark:bg-blue-950/60 dark:text-blue-300">
                                <Icon className="h-4.5 w-4.5" strokeWidth={2} />
                              </span>
                              <span className="inline-flex items-center gap-1.5 rounded-full bg-amber-50 px-2.5 py-0.5 text-[10px] font-bold text-amber-700 dark:bg-amber-950/50 dark:text-amber-300 border border-amber-200/60 dark:border-amber-900/40">
                                <span className="h-1.5 w-1.5 rounded-full bg-amber-500 animate-pulse" />
                                {feature.status}
                              </span>
                            </div>
                            <h4 className="text-sm font-bold text-neutral-900 dark:text-white">
                              {feature.title}
                            </h4>
                            <p className="mt-1 text-xs leading-relaxed text-neutral-600 dark:text-neutral-300">
                              {feature.description}
                            </p>
                          </div>

                          <div className="mt-3.5 flex items-center justify-between border-t border-neutral-100 pt-2.5 dark:border-neutral-800/60">
                            <span className="text-[11px] font-medium text-neutral-500 dark:text-neutral-400">
                              {feature.tag}
                            </span>
                            <span className="text-[11px] font-semibold text-blue-600 dark:text-blue-400">
                              Em breve no app
                            </span>
                          </div>
                        </article>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* Banner de Sugestão e Feedback */}
              <div className="mt-6 flex flex-col sm:flex-row items-center justify-between gap-4 rounded-xl border border-blue-200/80 bg-gradient-to-r from-blue-50/90 via-indigo-50/50 to-blue-50/90 p-4 dark:border-blue-900/60 dark:from-blue-950/40 dark:via-indigo-950/20 dark:to-blue-950/40">
                <div className="flex items-center gap-3">
                  <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-blue-600 text-white shadow-md shadow-blue-600/20">
                    <MessageSquarePlus className="h-5 w-5" />
                  </div>
                  <div>
                    <h5 className="text-xs sm:text-sm font-bold text-blue-950 dark:text-blue-100">
                      Sentiu falta de algum recurso?
                    </h5>
                    <p className="text-xs text-blue-800/80 dark:text-blue-300">
                      Sua sugestão vai direto para a equipe de produto priorizar no próximo ciclo.
                    </p>
                  </div>
                </div>
                <Link
                  href="/contato"
                  onClick={close}
                  className="w-full sm:w-auto inline-flex shrink-0 items-center justify-center rounded-xl bg-blue-600 px-4 py-2 text-xs font-bold text-white transition hover:bg-blue-700 shadow-md shadow-blue-600/20"
                >
                  Sugerir recurso →
                </Link>
              </div>
            </div>
          </section>
        </div>
      )}
    </>
  );
}
