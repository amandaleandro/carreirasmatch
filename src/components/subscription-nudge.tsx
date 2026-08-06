"use client";

import { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState } from "react";
import { usePathname } from "next/navigation";
import Link from "next/link";
import { ArrowRight, CheckCircle2, X } from "lucide-react";

type NudgeReason = "engagement" | "exit" | "limit";

type SubscriptionNudge = {
  openNudge: (reason: NudgeReason) => void;
};

const SubscriptionNudgeContext = createContext<SubscriptionNudge | null>(null);

const SESSION_KEY = "subscription-nudge:shown";
const SUPPRESSED_PREFIXES = ["/assinar", "/rota-profissional", "/plano-de-candidatura", "/login", "/register", "/empresa", "/parceiro"];

const COPY: Record<NudgeReason, { eyebrow: string; title: string; body: string }> = {
  engagement: {
    eyebrow: "Aceleração de carreira",
    title: "Conheça o Plano Profissional",
    body: "Mais análises de currículo por mês, simulador interativo de entrevistas no modelo STAR e acompanhamento de vagas.",
  },
  exit: {
    eyebrow: "Plano Profissional",
    title: "Potencialize suas candidaturas",
    body: "Destrave mais análises de currículo por mês, simulador de entrevistas e acompanhamento completo. Cancele quando quiser.",
  },
  limit: {
    eyebrow: "Limite atingido",
    title: "Continue analisando",
    body: "Sua análise gratuita foi concluída. Assine o Plano Profissional para repetir o processo em cada vaga que desejar.",
  },
};

const BENEFITS = [
  "Mais análises de vaga e match por mês",
  "Simulador interativo de perguntas de entrevista",
  "Ajustes de palavras-chave para passar nos robôs (ATS)",
  "Modelos de mensagem direta para recrutadores",
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
      /* ignore */
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
      {/* Popups automáticos invasivos desativados para não incomodar o usuário */}
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

export function SubscriptionNudgeAutoOpen({ reason }: { reason: NudgeReason }) {
  const { openNudge } = useSubscriptionNudge();
  useEffect(() => {
    openNudge(reason);
  }, [openNudge, reason]);
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
        className="absolute inset-0 bg-slate-950/50 backdrop-blur-xs"
        onClick={onClose}
      />
      <section
        role="dialog"
        aria-modal="true"
        className="relative w-full max-w-md overflow-hidden rounded-3xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-2xl p-6 space-y-5"
      >
        <button
          type="button"
          onClick={onClose}
          className="absolute right-4 top-4 rounded-xl p-1.5 text-slate-400 transition hover:bg-slate-100 hover:text-slate-700 dark:hover:bg-slate-800 dark:hover:text-white"
          aria-label="Fechar"
        >
          <X className="h-5 w-5" strokeWidth={1.9} />
        </button>

        <span className="inline-block rounded-full bg-blue-50 dark:bg-blue-950/40 text-blue-600 dark:text-blue-400 px-3 py-1 text-xs font-semibold">
          {copy.eyebrow}
        </span>

        <div className="space-y-2 pr-4">
          <h2 className="text-xl font-bold leading-tight text-slate-900 dark:text-white">{copy.title}</h2>
          <p className="text-sm leading-relaxed text-slate-600 dark:text-slate-300">{copy.body}</p>
        </div>

        <div className="space-y-2">
          {BENEFITS.map((benefit) => (
            <div key={benefit} className="flex items-center gap-2.5 text-xs font-semibold text-slate-800 dark:text-slate-200">
              <CheckCircle2 className="h-4 w-4 shrink-0 text-emerald-500" />
              <span>{benefit}</span>
            </div>
          ))}
        </div>

        <Link
          href={`/rota-profissional?segment=${encodeURIComponent(segment)}`}
          onClick={onClose}
          className="flex w-full items-center justify-center gap-2 rounded-full bg-blue-600 px-5 py-3 text-sm font-bold text-white shadow-sm shadow-blue-600/20 transition-all hover:bg-blue-700 active:scale-95"
        >
          Conhecer Plano Profissional
          <ArrowRight className="h-4 w-4" />
        </Link>

        <button
          type="button"
          onClick={onClose}
          className="w-full text-center text-xs font-semibold text-slate-500 hover:text-slate-800 dark:hover:text-white"
        >
          Agora não
        </button>
      </section>
    </div>
  );
}
