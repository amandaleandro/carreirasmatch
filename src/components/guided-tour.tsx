"use client";

import { useCallback, useEffect, useLayoutEffect, useMemo, useRef, useState } from "react";
import { usePathname, useRouter } from "next/navigation";
import { X, ArrowRight, ArrowLeft, Sparkles } from "lucide-react";
import { useUiPanels } from "@/components/ui-panels";

type Placement = "auto" | "right" | "left" | "top" | "bottom";

type TourStep = {
  /** CSS selector of the element to highlight. Omit for a centered welcome/closing card. */
  target?: string;
  title: string;
  body: string;
  placement?: Placement;
  /** Route to navigate to before showing this step (so the target exists on screen). */
  route?: string;
};

// Sobe a versão sempre que a lista de passos muda de verdade: quem já viu o
// tour precisa ver o roteiro novo (ex: passo do Desafio do Match).
const STORAGE_KEY = "guided-tour:v2:done";

type StepId =
  | "welcome"
  | "desafio"
  | "analise"
  | "feed"
  | "todas_vagas"
  | "applications"
  | "resume"
  | "tools"
  | "mentorias"
  | "concursos"
  | "vestibulares"
  | "freelancer"
  | "jogos"
  | "search"
  | "overview"
  | "closing";

/** Shared step definitions. Copy is customized per career segment below. */
const BASE_STEPS: Record<StepId, TourStep> = {
  welcome: {
    title: "Bem-vindo(a)! 👋",
    body: "Em 1 minuto eu te mostro por onde a mágica acontece. Pode continuar usando a tela normalmente - nada fica bloqueado.",
  },
  desafio: {
    target: '[data-tour="nav-desafio"]',
    title: "Desafio do Match ⚡",
    body: "Indique amigos com o seu link e desbloqueie recompensas conforme eles se cadastram. Vale a pena dar uma olhada logo de cara.",
    placement: "right",
    route: "/dashboard",
  },
  analise: {
    target: '[data-tour="nav-analise"]',
    title: "Comece por aqui: Análise de Vaga",
    body: "Cole uma vaga + seu currículo e receba na hora sua aderência, pontos fortes e o que ajustar para se destacar.",
    placement: "right",
    route: "/dashboard",
  },
  feed: {
    target: '[data-tour="nav-feed"]',
    title: "Feed de Vagas",
    body: "Vagas selecionadas para o seu momento de carreira. Salve as interessantes com um clique - elas viram candidaturas.",
    placement: "right",
  },
  todas_vagas: {
    target: '[data-tour="nav-todas-vagas"]',
    title: "Todas as Vagas",
    body: "Quer ver o feed completo, sem curadoria? Aqui ficam todas as vagas abertas na plataforma, com filtro por área e nível.",
    placement: "right",
  },
  applications: {
    target: '[data-tour="nav-applications"]',
    title: "Candidaturas (Kanban)",
    body: "Acompanhe cada processo - de “inscrito” até “oferta” - arrastando os cards pelas etapas. Nada mais se perde.",
    placement: "right",
  },
  resume: {
    target: '[data-tour="nav-resume"]',
    title: "Meu Currículo",
    body: "Guarde e otimize seu currículo aqui. Ele é reaproveitado em toda análise, então você não precisa reenviar sempre.",
    placement: "right",
  },
  tools: {
    target: '[data-tour="nav-tools"]',
    title: "Ferramentas",
    body: "Carta de apresentação, simulador de entrevista, teste vocacional e muito mais - tudo pronto para acelerar sua busca.",
    placement: "right",
  },
  mentorias: {
    target: '[data-tour="nav-mentorias"]',
    title: "Vídeos para aprender",
    body: "Vídeos educativos, mentorias e cursos gratuitos sobre carreira, tecnologia, idiomas, finanças e outras habilidades úteis.",
    placement: "right",
  },
  concursos: {
    target: '[data-tour="nav-concursos"]',
    title: "Radar de concursos",
    body: "Novos editais, inscrições e provas de concursos públicos, reunidos e atualizados ao longo do dia.",
    placement: "right",
  },
  vestibulares: {
    target: '[data-tour="nav-vestibulares"]',
    title: "Radar de vestibulares",
    body: "Vestibulares, ENEM, Sisu, ProUni e bolsas mais recentes, tudo num lugar só.",
    placement: "right",
  },
  freelancer: {
    target: '[data-tour="nav-freelancer"]',
    title: "Freelancer",
    body: "Publique um perfil e ofereça serviços, ou publique um projeto e contrate outro profissional - tudo dentro da plataforma.",
    placement: "right",
  },
  jogos: {
    target: '[data-tour="nav-jogos"]',
    title: "Jogos",
    body: "Treine digitação, vocabulário técnico e conhecimento de mercado em 7 minijogos, com ranking diário, mensal e anual.",
    placement: "right",
  },
  search: {
    target: '[data-tour="topbar-search"]',
    title: "Busca rápida",
    body: "Procure a qualquer momento por vagas e relatórios que você já analisou. Ideal quando o histórico cresce.",
    placement: "bottom",
  },
  overview: {
    target: '[data-tour="dash-overview"]',
    title: "Sua visão geral",
    body: "Aqui fica o resumo do seu progresso: aderência média, prioridades e próximos passos. Volte sempre para se orientar.",
    placement: "auto",
    route: "/dashboard",
  },
  closing: {
    title: "Pronto para começar! 🚀",
    body: "É isso! Faça sua primeira análise de vaga e o painel vai ganhar vida. Precisar rever este guia, clique no botão de ajuda no canto.",
  },
};

const DEFAULT_ORDER: StepId[] = [
  "welcome",
  "desafio",
  "analise",
  "feed",
  "todas_vagas",
  "applications",
  "resume",
  "tools",
  "mentorias",
  "freelancer",
  "jogos",
  "search",
  "overview",
  "closing",
];

type SegmentConfig = {
  order?: StepId[];
  overrides?: Partial<Record<StepId, Partial<Pick<TourStep, "title" | "body">>>>;
};

/** Per-niche roteiro: reordered/trimmed steps + copy that speaks to each moment. */
const SEGMENT_TOURS: Record<string, SegmentConfig> = {
  apprentice: {
    order: ["welcome", "tools", "feed", "todas_vagas", "applications", "mentorias", "overview", "closing"],
    overrides: {
      welcome: {
        body: "Em 1 minuto eu te mostro como usar a plataforma para conquistar sua vaga de Jovem Aprendiz. Pode usar a tela normalmente.",
      },
      analise: {
        body: "Cole uma vaga de Jovem Aprendiz + seu currículo e veja na hora sua aderência e o que ajustar para ser chamado.",
      },
      tools: {
        title: "Ferramentas do Jovem Aprendiz",
        body: "Aqui ficam o Guia do Jovem Aprendiz, as empresas que mais contratam e o checklist de documentos. Comece por eles.",
      },
      closing: {
        body: "Faça sua primeira análise de vaga de aprendiz e explore o guia. Para rever este passo a passo, use o botão de ajuda no canto.",
      },
    },
  },
  first_job: {
    order: ["welcome", "feed", "todas_vagas", "applications", "mentorias", "overview", "closing"],
    overrides: {
      welcome: {
        body: "Em 1 minuto eu te mostro como usar a plataforma para conquistar seu primeiro emprego. Pode usar a tela normalmente.",
      },
      analise: {
        body: "Cole a vaga + seu currículo e veja sua aderência. Mesmo sem experiência, eu mostro como você pode se destacar.",
      },
      tools: {
        title: "Ferramentas de primeiro emprego",
        body: "Guia completo de primeiro emprego, currículo do zero e “transformar projeto em experiência”. Tudo para quem está começando.",
      },
    },
  },
  internship: {
    order: ["welcome", "analise", "feed", "applications", "resume", "overview", "closing"],
    overrides: {
      welcome: {
        body: "Em 1 minuto eu te mostro como usar a plataforma para conquistar seu estágio. Pode usar a tela normalmente.",
      },
      analise: {
        body: "Cole a vaga de estágio + seu currículo e veja sua aderência e os ajustes certos para ser chamado.",
      },
      tools: {
        title: "Ferramentas do estagiário",
        body: "Guia do estágio, calculadora de bolsa-auxílio, checklist de documentos e teste vocacional - tudo reunido aqui.",
      },
    },
  },
  student: {
    // Estudante escolhendo faculdade/técnico: foco em ferramentas e radar de vestibulares.
    order: ["welcome", "tools", "vestibulares", "mentorias", "jogos", "overview", "closing"],
    overrides: {
      welcome: {
        body: "Em 1 minuto eu te mostro como escolher sua faculdade ou curso técnico com segurança. Pode usar a tela normalmente.",
      },
      tools: {
        title: "Seu ponto de partida: Ferramentas",
        body: "O coração para você: teste vocacional, corretor de redação, guia do estudante e a mostra de redações nota 1000.",
      },
      analise: {
        body: "Já pensa em estágio ou primeiro emprego? Cole uma vaga + currículo e veja sua aderência quando quiser.",
      },
      closing: {
        body: "Comece pelo teste vocacional, fique de olho no radar de vestibulares e explore os guias. Para rever, use o botão de ajuda no canto.",
      },
    },
  },
  concurseiro: {
    order: ["welcome", "concursos", "tools", "mentorias", "overview", "closing"],
    // Concurseiro: radar de concursos e ferramentas de preparação no centro; vagas são plano B.
    overrides: {
      welcome: {
        body: "Em 1 minuto eu te mostro como a plataforma turbina a sua preparação para concursos. Pode usar a tela normalmente.",
      },
      tools: {
        title: "Ferramentas para concurseiros",
        body: "Plano de estudo, simulado e nota de corte por banca - tudo para organizar sua preparação.",
      },
      analise: {
        body: "Também analisa vagas: se quiser um plano B no mercado, cole uma vaga + currículo e veja sua aderência.",
      },
      closing: {
        body: "Fique de olho no radar de concursos e monte seu plano de estudo. Para rever este guia, use o botão de ajuda no canto.",
      },
    },
  },
  oab: {
    order: ["welcome", "tools", "mentorias", "overview", "closing"],
    // Estudante de OAB: ferramentas do exame e conteúdo de estudo no centro.
    overrides: {
      welcome: {
        body: "Em 1 minuto eu te mostro como a plataforma apoia a sua preparação para o Exame da OAB. Pode usar a tela normalmente.",
      },
      tools: {
        title: "Ferramentas para a OAB",
        body: "Preparação de 1ª e 2ª fase, prática de peças e revisão por disciplina jurídica. Comece por aqui.",
      },
      analise: {
        body: "Também analisa vagas: se quiser avaliar oportunidades no mercado jurídico, cole uma vaga + currículo.",
      },
      closing: {
        body: "Aprofunde na preparação de 1ª e 2ª fase e explore as mentorias. Para rever este guia, use o botão de ajuda no canto.",
      },
    },
  },
  career_change: {
    overrides: {
      welcome: {
        body: "Em 1 minuto eu te mostro como planejar sua transição de carreira. Pode usar a tela normalmente.",
      },
      analise: {
        body: "Cole a vaga do seu objetivo + currículo e descubra sua aderência e qual cargo-ponte te leva lá mais rápido.",
      },
      tools: {
        title: "Ferramentas para mudar de carreira",
        body: "Guia de transição de carreira, comparador de vagas e teste vocacional para validar a nova área. Comece por aqui.",
      },
    },
  },
  career_pro: {
    overrides: {
      welcome: {
        body: "Em 1 minuto eu te mostro como acelerar sua recolocação ou chegar a uma vaga melhor. Pode usar a tela normalmente.",
      },
      analise: {
        body: "Cole a vaga desejada + seu currículo e veja sua aderência e os ajustes que aumentam sua chance de resposta.",
      },
      tools: {
        title: "Ferramentas para profissionais",
        body: "Guia de recolocação, guia de crescimento de carreira e comparador de vagas. Estratégia para o seu próximo passo.",
      },
    },
  },
};

function buildSteps(segment?: string | null): TourStep[] {
  const cfg = segment ? SEGMENT_TOURS[segment] : undefined;
  const order = cfg?.order ?? DEFAULT_ORDER;
  return order.map((id) => ({ ...BASE_STEPS[id], ...(cfg?.overrides?.[id] ?? {}) }));
}

const CARD_WIDTH = 340;
const GAP = 14;

export function GuidedTour({ segment }: { segment?: string | null }) {
  const pathname = usePathname();
  const router = useRouter();
  const [active, setActive] = useState(false);
  const [index, setIndex] = useState(0);
  const [rect, setRect] = useState<DOMRect | null>(null);
  const [cardPos, setCardPos] = useState<{ top: number; left: number } | null>(null);
  const waitingForTarget = useRef(false);
  const { registerTourStart, registerTourClose, setTourOpen } = useUiPanels();

  const steps = useMemo(() => buildSteps(segment), [segment]);
  const step = steps[index];

  // Auto-start on first visit (only inside the app, on the dashboard).
  useEffect(() => {
    if (typeof window === "undefined") return;
    const done = window.localStorage.getItem(STORAGE_KEY);
    if (!done && pathname === "/dashboard") {
      const t = window.setTimeout(() => {
        setTourOpen(true);
        setActive(true);
      }, 700);
      return () => window.clearTimeout(t);
    }
  }, [pathname, setTourOpen]);

  const finish = useCallback(() => {
    setActive(false);
    setTourOpen(false);
    setIndex(0);
    setRect(null);
    setCardPos(null);
    try {
      window.localStorage.setItem(STORAGE_KEY, "1");
    } catch {
      /* ignore */
    }
  }, [setTourOpen]);

  const measure = useCallback(() => {
    if (!step?.target) {
      setRect(null);
      setCardPos(null);
      return;
    }
    const el = document.querySelector(step.target) as HTMLElement | null;
    if (!el) {
      setRect(null);
      return;
    }
    const r = el.getBoundingClientRect();
    setRect(r);

    const vw = window.innerWidth;
    const vh = window.innerHeight;
    let placement = step.placement ?? "auto";
    if (placement === "auto") {
      if (r.right + CARD_WIDTH + GAP < vw) placement = "right";
      else if (r.left - CARD_WIDTH - GAP > 0) placement = "left";
      else if (r.bottom + 200 < vh) placement = "bottom";
      else placement = "top";
    }

    let top = 0;
    let left = 0;
    const estH = 190;
    switch (placement) {
      case "right":
        left = r.right + GAP;
        top = r.top + r.height / 2 - estH / 2;
        break;
      case "left":
        left = r.left - CARD_WIDTH - GAP;
        top = r.top + r.height / 2 - estH / 2;
        break;
      case "bottom":
        left = r.left + r.width / 2 - CARD_WIDTH / 2;
        top = r.bottom + GAP;
        break;
      case "top":
        left = r.left + r.width / 2 - CARD_WIDTH / 2;
        top = r.top - estH - GAP;
        break;
    }
    // Clamp to viewport.
    left = Math.max(GAP, Math.min(left, vw - CARD_WIDTH - GAP));
    top = Math.max(GAP, Math.min(top, vh - estH - GAP));
    setCardPos({ top, left });
  }, [step]);

  // When the step changes, navigate if needed then locate the target.
  useLayoutEffect(() => {
    if (!active) return;

    if (step?.route && pathname !== step.route) {
      waitingForTarget.current = true;
      router.push(step.route);
      return;
    }

    let tries = 0;
    let raf = 0;
    const tryLocate = () => {
      if (!step?.target) {
        measure();
        return;
      }
      const el = document.querySelector(step.target) as HTMLElement | null;
      if (el) {
        el.scrollIntoView({ block: "center", behavior: "smooth" });
        // give scroll a beat, then measure
        window.setTimeout(measure, 260);
        waitingForTarget.current = false;
      } else if (tries < 40) {
        tries += 1;
        raf = window.requestAnimationFrame(tryLocate);
      }
    };
    tryLocate();
    return () => window.cancelAnimationFrame(raf);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [active, index, pathname]);

  // Keep positions in sync on scroll/resize.
  useEffect(() => {
    if (!active) return;
    const onMove = () => measure();
    window.addEventListener("scroll", onMove, true);
    window.addEventListener("resize", onMove);
    return () => {
      window.removeEventListener("scroll", onMove, true);
      window.removeEventListener("resize", onMove);
    };
  }, [active, measure]);

  const next = useCallback(() => {
    if (index >= steps.length - 1) finish();
    else setIndex((i) => i + 1);
  }, [index, steps.length, finish]);

  const prev = useCallback(() => {
    setIndex((i) => Math.max(0, i - 1));
  }, []);

  // Keyboard nav.
  useEffect(() => {
    if (!active) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") finish();
      else if (e.key === "ArrowRight") next();
      else if (e.key === "ArrowLeft") prev();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [active, next, prev, finish]);

  const start = useCallback(() => {
    setIndex(0);
    setActive(true);
    setTourOpen(true);
  }, [setTourOpen]);

  // O gatilho do tour mora na sidebar / menu mobile. Registramos `start` no
  // contexto para eles chamarem direto - sem effect disparando setState.
  useEffect(() => {
    registerTourStart(start);
    registerTourClose(finish);
  }, [registerTourStart, registerTourClose, start, finish]);

  // Steps without a target render as a centered welcome/closing card.
  // Targeted steps stay hidden (offscreen) until their rect is measured.
  const centered = !step?.target;

  return (
    <>
      {active && (
        <>
          {/* Highlight ring around the target - the page stays fully visible & clickable */}
          {rect && !centered && (
            <div
              className="fixed z-[58] pointer-events-none rounded-xl ring-2 ring-blue-500 animate-tour-pulse"
              style={{
                top: rect.top - 6,
                left: rect.left - 6,
                width: rect.width + 12,
                height: rect.height + 12,
                boxShadow: "0 0 0 3px rgba(37,99,235,0.25)",
              }}
            />
          )}

          {/* Coach-mark card */}
          <div
            role="dialog"
            aria-modal="false"
            aria-label={step.title}
            className="fixed z-[60] rounded-2xl border border-neutral-200 dark:border-neutral-700 bg-white dark:bg-neutral-900 shadow-2xl shadow-slate-900/20 p-5"
            style={
              centered
                ? {
                    top: "50%",
                    left: "50%",
                    transform: "translate(-50%, -50%)",
                    width: "min(340px, calc(100vw - 28px))",
                  }
                : cardPos
                ? { top: cardPos.top, left: cardPos.left, width: "min(340px, calc(100vw - 28px))" }
                : { top: -9999, left: -9999, width: "min(340px, calc(100vw - 28px))" }
            }
          >
            <div className="flex items-start justify-between gap-3 mb-2">
              <span className="inline-flex items-center gap-1.5 text-[11px] font-semibold uppercase tracking-wider text-blue-600 dark:text-blue-400">
                <Sparkles className="h-3.5 w-3.5" />
                Guia rápido
              </span>
              <button
                type="button"
                onClick={finish}
                className="text-neutral-400 hover:text-neutral-700 dark:hover:text-neutral-200 -mt-1 -mr-1 p-1"
                aria-label="Fechar tour"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            <h3 className="text-base font-bold tracking-tight">{step.title}</h3>
            <p className="text-sm text-neutral-600 dark:text-neutral-300 mt-1.5 leading-relaxed">
              {step.body}
            </p>

            {/* progress dots */}
            <div className="flex items-center gap-1.5 mt-4">
              {steps.map((_, i) => (
                <button
                  key={i}
                  type="button"
                  onClick={() => setIndex(i)}
                  aria-label={`Ir para o passo ${i + 1}`}
                  className={`h-1.5 rounded-full transition-all ${
                    i === index
                      ? "w-5 bg-blue-600"
                      : "w-1.5 bg-neutral-300 dark:bg-neutral-700 hover:bg-neutral-400"
                  }`}
                />
              ))}
            </div>

            <div className="flex items-center justify-between gap-2 mt-4">
              <button
                type="button"
                onClick={finish}
                className="text-xs text-neutral-500 hover:text-neutral-700 dark:hover:text-neutral-300"
              >
                Pular
              </button>
              <div className="flex items-center gap-2">
                {index > 0 && (
                  <button
                    type="button"
                    onClick={prev}
                    className="inline-flex items-center gap-1 rounded-lg border border-neutral-200 dark:border-neutral-700 px-3 py-1.5 text-sm font-medium hover:bg-neutral-50 dark:hover:bg-neutral-800 transition-colors"
                  >
                    <ArrowLeft className="h-4 w-4" />
                    Voltar
                  </button>
                )}
                <button
                  type="button"
                  onClick={next}
                  className="inline-flex items-center gap-1 rounded-lg bg-blue-600 text-white px-3.5 py-1.5 text-sm font-semibold hover:bg-blue-700 transition-colors shadow-sm shadow-blue-600/20"
                >
                  {index >= steps.length - 1 ? "Concluir" : "Próximo"}
                  {index < steps.length - 1 && <ArrowRight className="h-4 w-4" />}
                </button>
              </div>
            </div>
          </div>
        </>
      )}
    </>
  );
}
