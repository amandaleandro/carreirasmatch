"use client";

import { useEffect, useRef, useState, DragEvent, FormEvent } from "react";
import {
  Analysis,
  AnalysisResult,
  AnalysisTeaserView,
  LockedDeliverablesUpsell,
  SimpleFitTeaser,
  CAREER_TRACK_OPTIONS,
  CareerTrack,
} from "@/components/analysis-display";
import { AnalysisTeaser } from "@/lib/analysis-teaser";
import { UnlockDiagnosticButton } from "@/components/unlock-diagnostic-button";
import { LeadGate, getStoredLeadContact } from "@/components/lead-gate";
import { track, ANALYTICS_EVENTS } from "@/lib/analytics";
import { AnalysisTour } from "@/components/onboarding/analysis-tour";
import { useFeedback } from "@/components/feedback-provider";

type AnalysisWithId =
  | ({ id: string; unlocked: true; diagnosticPrice: string; loggedIn: boolean } & Analysis)
  | ({ id: string; unlocked: false; diagnosticPrice: string; loggedIn: boolean } & AnalysisTeaser);

const DRAFT_KEY = "carreiramatch:analyze-draft";

const TRACK_META: Record<
  CareerTrack,
  { title: string; description: string; icon: (props: { className?: string }) => React.JSX.Element }
> = {
  internship: {
    title: "Estágio / Trainee",
    description: "Buscando estágio, programa de trainee ou primeira oportunidade profissional.",
    icon: PersonIcon,
  },
  career_change: {
    title: "Transição de carreira",
    description: "Mudar de área ou função profissional.",
    icon: SwapIcon,
  },
  reemployment: {
    title: "Recolocação",
    description: "Retornando ao mercado de trabalho.",
    icon: RefreshIcon,
  },
  growth: {
    title: "Crescimento profissional",
    description: "Buscando evolução e melhores vagas.",
    icon: StarIcon,
  },
  apprentice: {
    title: "Jovem aprendiz",
    description: "Buscando vaga de aprendizagem.",
    icon: PersonIcon,
  },
};

function getInitialCareerTrack(
  suggestedTrack?: CareerTrack | null,
  lockedTrack?: CareerTrack | null,
  allowedTracks?: CareerTrack[] | null
): CareerTrack | "" {
  if (lockedTrack) return lockedTrack;

  const draftTrack = getInitialDraft().careerTrack;
  if (draftTrack && (!allowedTracks || allowedTracks.includes(draftTrack))) return draftTrack;

  if (typeof window !== "undefined") {
    const trackFromUrl = new URLSearchParams(window.location.search).get("track");
    if (
      trackFromUrl &&
      trackFromUrl in TRACK_META &&
      (!allowedTracks || allowedTracks.includes(trackFromUrl as CareerTrack))
    ) {
      return trackFromUrl as CareerTrack;
    }
  }

  if (suggestedTrack && (!allowedTracks || allowedTracks.includes(suggestedTrack))) {
    return suggestedTrack;
  }

  return "";
}

function getInitialDraft(): DraftState {
  if (typeof window === "undefined") return {};
  try {
    const draft = JSON.parse(localStorage.getItem(DRAFT_KEY) ?? "{}") as DraftState;
    if (draft.savedAt && Date.now() - draft.savedAt > DRAFT_MAX_AGE_MS) return {};
    return draft;
  } catch {
    return {};
  }
}

const CURIOSITIES = [
  "Recrutadores gastam, em média, apenas 7 segundos na primeira leitura de um currículo.",
  "Cerca de 75% das grandes empresas usam sistemas de ATS para filtrar currículos antes de um humano ler.",
  "Currículos com verbos de ação (\"liderei\", \"implementei\", \"reduzi\") têm mais chance de avançar na triagem.",
  "Incluir números e resultados concretos pode aumentar em até 40% o interesse do recrutador.",
  "Vagas no LinkedIn recebem em média 250 candidaturas, se destacar nos primeiros segundos é essencial.",
  "Erros de português ainda são o motivo nº 1 de descarte imediato de currículos no Brasil.",
  "Currículos de 1 página têm taxa de leitura completa maior que os de 2 páginas ou mais.",
  "Personalizar o currículo para cada vaga pode dobrar a taxa de resposta dos recrutadores.",
  "Como nossa análise mapeia as habilidades reais, ela funciona para qualquer profissão, não apenas tecnologia.",
];

const LOADING_MESSAGES = [
  "Lendo as informações do seu currículo...",
  "Analisando os requisitos e diferenciais da vaga...",
  "Cruzando suas competências com as palavras-chave...",
  "Avaliando score de aderência...",
  "Preparando recomendações de melhorias personalizadas...",
  "Gerando possíveis perguntas de entrevista..."
];

function useRotatingIndex(length: number, intervalMs: number) {
  const [index, setIndex] = useState(0);
  useEffect(() => {
    const timer = setInterval(() => setIndex((i) => (i + 1) % length), intervalMs);
    return () => clearInterval(timer);
  }, [length, intervalMs]);
  return index;
}

const RECEIVES = [
  { title: "Score de aderência", description: "Percentual de alinhamento com a vaga.", icon: TargetCheckIcon },
  { title: "Análise de Gaps", description: "Palavras-chave críticas que faltam no perfil.", icon: KeyIcon },
  { title: "Plano de evolução", description: "Recomendações de melhorias passo a passo.", icon: ListIcon },
  { title: "Perguntas de entrevista", description: "Perguntas prováveis baseadas na vaga.", icon: ChatIcon },
];

function PersonIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" className={className} stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2" />
      <circle cx="12" cy="7" r="4" />
    </svg>
  );
}
function SwapIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" className={className} stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="m16 3 4 4-4 4M20 7H4M8 21l-4-4 4-4M4 17h16" />
    </svg>
  );
}
function RefreshIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" className={className} stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M3 12a9 9 0 0 1 9-9 9.75 9.75 0 0 1 6.74 2.74L21 8" />
      <path d="M16 3h5v5M21 12a9 9 0 0 1-9 9 9.75 9.75 0 0 1-6.74-2.74L3 16" />
      <path d="M8 21H3v-5" />
    </svg>
  );
}
function StarIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" className={className} stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
    </svg>
  );
}
function TargetCheckIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" className={className} stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="12" r="10" />
      <polyline points="22 4 12 14.01 9 11.01" />
    </svg>
  );
}
function KeyIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" className={className} stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="m21 2-2 2m-7.61 7.61a5.5 5.5 0 1 1-7.778 7.778 5.5 5.5 0 0 1 7.777-7.777zm0 0L15.5 7.5m0 0 1.5 1.5M15.5 7.5 14 6" />
    </svg>
  );
}
function ListIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" className={className} stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <line x1="8" y1="6" x2="21" y2="6" />
      <line x1="8" y1="12" x2="21" y2="12" />
      <line x1="8" y1="18" x2="21" y2="18" />
      <line x1="3" y1="6" x2="3.01" y2="6" />
      <line x1="3" y1="12" x2="3.01" y2="12" />
      <line x1="3" y1="18" x2="3.01" y2="18" />
    </svg>
  );
}
function ChatIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" className={className} stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
    </svg>
  );
}
function LinkIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" className={className} stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71" />
      <path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71" />
    </svg>
  );
}
function BulbIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" className={className} stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M9 18h6M10 22h4M15.09 14c.502-.508.885-1.036 1.146-1.578A5.5 5.5 0 0 0 17 10a5 5 0 1 0-10 0c0 .89.283 1.719.764 2.422.261.542.644 1.07 1.146 1.578A3.5 3.5 0 0 1 10 16h4a3.5 3.5 0 0 1 1.09-2Z" />
    </svg>
  );
}
function PdfIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" className={className} stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
      <polyline points="14 2 14 8 20 8" />
      <line x1="16" y1="13" x2="8" y2="13" />
      <line x1="16" y1="17" x2="8" y2="17" />
      <polyline points="10 9 9 9 8 9" />
    </svg>
  );
}

const STEPS = [
  { n: 1, label: "Momento" },
  { n: 2, label: "Currículo e vaga" },
  { n: 3, label: "Resultado" },
] as const;

type DraftState = {
  careerTrack?: CareerTrack;
  jobTitle?: string;
  jobText?: string;
  jobLink?: string;
  pastFeedback?: string;
  savedAt?: number;
};

const DRAFT_MAX_AGE_MS = 7 * 24 * 60 * 60 * 1000;

function hasMeaningfulDraft(draft: DraftState): boolean {
  return Boolean(
    (draft.jobTitle && draft.jobTitle.trim()) ||
    (draft.jobText && draft.jobText.trim()) ||
    (draft.jobLink && draft.jobLink.trim())
  );
}

export function AnalyzeVagaPage({
  suggestedTrack,
  lockedTrack = null,
  allowedTracks = null,
  careerSegmentLabel = null,
  isAuthenticated = false,
  hideHero = false,
}: {
  suggestedTrack?: CareerTrack | null;
  lockedTrack?: CareerTrack | null;
  allowedTracks?: CareerTrack[] | null;
  careerSegmentLabel?: string | null;
  isAuthenticated?: boolean;
  /** Landing pages SEO têm hero/h1 próprios; esconde o cabeçalho interno para não duplicar h1. */
  hideHero?: boolean;
} = {}) {
  const { notify } = useFeedback();
  const initialDraft = getInitialDraft();
  const [file, setFile] = useState<File | null>(null);
  const [dragActive, setDragActive] = useState(false);
  const [careerTrack, setCareerTrack] = useState<CareerTrack | "">(() =>
    getInitialCareerTrack(suggestedTrack, lockedTrack, allowedTracks)
  );
  const trackOptions = allowedTracks
    ? CAREER_TRACK_OPTIONS.filter((o) => allowedTracks.includes(o.value))
    : CAREER_TRACK_OPTIONS;
  const curiosityIndex = useRotatingIndex(CURIOSITIES.length, 7000);
  useRotatingIndex(LOADING_MESSAGES.length, 3000);
  const [jobTitle, setJobTitle] = useState(initialDraft.jobTitle ?? "");
  const [jobText, setJobText] = useState(initialDraft.jobText ?? "");
  const [jobLink, setJobLink] = useState(initialDraft.jobLink ?? "");
  const [pastFeedback, setPastFeedback] = useState(initialDraft.pastFeedback ?? "");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [draftSaved, setDraftSaved] = useState(false);
  const [showRestoreBanner, setShowRestoreBanner] = useState(() => hasMeaningfulDraft(initialDraft));
  const [result, setResult] = useState<AnalysisWithId | null>(null);
  const [resultTrack, setResultTrack] = useState<CareerTrack | null>(null);
  const [resultJobTitle, setResultJobTitle] = useState("");
  const [leadUnlocked, setLeadUnlocked] = useState(() => Boolean(getStoredLeadContact()));
  const fileInputRef = useRef<HTMLInputElement>(null);
  const step2Ref = useRef<HTMLElement>(null);
  const jobTitleInputRef = useRef<HTMLInputElement>(null);

  const step1Done = careerTrack !== "";
  const currentStep = !step1Done ? 1 : 2;
  const selectedTrackMeta = careerTrack ? TRACK_META[careerTrack] : null;

  function saveDraft(showFeedback = true) {
    localStorage.setItem(
      DRAFT_KEY,
      JSON.stringify({ careerTrack, jobTitle, jobText, jobLink, pastFeedback, savedAt: Date.now() })
    );
    setDraftSaved(true);
    if (showFeedback) notify("success", "Rascunho salvo neste dispositivo.");
    setTimeout(() => setDraftSaved(false), 2000);
  }

  function discardDraft() {
    localStorage.removeItem(DRAFT_KEY);
    setJobTitle("");
    setJobText("");
    setJobLink("");
    setPastFeedback("");
    setShowRestoreBanner(false);
  }

  // Autosave silencioso: guarda o progresso a cada mudança (debounced), sem exigir
  // clique manual. O upload do PDF em si não sobrevive a reload (File não serializa
  // em localStorage), só os campos de texto da vaga.
  useEffect(() => {
    if (!hasMeaningfulDraft({ jobTitle, jobText, jobLink })) return;
    const timer = setTimeout(() => {
      localStorage.setItem(
        DRAFT_KEY,
        JSON.stringify({ careerTrack, jobTitle, jobText, jobLink, pastFeedback, savedAt: Date.now() })
      );
    }, 1500);
    return () => clearTimeout(timer);
  }, [careerTrack, jobTitle, jobText, jobLink, pastFeedback]);

  function handleDrop(e: DragEvent<HTMLDivElement>) {
    e.preventDefault();
    setDragActive(false);
    const dropped = e.dataTransfer.files?.[0];
    if (dropped && dropped.type === "application/pdf") setFile(dropped);
  }

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setError(null);

    if (!careerTrack) {
      setError("Escolha seu momento profissional para continuar.");
      return;
    }
    if (!file) {
      setError("Envie seu currículo em PDF.");
      return;
    }
    if (!jobText.trim() && !jobLink.trim()) {
      setError("Cole a descrição da vaga ou informe o link da vaga.");
      return;
    }

    setLoading(true);
    setResult(null);
    track(ANALYTICS_EVENTS.ANALYSIS_STARTED, { careerTrack });

    try {
      const finalJobText = jobLink.trim()
        ? `[Link da vaga]\n${jobLink.trim()}\n\n[Descrição da vaga]\n${
            jobText.trim() || "Não informada; candidato forneceu apenas o link acima."
          }`
        : jobText;

      const formData = new FormData();
      formData.append("resume", file);
      formData.append("careerTrack", careerTrack);
      formData.append("jobTitle", jobTitle);
      formData.append("jobText", finalJobText);
      if (careerTrack === "reemployment" && pastFeedback.trim()) {
        formData.append("pastFeedback", pastFeedback);
      }

      let res = await fetch("/api/analyze", { method: "POST", body: formData });
      let data = await res.json();
      if (!res.ok && res.status === 429 && data?.retryable) {
        await new Promise((resolve) => setTimeout(resolve, 4000));
        res = await fetch("/api/analyze", { method: "POST", body: formData });
        data = await res.json();
      }

      if (!res.ok) {
        throw new Error(data.error ?? "Erro ao processar a análise.");
      }

      localStorage.removeItem(DRAFT_KEY);
      setResult(data as AnalysisWithId);
      setResultTrack(careerTrack);
      setResultJobTitle(jobTitle);
      track(ANALYTICS_EVENTS.ANALYSIS_COMPLETED, { careerTrack, analysisId: data.id });
      notify("success", "Análise concluída. Seu resultado de Match está pronto.");
      track(ANALYTICS_EVENTS.DIAGNOSTIC_TEASER_VIEWED, {
        careerTrack,
        analysisId: data.id,
      });
    } catch (err) {
      const errorMsg = err instanceof Error ? err.message : "Erro inesperado.";
      track(ANALYTICS_EVENTS.ANALYSIS_FAILED, { careerTrack, error: errorMsg });
      saveDraft(false);
      setError(errorMsg);
      notify("error", errorMsg);
    } finally {
      setLoading(false);
    }
  }

  // Simulador de progresso realístico para a tela de loading
  const [activeStep, setActiveStep] = useState(1);
  useEffect(() => {
    if (!loading) return;
    const timers = [
      setTimeout(() => setActiveStep(2), 3500),
      setTimeout(() => setActiveStep(3), 7500),
      setTimeout(() => setActiveStep(4), 12000),
      setTimeout(() => setActiveStep(5), 18000),
    ];
    return () => timers.forEach(clearTimeout);
  }, [loading]);

  if (loading) {
    const loadingSteps = [
      { id: 1, label: "Lendo e extraindo texto do currículo PDF" },
      { id: 2, label: "Mapeando requisitos e competências da vaga" },
      { id: 3, label: "Cruzando habilidades e palavras-chave" },
      { id: 4, label: "Calculando o score de match de aderência" },
      { id: 5, label: "Estruturando plano de evolução e dicas" },
    ];

    return (
      <div className="min-h-[70vh] flex items-center justify-center p-4 font-sans bg-[#F8FAFC] dark:bg-[#071827]">
        <div className="max-w-md w-full bg-[#FFFFFF] dark:bg-neutral-900 border border-[#E2E8F0] dark:border-neutral-800 rounded-3xl p-6 space-y-6 animate-in fade-in zoom-in duration-300">
          
          {/* Radar Animado */}
          <div className="flex flex-col items-center text-center">
            <div className="relative h-14 w-14 flex items-center justify-center mb-3">
              <div className="absolute inset-0 rounded-full bg-[#2563EB]/10 border border-[#2563EB]/25 animate-ping" />
              <div className="absolute inset-2 rounded-full bg-[#2563EB]/20 animate-pulse" />
              <span className="text-xl z-10 animate-bounce">⚡</span>
            </div>
            <h2 className="text-base font-title font-bold text-[#071827] dark:text-white">Análise em Andamento</h2>
            <p className="text-[10px] text-[#64748B] mt-1 max-w-xs">
              Nossa inteligência artificial está processando seu diagnóstico de match. Isso pode levar alguns segundos.
            </p>
          </div>

          {/* Checklist de Etapas */}
          <div className="space-y-3 bg-[#F8FAFC] dark:bg-neutral-950/60 p-4 rounded-2xl border border-[#E2E8F0] dark:border-neutral-800">
            {loadingSteps.map((step) => {
              const isCompleted = activeStep > step.id;
              const isActive = activeStep === step.id;
              return (
                <div key={step.id} className="flex items-center gap-3 text-xs transition-all duration-300">
                  <span className={`h-5 w-5 rounded-full flex items-center justify-center text-[10px] font-bold shrink-0 transition-all ${
                    isCompleted
                      ? "bg-[#22C55E] text-white"
                      : isActive
                      ? "bg-[#2563EB] text-white animate-pulse"
                      : "bg-[#E2E8F0] dark:bg-neutral-800 text-neutral-400"
                  }`}>
                    {isCompleted ? "✓" : step.id}
                  </span>
                  <span className={`font-medium ${
                    isCompleted
                      ? "text-[#64748B] line-through decoration-slate-300 dark:decoration-slate-700"
                      : isActive
                      ? "text-[#071827] dark:text-white font-semibold"
                      : "text-slate-400"
                  }`}>
                    {step.label}
                  </span>
                </div>
              );
            })}
          </div>

          {/* Dica Rotativa (Curiosidades) */}
          <div className="border-t border-[#E2E8F0] dark:border-neutral-800 pt-4 flex gap-2.5 items-start">
            <span className="text-base">💡</span>
            <div className="min-w-0 flex-1">
              <span className="text-[9px] font-bold text-[#2563EB] uppercase tracking-wider block">Você sabia?</span>
              <p key={curiosityIndex} className="text-[11px] text-[#64748B] leading-relaxed mt-0.5 min-h-[36px] animate-[fadeIn_0.4s_ease]">
                {CURIOSITIES[curiosityIndex]}
              </p>
            </div>
          </div>

          {/* Barra de progresso genérica */}
          <div className="h-1 w-full bg-[#E2E8F0] dark:bg-neutral-800 rounded-full overflow-hidden">
            <div 
              className="h-full bg-[#2563EB] transition-all duration-1000 ease-out" 
              style={{ width: `${Math.min(activeStep * 20, 95)}%` }}
            />
          </div>
        </div>
      </div>
    );
  }

  if (result && resultTrack) {
    return (
      <div className="max-w-4xl mx-auto px-4 md:px-8 py-10 w-full space-y-5 font-sans bg-[#F8FAFC] dark:bg-[#071827]">
        <div className="flex items-center justify-between">
          <button
            type="button"
            onClick={() => setResult(null)}
            className="inline-flex items-center gap-1.5 text-xs font-bold text-[#2563EB] hover:text-[#1D4ED8] transition-colors cursor-pointer"
          >
            ← Fazer nova análise
          </button>
          {result.loggedIn && (
            <a
              href={`/report/${result.id}`}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1.5 text-xs font-bold text-[#64748B] hover:text-[#2563EB] transition-colors"
            >
              Ver em página cheia
              <svg viewBox="0 0 24 24" className="h-3.5 w-3.5" fill="none" stroke="currentColor" strokeWidth="2"><path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6M15 3h6v6M10 14 21 3"/></svg>
            </a>
          )}
        </div>
        {result.unlocked ? (
          <AnalysisResult result={result} careerTrack={resultTrack} jobTitle={resultJobTitle} />
        ) : !result.loggedIn && !leadUnlocked ? (
          <LeadGate
            source="resume_analysis"
            analysisId={result.id}
            title="Sua análise está pronta!"
            description="Preencha seus dados para ver se você tem aderência com essa vaga."
            onUnlocked={() => setLeadUnlocked(true)}
          />
        ) : !result.loggedIn ? (
          <SimpleFitTeaser result={result}>
            <LockedDeliverablesUpsell overallScore={result.overallScore}>
              <UnlockDiagnosticButton
                analysisId={result.id}
                price={result.diagnosticPrice}
                payerEmail={getStoredLeadContact()?.email}
              />
              <p className="text-[10px] text-[#64748B]">
                Vai aplicar para várias vagas?{" "}
                <a href="/assinar?segment=career_pro" className="font-bold text-[#2563EB] hover:underline">
                  Assine o Profissional por R$ 29,90/mês
                </a>{" "}
                e libere análises e kits dentro da cota do plano.
              </p>
              <p className="text-[10px] text-[#64748B]">
                Sem cadastro prévio: você paga e cria sua conta em seguida para acessar. Já tem conta?{" "}
                <a href="/login" className="font-bold text-[#2563EB] hover:underline">
                  Entrar
                </a>
                .
              </p>
            </LockedDeliverablesUpsell>
          </SimpleFitTeaser>
        ) : (
          <AnalysisTeaserView result={result}>
            <LockedDeliverablesUpsell overallScore={result.overallScore}>
              <UnlockDiagnosticButton analysisId={result.id} price={result.diagnosticPrice} />
              <p className="text-[10px] text-[#64748B]">
                Vai aplicar para várias vagas?{" "}
                <a href="/assinar?segment=career_pro" className="font-bold text-[#2563EB] hover:underline">
                  Assine o Profissional por R$ 29,90/mês
                </a>{" "}
                e libere análises e kits dentro da cota do plano desta e das próximas vagas.
              </p>
            </LockedDeliverablesUpsell>
          </AnalysisTeaserView>
        )}
      </div>
    );
  }

  return (
    <div className="px-4 md:px-8 py-5 max-w-[1200px] mx-auto w-full space-y-4 font-sans bg-[#F8FAFC] dark:bg-[#071827] text-foreground">
      {!isAuthenticated && !hideHero && (
        <a href="/gratuito" className="text-xs font-bold text-[#2563EB] hover:underline">
          ← Voltar para recursos gratuitos
        </a>
      )}

      {/* Cabeçalho Unificado (Banner Limpo) */}
      {!hideHero && (
      <div className="relative overflow-hidden rounded-2xl border border-[#E2E8F0] dark:border-neutral-800 bg-white dark:bg-neutral-900/60 px-5 py-5">
        <div className="relative flex flex-col gap-5 lg:flex-row lg:items-end lg:justify-between">
          <div className="space-y-2">

            <h1 className="text-2xl md:text-3xl font-title font-bold tracking-tight text-[#071827] dark:text-white">
              Você encontrou a vaga. Seu currículo está pronto?
            </h1>
            <p className="max-w-2xl text-xs leading-relaxed text-[#64748B]">
              Envie seu currículo e a descrição da oportunidade. Veja seu Match, as lacunas mais importantes e o que ajustar antes de se candidatar.
            </p>
            <div className="flex flex-wrap gap-1.5 pt-1">
              {["PDF de até 5 MB", "Match inicial grátis", "Qualquer profissão"].map((item) => (
                <span key={item} className="rounded-lg border border-[#E2E8F0] dark:border-neutral-800 bg-[#F8FAFC] dark:bg-neutral-800 px-2.5 py-1 text-[10px] font-semibold text-[#64748B]">
                  {item}
                </span>
              ))}
            </div>
          </div>

          {/* Stepper Display Compacto */}
          <div className="flex max-w-full shrink-0 items-center gap-1.5 overflow-x-auto rounded-2xl border border-[#E2E8F0] dark:border-neutral-800 bg-[#F8FAFC] dark:bg-neutral-900/40 p-2 shadow-sm">
            {STEPS.map((s, i) => (
              <div key={s.n} className="flex items-center gap-1.5 shrink-0">
                <span
                  className={`h-6 w-6 rounded-lg flex items-center justify-center text-[10px] font-bold transition-all shrink-0 ${
                    s.n === currentStep
                      ? "bg-[#2563EB] text-white shadow-sm shadow-[#2563EB]/25"
                      : s.n < currentStep
                      ? "bg-[#22C55E]/15 text-[#22C55E]"
                      : "bg-[#E2E8F0] dark:bg-neutral-800 text-neutral-400"
                  }`}
                >
                  {s.n < currentStep ? "✓" : s.n}
                </span>
                <span
                  className={`hidden sm:inline text-[10px] font-bold whitespace-nowrap ${
                    s.n === currentStep ? "text-[#071827] dark:text-neutral-200" : "text-[#64748B]"
                  }`}
                >
                  {s.label}
                </span>
                {i < STEPS.length - 1 && (
                  <div className="h-px w-4 sm:w-5 bg-[#E2E8F0] dark:bg-neutral-800 shrink-0" />
                )}
              </div>
            ))}
          </div>
        </div>
      </div>
      )}

      <AnalysisTour enabled={step1Done} />

      {showRestoreBanner && (
        <div className="mb-5 flex flex-col sm:flex-row sm:items-center justify-between gap-3 rounded-2xl border border-blue-200 dark:border-blue-900 bg-blue-50/60 dark:bg-blue-950/30 p-4">
          <div>
            <p className="text-xs font-bold text-blue-900 dark:text-blue-200">
              Você deixou uma análise em andamento.
            </p>
            <p className="text-[11px] text-blue-700/80 dark:text-blue-300/70 mt-0.5">
              {jobTitle ? `Vaga: ${jobTitle}. ` : ""}Recuperamos os dados que você já tinha preenchido. Falta só reenviar o currículo em PDF.
            </p>
          </div>
          <div className="flex items-center gap-2 shrink-0">
            <button
              type="button"
              onClick={() => setShowRestoreBanner(false)}
              className="rounded-xl bg-blue-600 hover:bg-blue-700 text-white px-3.5 py-2 text-xs font-bold transition-all cursor-pointer"
            >
              Continuar de onde parei
            </button>
            <button
              type="button"
              onClick={discardDraft}
              className="rounded-xl px-3.5 py-2 text-xs font-semibold text-blue-700/70 dark:text-blue-300/70 hover:text-blue-900 dark:hover:text-blue-200 transition-all cursor-pointer"
            >
              Descartar
            </button>
          </div>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-5">
        <div className="grid grid-cols-1 lg:grid-cols-[minmax(0,1fr)_320px] gap-5 items-start">
          
          {/* Lado Esquerdo: Formulário com Etapa 1 e Etapa 2 em sequência */}
          <div className="space-y-5">

            {/* Etapa 1 */}
            <section className="rounded-3xl border border-[#E2E8F0] dark:border-neutral-800 bg-[#FFFFFF] dark:bg-neutral-900/60 p-5 md:p-6 space-y-4">
              <div className="flex items-center gap-3">
                <span className="h-6 w-6 rounded-full bg-[#2563EB] text-white text-[10px] font-bold flex items-center justify-center shadow-sm">1</span>
                <div>
                  <h2 className="font-title font-bold text-sm md:text-base text-[#071827] dark:text-white">Momento profissional</h2>
                  <p className="text-[10px] text-[#64748B]">
                    {lockedTrack
                      ? "Definido a partir do momento profissional do seu perfil."
                      : "Selecione a opção que melhor reflete seu cenário atual de carreira."}
                  </p>
                </div>
              </div>

              {lockedTrack ? (
                <div className="flex items-center gap-4 rounded-2xl border border-[#E2E8F0] dark:border-neutral-800 bg-[#F8FAFC] dark:bg-neutral-950 p-4">
                  <span className="p-2.5 rounded-xl shrink-0 bg-[#2563EB] text-white shadow-sm">
                    {(() => {
                      const Icon = TRACK_META[lockedTrack].icon;
                      return <Icon className="h-4.5 w-4.5" />;
                    })()}
                  </span>
                  <div className="min-w-0 flex-1">
                    <p className="font-semibold text-xs md:text-sm">{TRACK_META[lockedTrack].title}</p>
                    <p className="text-[10px] text-[#64748B] mt-0.5">
                      {careerSegmentLabel ? `Perfil: ${careerSegmentLabel}` : TRACK_META[lockedTrack].description}
                    </p>
                  </div>
                  <a
                    href="/settings"
                    className="text-xs font-bold text-[#2563EB] hover:text-[#1D4ED8] whitespace-nowrap shrink-0 hover:underline"
                  >
                    Alterar em Perfil
                  </a>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  {trackOptions.map((option) => {
                    const meta = TRACK_META[option.value];
                    const Icon = meta.icon;
                    const active = careerTrack === option.value;
                    return (
                      <button
                        key={option.value}
                        data-testid={`career-track-${option.value}`}
                        type="button"
                        onClick={() => {
                          setCareerTrack(option.value);
                          setTimeout(() => {
                            jobTitleInputRef.current?.focus({ preventScroll: true });
                            step2Ref.current?.scrollIntoView({ behavior: "smooth", block: "start" });
                          }, 50);
                        }}
                        className={`group relative w-full min-h-[96px] flex items-start gap-3.5 text-left rounded-2xl border p-3.5 pr-10 transition-all active:scale-[0.99] cursor-pointer ${
                          active
                            ? "border-[#2563EB] bg-[#2563EB]/5 dark:bg-blue-950/25 text-[#071827] dark:text-white shadow-sm"
                            : "border-[#E2E8F0] dark:border-neutral-800 bg-[#FFFFFF] dark:bg-neutral-900 hover:border-[#2563EB] text-[#64748B] dark:text-neutral-300"
                        }`}
                      >
                        <span className={`p-2 rounded-xl shrink-0 ${active ? "bg-[#2563EB] text-white" : "bg-[#F8FAFC] dark:bg-slate-700/60 text-slate-400 group-hover:bg-[#2563EB]/10 group-hover:text-[#2563EB]"}`}>
                          <Icon className="h-4.5 w-4.5" />
                        </span>
                        <div className="min-w-0 w-full">
                          <p className="font-semibold text-xs md:text-sm leading-tight">{meta.title}</p>
                          <p className="text-[10px] text-[#64748B] mt-1 leading-relaxed">{meta.description}</p>
                        </div>
                        <span className={`absolute right-3 top-3 h-4 w-4 rounded-full border flex items-center justify-center shrink-0 ${active ? "border-[#2563EB]" : "border-[#E2E8F0] dark:border-neutral-700"}`}>
                          {active && <span className="h-2 w-2 rounded-full bg-[#2563EB]" />}
                        </span>
                      </button>
                    );
                  })}
                </div>
              )}

              {careerTrack === "reemployment" && (
                <div className="mt-3 pt-3 border-t border-[#E2E8F0] dark:border-neutral-800 space-y-1">
                  <label htmlFor="past-feedback" className="block text-[9px] font-bold text-[#64748B] uppercase tracking-wider">
                    Feedbacks recebidos (opcional)
                  </label>
                  <textarea
                    id="past-feedback"
                    value={pastFeedback}
                    onChange={(e) => setPastFeedback(e.target.value)}
                    rows={2}
                    placeholder="Cole aqui comentários recebidos de entrevistadores para análise..."
                    className="w-full rounded-xl border border-[#E2E8F0] dark:border-neutral-800 bg-[#F8FAFC] dark:bg-neutral-950 px-3 py-2 text-xs outline-none focus:border-[#2563EB] focus:ring-4 focus:ring-[#2563EB]/10 text-[#071827] dark:text-white"
                  />
                </div>
              )}
            </section>

            {/* Curiosidades */}
            <section className="relative overflow-hidden rounded-3xl border border-[#E2E8F0] dark:border-neutral-800 bg-[#FFFFFF] dark:bg-neutral-900/60 p-4 md:p-5">
              <div className="flex items-start gap-3">
                <span className="h-8 w-8 rounded-xl bg-[#2563EB]/15 text-[#2563EB] flex items-center justify-center shrink-0">
                  <BulbIcon className="h-4.5 w-4.5" />
                </span>
                <div className="min-w-0 flex-1">
                  <p className="text-[9px] font-bold uppercase tracking-wider text-[#2563EB]">Dica de carreira</p>
                  <p
                    key={curiosityIndex}
                    className="mt-1 text-xs leading-relaxed text-[#64748B] animate-[fadeIn_0.4s_ease]"
                  >
                    {CURIOSITIES[curiosityIndex]}
                  </p>
                </div>
              </div>
              <div className="mt-3 flex items-center gap-1">
                {CURIOSITIES.map((_, i) => (
                  <span
                    key={i}
                    className={`h-1.5 rounded-full transition-all ${
                      i === curiosityIndex ? "w-4 bg-[#2563EB]" : "w-1.5 bg-[#E2E8F0] dark:bg-neutral-800"
                    }`}
                  />
                ))}
              </div>
            </section>

            {/* Etapa 2: fica visualmente travada até a Etapa 1 ser concluída. Continua
                montada (não some do DOM) para o tour de onboarding sempre achar os
                elementos-alvo (#curriculo-upload, #vaga-input, #analisar-button). */}
            <section
              ref={step2Ref}
              role="group"
              aria-disabled={!step1Done}
              className={`relative rounded-3xl border border-[#E2E8F0] dark:border-neutral-800 bg-[#FFFFFF] dark:bg-neutral-900/60 p-5 md:p-6 space-y-4 transition-opacity ${
                step1Done ? "" : "opacity-40 pointer-events-none select-none"
              }`}
            >
              {!step1Done && (
                <div className="absolute inset-0 z-10 flex items-center justify-center rounded-3xl bg-white/40 dark:bg-neutral-900/40">
                  <span className="rounded-full border border-[#E2E8F0] bg-white px-4 py-1.5 text-[10px] font-bold text-[#64748B] shadow-sm dark:border-neutral-700 dark:bg-neutral-900">
                    Escolha seu momento profissional acima para continuar
                  </span>
                </div>
              )}
              <div className="flex items-center gap-3">
                <span className="h-6 w-6 rounded-full bg-[#2563EB] text-white text-[10px] font-bold flex items-center justify-center shadow-sm">2</span>
                <div>
                  <h2 className="font-title font-bold text-sm md:text-base text-[#071827] dark:text-white">Currículo e descrição da vaga</h2>
                  <p className="text-[10px] text-[#64748B]">Insira seu PDF e os detalhes da vaga que deseja analisar.</p>
                </div>
              </div>

              <div className="space-y-1 relative group">
                <label htmlFor="job-title" className="block text-[9px] font-bold text-[#64748B] uppercase tracking-wider group-focus-within:text-[#2563EB] transition-colors">Cargo desejado (opcional)</label>
                <div className="relative flex items-center">
                  <span className="absolute left-3 text-neutral-400 group-focus-within:text-[#2563EB] transition-colors">
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2 2v2m4 6h.01M5 20h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                    </svg>
                  </span>
                  <input
                    id="job-title"
                    ref={jobTitleInputRef}
                    type="text"
                    value={jobTitle}
                    onChange={(e) => setJobTitle(e.target.value)}
                    placeholder="Ex: Auxiliar Administrativo, Analista Financeiro..."
                    className="w-full rounded-xl border border-[#E2E8F0] bg-white pl-9.5 pr-4 py-2.5 text-xs outline-none focus:border-[#2563EB] focus:ring-4 focus:ring-[#2563EB]/10 text-[#071827] dark:border-white/10 dark:bg-white/[0.03] dark:text-white"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-[1fr_2fr] gap-5">
                {/* Upload PDF/DOCX */}
                <div className="space-y-1.5">
                  <label className="block text-[9px] font-bold text-[#64748B] uppercase tracking-wider">Seu currículo (PDF ou DOCX)</label>
                  <div
                    id="curriculo-upload"
                    onDragOver={(e) => {
                      e.preventDefault();
                      setDragActive(true);
                    }}
                    onDragLeave={() => setDragActive(false)}
                    onDrop={handleDrop}
                    onClick={() => fileInputRef.current?.click()}
                    className={`rounded-2xl border-2 border-dashed p-4 text-center cursor-pointer transition-all h-[220px] flex flex-col justify-center items-center ${
                      dragActive
                        ? "border-[#2563EB] bg-[#2563EB]/5 scale-[1.01]"
                        : "border-[#E2E8F0] bg-[#F8FAFC] dark:border-neutral-700 dark:bg-white/[0.03] hover:border-[#2563EB]/50 hover:bg-[#2563EB]/5"
                    }`}
                  >
                    <svg className={`h-6 w-6 mx-auto mb-2 transition-colors ${dragActive ? "text-[#2563EB]" : "text-slate-400"}`} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4M17 8l-5-5-5 5M12 3v12"/>
                    </svg>
                    <p className="text-xs text-[#071827] dark:text-neutral-300 font-bold">
                      Arraste seu arquivo PDF ou Word (.docx) aqui ou clique
                    </p>
                    <p className="text-[10px] text-[#64748B] mt-0.5">PDF ou Word .docx (máx. 10MB)</p>
                    <input
                      ref={fileInputRef}
                      type="file"
                      accept=".pdf,.docx,application/pdf,application/vnd.openxmlformats-officedocument.wordprocessingml.document"
                      onChange={(e) => setFile(e.target.files?.[0] ?? null)}
                      className="hidden"
                    />
                  </div>

                  {file && (
                    <div className="flex items-center gap-2.5 rounded-xl border border-[#22C55E]/15 bg-[#22C55E]/5 p-2.5 mt-2">
                      <PdfIcon className="h-5 w-5 text-[#22C55E] shrink-0" />
                      <div className="min-w-0 flex-1">
                        <p className="text-xs font-semibold truncate text-[#071827] dark:text-white">{file.name}</p>
                        <p className="text-[9px] text-[#64748B]">{Math.round(file.size / 1024)} KB</p>
                      </div>
                      <button
                        type="button"
                        onClick={() => setFile(null)}
                        className="text-[#64748B] hover:text-red-500 shrink-0 text-xs px-1 hover:scale-115 transition-transform cursor-pointer font-bold"
                        aria-label="Remover arquivo"
                      >
                        ✕
                      </button>
                    </div>
                  )}
                </div>

                {/* Requisitos Text Area */}
                <div className="space-y-1.5 flex flex-col">
                  <label htmlFor="vaga-input" className="block text-[9px] font-bold text-[#64748B] uppercase tracking-wider">Requisitos / Descrição da vaga</label>
                  <textarea
                    id="vaga-input"
                    value={jobText}
                    onChange={(e) => setJobText(e.target.value)}
                    placeholder="Cole os requisitos, atribuições e detalhes da vaga anunciada aqui..."
                    className="w-full flex-1 min-h-[220px] rounded-2xl border border-[#E2E8F0] bg-white px-4 py-2.5 text-xs outline-none focus:border-[#2563EB] focus:ring-4 focus:ring-[#2563EB]/10 text-[#071827] dark:border-white/10 dark:bg-white/[0.03] dark:text-white resize-none"
                  />
                  <p className="text-[9px] text-[#64748B] self-end mt-1">{jobText.length} caracteres digitados</p>
                </div>
              </div>

              {/* Link Opcional */}
              <div className="pt-3 border-t border-[#E2E8F0] dark:border-neutral-800 space-y-1.5">
                <label htmlFor="job-link" className="flex items-center gap-1.5 text-xs font-bold text-[#2563EB] cursor-pointer">
                  <LinkIcon className="h-3.5 w-3.5" />
                  Inserir link da vaga (LinkedIn, Gupy, etc.)
                </label>
                <div className="relative flex items-center">
                  <span className="absolute left-3 text-neutral-400">
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1" />
                    </svg>
                  </span>
                  <input
                    id="job-link"
                    type="url"
                    value={jobLink}
                    onChange={(e) => setJobLink(e.target.value)}
                    placeholder="https://..."
                    className="w-full rounded-xl border border-[#E2E8F0] bg-white pl-9.5 pr-4 py-2.5 text-xs outline-none focus:border-[#2563EB] focus:ring-4 focus:ring-[#2563EB]/10 text-[#071827] dark:border-white/10 dark:bg-white/[0.03] dark:text-white"
                  />
                </div>
              </div>

              {/* Botões de Ação integrados dentro do card para evitar elementos soltos/flutuantes */}
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-end gap-3 pt-4 border-t border-[#E2E8F0] dark:border-neutral-800">
                {error && (
                  <div className="sm:mr-auto p-2.5 rounded-lg bg-[#EF4444]/10 border border-[#EF4444]/20 text-[11px] font-semibold text-[#EF4444] animate-shake">
                    ⚠️ {error}
                  </div>
                )}
                <div className="flex gap-3 w-full sm:w-auto">
                  <button
                    type="button"
                    onClick={() => saveDraft()}
                    className="flex-1 sm:flex-none rounded-xl border border-[#E2E8F0] bg-white text-[#64748B] font-semibold px-5 py-2 text-xs transition-all hover:bg-[#F8FAFC] active:scale-[0.98] cursor-pointer"
                  >
                    {draftSaved ? "Salvo ✓" : "Salvar Rascunho"}
                  </button>
                  <button
                    id="analisar-button"
                    type="submit"
                    disabled={loading}
                    className="flex-1 sm:flex-none min-h-11 rounded-xl bg-[#2563EB] px-6 py-2 text-xs font-semibold text-white shadow-sm hover:bg-[#1D4ED8] transition-all active:scale-[0.98] cursor-pointer disabled:opacity-50"
                  >
                    {loading ? "Calculando Match..." : "Calcular meu Match grátis →"}
                  </button>
                </div>
              </div>
            </section>

          </div>

          {/* Lado Direito: O que vai receber + Como Funciona (Sticky) */}
          <aside className="space-y-4 lg:sticky lg:top-6">
            
            {/* Benefícios */}
            <div className="rounded-3xl border border-[#E2E8F0] dark:border-neutral-800 bg-[#FFFFFF] dark:bg-neutral-900/60 p-5 space-y-4">
              <div>
                <h2 className="font-title font-bold text-xs md:text-sm text-[#071827] dark:text-white flex items-center gap-1.5">
                  <span>📋</span> O que você vai receber
                </h2>
                <p className="text-[10px] text-[#64748B] mt-0.5">Diagnósticos estratégicos completos.</p>
              </div>

              <div className="rounded-2xl border border-[#E2E8F0] dark:border-neutral-800 bg-[#F8FAFC] dark:bg-neutral-950 p-3.5">
                <p className="text-[9px] font-bold uppercase tracking-wider text-[#2563EB]">Resumo da análise</p>
                <p className="mt-1 text-xs font-bold text-[#071827] dark:text-white">
                  {selectedTrackMeta ? selectedTrackMeta.title : "Escolha seu momento"}
                </p>
                <div className="mt-2.5 grid grid-cols-2 gap-1.5 text-[9px] text-center font-bold">
                  <span className={`rounded-lg py-1.5 px-2 ${file ? "bg-[#22C55E]/15 text-[#22C55E]" : "bg-[#F8FAFC] dark:bg-neutral-800 text-[#64748B] border border-[#E2E8F0] dark:border-neutral-700"}`}>
                    {file ? "PDF anexado ✓" : "PDF pendente"}
                  </span>
                  <span className={`rounded-lg py-1.5 px-2 ${jobText.trim() || jobLink.trim() ? "bg-[#22C55E]/15 text-[#22C55E]" : "bg-[#F8FAFC] dark:bg-neutral-800 text-[#64748B] border border-[#E2E8F0] dark:border-neutral-700"}`}>
                    {jobText.trim() || jobLink.trim() ? "Vaga informada ✓" : "Vaga pendente"}
                  </span>
                </div>
              </div>

              <div className="space-y-2">
                {RECEIVES.map((item) => {
                  const Icon = item.icon;
                  return (
                    <div key={item.title} className="flex gap-2.5 rounded-xl border border-[#E2E8F0] dark:border-neutral-800 bg-[#F8FAFC] dark:bg-neutral-950/40 p-2.5">
                      <span className="h-8 w-8 rounded-lg bg-white dark:bg-blue-950/40 text-[#2563EB] flex items-center justify-center shrink-0 border border-[#E2E8F0] dark:border-neutral-800">
                        <Icon className="h-4 w-4" />
                      </span>
                      <div>
                        <p className="text-[11px] font-bold text-[#071827] dark:text-white">{item.title}</p>
                        <p className="text-[9px] text-[#64748B] mt-0.5 leading-relaxed">{item.description}</p>
                      </div>
                    </div>
                  );
                })}
              </div>

              <div className="border-t border-[#E2E8F0] dark:border-neutral-800 pt-3 text-[9px] text-[#64748B] flex items-start gap-2 leading-relaxed">
                <span className="h-4 w-4 rounded-full border border-[#E2E8F0] dark:border-slate-600 flex items-center justify-center shrink-0 font-bold text-[9px]">✓</span>
                <p>Criptografia ativa. Seus dados estão 100% seguros e confidenciais.</p>
              </div>
            </div>

            {/* Como Funciona o Algoritmo (Preenche o espaço em branco lateral perfeitamente) */}
            <div className="rounded-3xl border border-[#E2E8F0] dark:border-neutral-800 bg-[#FFFFFF] dark:bg-neutral-900/60 p-5 space-y-3.5">
              <div>
                <h3 className="font-title font-bold text-xs md:text-sm text-[#071827] dark:text-white">Como a análise funciona?</h3>
                <p className="text-[10px] text-[#64748B] mt-0.5">Entenda as etapas da nossa tecnologia.</p>
              </div>
              <div className="space-y-3 pt-1 text-[11px] text-[#64748B]">
                <div className="relative pl-5 border-l border-[#E2E8F0] dark:border-neutral-800 space-y-0.5">
                  <div className="absolute left-[-4.5px] top-1 w-2 h-2 rounded-full bg-[#2563EB]" />
                  <span className="font-bold text-[#071827] dark:text-white block">1. Processamento de PDF</span>
                  <span>Extraímos competências, formação e histórico real do seu currículo.</span>
                </div>
                <div className="relative pl-5 border-l border-[#E2E8F0] dark:border-neutral-800 space-y-0.5">
                  <div className="absolute left-[-4.5px] top-1 w-2 h-2 rounded-full bg-[#2563EB]" />
                  <span className="font-bold text-[#071827] dark:text-white block">2. Mapeamento de Vaga</span>
                  <span>Lemos as entrelinhas da vaga para mapear diferenciais que recrutadores valorizam.</span>
                </div>
                <div className="relative pl-5 space-y-0.5">
                  <div className="absolute left-[-4.5px] top-1 w-2 h-2 rounded-full bg-[#2563EB]" />
                  <span className="font-bold text-[#071827] dark:text-white block">3. Relatório Comparativo</span>
                  <span>Entregamos a porcentagem de Match e apontamos os exatos gaps de habilidades.</span>
                </div>
              </div>
            </div>

          </aside>
        </div>
      </form>
    </div>
  );
}
