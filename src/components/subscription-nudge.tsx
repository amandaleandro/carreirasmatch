"use client";

import { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState } from "react";
import { usePathname } from "next/navigation";
import Link from "next/link";
import { ArrowRight, CheckCircle2, Sparkles, X } from "lucide-react";

type NudgeReason = "engagement" | "exit" | "limit";

type SubscriptionNudge = {
  openNudge: (reason: NudgeReason) => void;
};

const SubscriptionNudgeContext = createContext<SubscriptionNudge | null>(null);

// Um popup por sessão de navegador, não importa qual gatilho disparar primeiro -
// isso é o que evita a sensação de "site cheio de popup".
const SESSION_KEY = "subscription-nudge:shown";

// Páginas onde empurrar assinatura não faz sentido: é o próprio checkout, telas de
// autenticação ou áreas de empresa/parceiro (não é o público do plano candidato).
const SUPPRESSED_PREFIXES = ["/assinar", "/login", "/register", "/empresa", "/parceiro"];

const ENGAGEMENT_DELAY_MS = 60_000;

const COPY: Record<NudgeReason, { eyebrow: string; title: string; body: string }> = {
  engagement: {
    eyebrow: "Continue de onde parou",
    title: "Gostando do que viu até aqui?",
    body: "Isso é só uma fração do que dá pra fazer com o Plano Profissional: análises ilimitadas, simulador de entrevista e currículo otimizado por IA.",
  },
  exit: {
    eyebrow: "Antes de sair",
    title: "Leve seu diagnóstico completo com você",
    body: "Assine agora e destrave análises ilimitadas de currículo, simulador de entrevista e muito mais. Cancela quando quiser, com 1 clique.",
  },
  limit: {
    eyebrow: "Você já viu do que a IA é capaz",
    title: "Continue analisando sem parar",
    body: "Sua primeira análise completa foi por nossa conta. Assine o Plano Profissional para repetir isso em cada vaga que você quiser.",
  },
};

const BENEFITS = [
  "Análises de vaga & match ilimitados por IA",
  "Simulador interativo de perguntas de entrevista",
  "Ajustes de palavras-chave para passar nos robôs (ATS)",
  "Cartas de apresentação e mensagens para recrutadores",
];

export function SubscriptionNudgeProvider({
  children,
  enabled,
  segment,
}: {
  children: React.ReactNode;
  enabled: boolean;
  segment: string;
}) {
  const [reason, setReason] = useState<NudgeReason | null>(null);
  const shownRef = useRef(false);
  const pathname = usePathname();
  const suppressed = SUPPRESSED_PREFIXES.some((prefix) => pathname?.startsWith(prefix));
  const active = enabled && !suppressed;

  useEffect(() => {
    try {
      if (window.sessionStorage.getItem(SESSION_KEY)) shownRef.current = true;
    } catch {
      /* sessionStorage indisponível (modo privado etc.): segue sem persistir entre abas */
    }
  }, []);

  const openNudge = useCallback(
    (nextReason: NudgeReason) => {
      if (!active || shownRef.current) return;
      shownRef.current = true;
      try {
        window.sessionStorage.setItem(SESSION_KEY, "1");
      } catch {
        /* ignore */
      }
      setReason(nextReason);
    },
    [active]
  );

  const close = useCallback(() => setReason(null), []);

  const value = useMemo(() => ({ openNudge }), [openNudge]);

  return (
    <SubscriptionNudgeContext.Provider value={value}>
      {children}
      {active && <AutoTriggers openNudge={openNudge} />}
      {reason && <NudgeModal reason={reason} segment={segment} onClose={close} />}
    </SubscriptionNudgeContext.Provider>
  );
}

export function useSubscriptionNudge(): SubscriptionNudge {
  const context = useContext(SubscriptionNudgeContext);
  if (!context) {
    throw new Error("useSubscriptionNudge precisa estar dentro de <SubscriptionNudgeProvider>.");
  }
  return context;
}

/** Dispara um gatilho contextual assim que o componente monta (ex.: página de resultado grátis). */
export function SubscriptionNudgeAutoOpen({ reason }: { reason: NudgeReason }) {
  const { openNudge } = useSubscriptionNudge();
  useEffect(() => {
    openNudge(reason);
  }, [openNudge, reason]);
  return null;
}

function AutoTriggers({ openNudge }: { openNudge: (reason: NudgeReason) => void }) {
  useEffect(() => {
    const timer = window.setTimeout(() => openNudge("engagement"), ENGAGEMENT_DELAY_MS);

    // Exit-intent: só dispara quando o mouse sai por cima da janela (movimento
    // típico de ir fechar a aba ou a barra de endereço), não em qualquer mouseleave.
    const onMouseLeave = (event: MouseEvent) => {
      if (event.clientY <= 0) openNudge("exit");
    };
    document.addEventListener("mouseleave", onMouseLeave);

    return () => {
      window.clearTimeout(timer);
      document.removeEventListener("mouseleave", onMouseLeave);
    };
  }, [openNudge]);

  return null;
}

function NudgeModal({
  reason,
  segment,
  onClose,
}: {
  reason: NudgeReason;
  segment: string;
  onClose: () => void;
}) {
  const copy = COPY[reason];

  useEffect(() => {
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") onClose();
    };
    document.addEventListener("keydown", onKeyDown);
    return () => document.removeEventListener("keydown", onKeyDown);
  }, [onClose]);

  return (
    <div className="fixed inset-0 z-[70] flex items-center justify-center px-4 py-6">
      <button
        type="button"
        aria-label="Fechar"
        className="absolute inset-0 bg-slate-950/55 backdrop-blur-sm"
        onClick={onClose}
      />
      <section
        role="dialog"
        aria-modal="true"
        className="relative w-full max-w-md overflow-hidden rounded-2xl border border-blue-200 dark:border-blue-900/60 bg-white dark:bg-slate-950 shadow-2xl shadow-slate-950/25 p-6 space-y-5"
      >
        <button
          type="button"
          onClick={onClose}
          className="absolute right-4 top-4 rounded-lg p-1.5 text-slate-400 transition hover:bg-slate-100 hover:text-slate-700 dark:hover:bg-slate-900 dark:hover:text-white"
          aria-label="Fechar"
        >
          <X className="h-5 w-5" strokeWidth={1.9} />
        </button>

        <span className="inline-flex items-center gap-1.5 rounded-full bg-blue-600 px-3 py-1 text-xs font-extrabold uppercase tracking-wider text-white">
          <Sparkles className="w-3.5 h-3.5" />
          {copy.eyebrow}
        </span>

        <div className="space-y-2 pr-4">
          <h2 className="text-xl font-extrabold leading-tight text-slate-900 dark:text-white">{copy.title}</h2>
          <p className="text-sm leading-relaxed text-slate-600 dark:text-slate-300">{copy.body}</p>
        </div>

        <div className="space-y-2">
          {BENEFITS.map((benefit) => (
            <div key={benefit} className="flex items-center gap-2.5 text-sm font-semibold text-slate-800 dark:text-slate-200">
              <CheckCircle2 className="h-4 w-4 shrink-0 text-emerald-500" />
              <span>{benefit}</span>
            </div>
          ))}
        </div>

        <Link
          href={`/assinar?segment=${encodeURIComponent(segment)}`}
          onClick={onClose}
          className="inline-flex w-full items-center justify-center gap-2 rounded-xl bg-blue-600 px-6 py-3 text-sm font-extrabold text-white shadow-md shadow-blue-500/20 transition-all hover:bg-blue-700"
        >
          <span>Assinar por R$ 24,90/mês</span>
          <ArrowRight className="h-4 w-4" />
        </Link>

        <button
          type="button"
          onClick={onClose}
          className="w-full text-center text-xs font-semibold text-slate-400 transition hover:text-slate-600 dark:hover:text-slate-300"
        >
          Agora não
        </button>
      </section>
    </div>
  );
}
