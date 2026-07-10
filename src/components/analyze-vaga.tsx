"use client";

import { useEffect, useRef, useState, DragEvent, FormEvent } from "react";
import {
  Analysis,
  AnalysisResult,
  AnalysisTeaserView,
  SimpleFitTeaser,
  CAREER_TRACK_OPTIONS,
  CareerTrack,
} from "@/components/analysis-display";
import { AnalysisTeaser } from "@/lib/analysis-teaser";
import { UnlockDiagnosticButton } from "@/components/unlock-diagnostic-button";
import { LeadGate, getStoredLeadContact } from "@/components/lead-gate";

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
    return JSON.parse(localStorage.getItem(DRAFT_KEY) ?? "{}") as DraftState;
  } catch {
    return {};
  }
}

const CURIOSITIES = [
  "Recrutadores gastam, em média, apenas 7 segundos na primeira leitura de um currículo.",
  "Cerca de 75% das grandes empresas usam sistemas de ATS para filtrar currículos antes de um humano ler.",
  "Currículos com verbos de ação (\"liderei\", \"implementei\", \"reduzi\") têm mais chance de avançar na triagem.",
  "Incluir números e resultados concretos pode aumentar em até 40% o interesse do recrutador.",
  "Vagas no LinkedIn recebem em média 250 candidaturas — se destacar nos primeiros segundos é essencial.",
  "Erros de português ainda são o motivo nº 1 de descarte imediato de currículos no Brasil.",
  "Currículos de 1 página têm taxa de leitura completa maior que os de 2 páginas ou mais.",
  "Personalizar o currículo para cada vaga pode dobrar a taxa de resposta dos recrutadores.",
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
] as const;

type DraftState = {
  careerTrack?: CareerTrack;
  jobTitle?: string;
  jobText?: string;
  jobLink?: string;
  pastFeedback?: string;
};

export function AnalyzeVagaPage({
  suggestedTrack,
  lockedTrack = null,
  allowedTracks = null,
  careerSegmentLabel = null,
}: {
  suggestedTrack?: CareerTrack | null;
  /** Set when the logged-in user has a paid plan and their profile's "momento profissional"
   * maps unambiguously to a single track: the track selector is hidden and this value is forced. */
  lockedTrack?: CareerTrack | null;
  /** Set when the logged-in user has a paid plan; restricts the track selector to values
   * compatible with the "momento profissional" set on their profile. */
  allowedTracks?: CareerTrack[] | null;
  careerSegmentLabel?: string | null;
} = {}) {
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
  const [jobTitle, setJobTitle] = useState(initialDraft.jobTitle ?? "");
  const [jobText, setJobText] = useState(initialDraft.jobText ?? "");
  const [jobLink, setJobLink] = useState(initialDraft.jobLink ?? "");
  const [pastFeedback, setPastFeedback] = useState(initialDraft.pastFeedback ?? "");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [draftSaved, setDraftSaved] = useState(false);
  const [result, setResult] = useState<AnalysisWithId | null>(null);
  const [resultTrack, setResultTrack] = useState<CareerTrack | null>(null);
  const [resultJobTitle, setResultJobTitle] = useState("");
  const [leadUnlocked, setLeadUnlocked] = useState(() => Boolean(getStoredLeadContact()));
  const fileInputRef = useRef<HTMLInputElement>(null);

  const step1Done = careerTrack !== "";
  const currentStep = !step1Done ? 1 : 2;
  const selectedTrackMeta = careerTrack ? TRACK_META[careerTrack] : null;

  function saveDraft() {
    localStorage.setItem(
      DRAFT_KEY,
      JSON.stringify({ careerTrack, jobTitle, jobText, jobLink, pastFeedback })
    );
    setDraftSaved(true);
    setTimeout(() => setDraftSaved(false), 2000);
  }

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
    if (!jobTitle.trim()) {
      setError("Informe o cargo desejado.");
      return;
    }
    if (!jobText.trim() && !jobLink.trim()) {
      setError("Cole a descrição da vaga ou informe o link da vaga.");
      return;
    }

    setLoading(true);
    setResult(null);

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

      const res = await fetch("/api/analyze", { method: "POST", body: formData });
      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error ?? "Erro ao processar a análise.");
      }

      localStorage.removeItem(DRAFT_KEY);
      setResult(data as AnalysisWithId);
      setResultTrack(careerTrack);
      setResultJobTitle(jobTitle);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Erro inesperado.");
    } finally {
      setLoading(false);
    }
  }

  if (result && resultTrack) {
    return (
      <div className="max-w-4xl mx-auto px-4 md:px-8 py-12 w-full space-y-6">
        <div className="flex items-center justify-between">
          <button
            type="button"
            onClick={() => setResult(null)}
            className="inline-flex items-center gap-2 text-sm font-semibold text-blue-600 dark:text-blue-400 hover:text-blue-700 transition-colors"
          >
            ← Fazer nova análise
          </button>
          {result.loggedIn && (
            <a
              href={`/report/${result.id}`}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1.5 text-sm font-semibold text-neutral-700 dark:text-neutral-300 hover:text-blue-600 transition-colors"
            >
              Ver em página cheia
              <svg viewBox="0 0 24 24" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="2"><path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6M15 3h6v6M10 14 21 3"/></svg>
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
            <div className="rounded-xl border border-blue-200 dark:border-blue-900 bg-blue-50/40 dark:bg-blue-950/20 p-5 space-y-3">
              <h3 className="font-semibold">Quer o diagnóstico completo?</h3>
              <p className="text-sm text-neutral-600 dark:text-neutral-400">
                Score detalhado, palavras-chave, currículo otimizado, plano de estudo, perguntas de entrevista e mensagem pronta para o recrutador.
              </p>
              <a
                href="/register"
                className="inline-flex w-full sm:w-auto items-center justify-center rounded-md bg-blue-600 text-white font-medium px-5 py-2.5 text-sm hover:bg-blue-700 transition-colors"
              >
                {`Criar conta grátis e desbloquear por ${result.diagnosticPrice}`}
              </a>
            </div>
          </SimpleFitTeaser>
        ) : (
          <AnalysisTeaserView result={result}>
            <div className="rounded-xl border border-blue-200 dark:border-blue-900 bg-blue-50/40 dark:bg-blue-950/20 p-5 space-y-3">
              <h3 className="font-semibold">Quer o diagnóstico completo?</h3>
              <p className="text-sm text-neutral-600 dark:text-neutral-400">
                Currículo otimizado, plano de estudo, perguntas de entrevista e mensagem pronta para o recrutador.
              </p>
              <UnlockDiagnosticButton analysisId={result.id} price={result.diagnosticPrice} />
            </div>
          </AnalysisTeaserView>
        )}
      </div>
    );
  }

  return (
    <div className="px-4 md:px-8 py-7 max-w-[1240px] mx-auto w-full space-y-6">
      {/* Top Banner and Header */}
      <div className="relative overflow-hidden rounded-3xl border border-blue-100 bg-[linear-gradient(135deg,#f8fbff_0%,#eef5ff_48%,#fff7ed_100%)] px-5 py-6 shadow-sm dark:border-white/10 dark:bg-[linear-gradient(135deg,#081225_0%,#0f1f3f_52%,#1b1730_100%)] md:px-7 md:py-7">
        <div className="absolute inset-y-0 right-0 hidden w-2/5 bg-[radial-gradient(circle_at_70%_35%,rgba(37,99,235,0.18),transparent_34%),radial-gradient(circle_at_50%_82%,rgba(245,158,11,0.16),transparent_32%)] lg:block" />
        <div className="relative flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
        <div className="space-y-3">
          <span className="inline-flex items-center gap-1.5 rounded-full border border-blue-100 bg-white/75 px-3 py-1 text-[11px] font-bold uppercase tracking-wider text-blue-700 shadow-sm dark:border-white/10 dark:bg-white/10 dark:text-blue-300">
            ✨ Inteligência Artificial
          </span>
          <h1 className="text-3xl md:text-4xl font-extrabold tracking-tight text-neutral-950 dark:text-white">
            Nova <span className="text-blue-600 dark:text-blue-500">análise</span> de vaga
          </h1>
          <p className="max-w-2xl text-sm leading-relaxed text-neutral-600 dark:text-neutral-300">
            Compare seu currículo em segundos, encontre gaps de palavras-chave e prepare seu roteiro de entrevista estruturado.
          </p>
          <div className="grid max-w-xl grid-cols-3 gap-2 pt-1">
            {["Score claro", "Gaps de ATS", "Roteiro pronto"].map((item) => (
              <span key={item} className="rounded-xl border border-white/70 bg-white/70 px-3 py-2 text-[11px] font-semibold text-neutral-700 shadow-sm dark:border-white/10 dark:bg-white/10 dark:text-neutral-200">
                {item}
              </span>
            ))}
          </div>
        </div>

        {/* Steps display */}
        <div className="flex max-w-full shrink-0 items-center gap-1.5 overflow-x-auto rounded-2xl border border-white/80 bg-white/85 p-2 shadow-sm dark:border-white/10 dark:bg-[#0f172a]/75 sm:gap-2">
          {STEPS.map((s, i) => (
            <div key={s.n} className="flex items-center gap-1.5 sm:gap-2 shrink-0">
              <span
                className={`h-7 w-7 rounded-lg flex items-center justify-center text-xs font-bold transition-all shrink-0 ${
                  s.n === currentStep
                    ? "bg-gradient-to-br from-blue-600 to-indigo-600 text-white shadow-md shadow-blue-500/25 scale-105"
                    : s.n < currentStep
                    ? "bg-emerald-500/15 text-emerald-600 dark:text-emerald-400"
                    : "bg-neutral-100 dark:bg-neutral-800 text-neutral-400"
                }`}
              >
                {s.n < currentStep ? "✓" : s.n}
              </span>
              <span
                className={`hidden sm:inline text-xs font-semibold whitespace-nowrap ${
                  s.n === currentStep ? "text-neutral-800 dark:text-neutral-200" : "text-neutral-400"
                }`}
              >
                {s.label}
              </span>
              {i < STEPS.length - 1 && (
                <div className="h-px w-4 sm:w-6 bg-neutral-200 dark:bg-neutral-800 shrink-0" />
              )}
            </div>
          ))}
        </div>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="grid grid-cols-1 lg:grid-cols-[minmax(0,1fr)_340px] gap-6 items-start">
        {/* Main interactive area */}
        <div className="space-y-6">

          {/* Step 1: Momento profissional */}
          <section className="rounded-2xl border border-neutral-200 dark:border-white/10 bg-white dark:bg-[#0d1629]/90 p-5 md:p-6 shadow-sm space-y-5">
            <div className="flex items-center gap-3">
              <span className="h-7 w-7 rounded-full bg-gradient-to-br from-blue-500 to-indigo-600 text-white text-xs font-bold flex items-center justify-center shadow-md shadow-blue-500/20">1</span>
              <div>
                <h2 className="font-bold text-base md:text-lg">Momento profissional</h2>
                <p className="text-xs text-neutral-500 dark:text-neutral-400">
                  {lockedTrack
                    ? "Definido a partir do momento profissional do seu perfil."
                    : "Selecione a opção que melhor reflete seu cenário atual de carreira."}
                </p>
              </div>
            </div>

            {lockedTrack ? (
              <div className="flex items-center gap-4 rounded-2xl border border-blue-200 bg-blue-50/70 p-4 dark:border-blue-900/50 dark:bg-blue-950/20">
                <span className="p-2.5 rounded-xl shrink-0 bg-blue-600 text-white shadow-md shadow-blue-500/10">
                  {(() => {
                    const Icon = TRACK_META[lockedTrack].icon;
                    return <Icon className="h-5 w-5" />;
                  })()}
                </span>
                <div className="min-w-0 flex-1">
                  <p className="font-semibold text-sm md:text-base">{TRACK_META[lockedTrack].title}</p>
                  <p className="text-xs text-neutral-500 dark:text-slate-400 mt-1">
                    {careerSegmentLabel ? `Perfil: ${careerSegmentLabel}` : TRACK_META[lockedTrack].description}
                  </p>
                </div>
                <a
                  href="/settings"
                  className="text-xs font-semibold text-blue-600 dark:text-blue-400 hover:text-blue-700 whitespace-nowrap shrink-0"
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
                    type="button"
                    onClick={() => setCareerTrack(option.value)}
                    className={`group relative w-full min-h-[116px] flex items-start gap-4 text-left rounded-2xl border p-4 pr-11 transition-all hover:-translate-y-0.5 ${
                      active
                        ? "border-blue-500 bg-blue-50/80 dark:bg-blue-950/25 text-neutral-900 dark:text-white shadow-[0_12px_30px_rgba(37,99,235,0.13)]"
                        : "border-neutral-200 dark:border-white/10 bg-white dark:bg-[#101b2e]/70 hover:border-blue-300 hover:shadow-sm text-neutral-700 dark:text-neutral-300"
                    }`}
                  >
                    <span className={`p-2.5 rounded-xl shrink-0 ${active ? "bg-blue-600 text-white shadow-md shadow-blue-500/10" : "bg-neutral-100 dark:bg-slate-700/60 text-neutral-500 dark:text-slate-300 group-hover:bg-blue-50 group-hover:text-blue-600 dark:group-hover:bg-blue-950/40"}`}>
                      <Icon className="h-5 w-5" />
                    </span>
                    <div className="min-w-0 w-full">
                      <p className="font-semibold text-sm md:text-base leading-tight text-balance">{meta.title}</p>
                      <p className="text-xs text-neutral-500 dark:text-slate-400 mt-1.5 leading-relaxed">{meta.description}</p>
                    </div>
                    <span className={`absolute right-4 top-4 h-5 w-5 rounded-full border flex items-center justify-center shrink-0 ${active ? "border-blue-600 bg-white dark:bg-blue-950" : "border-neutral-300 dark:border-neutral-700"}`}>
                      {active && <span className="h-2.5 w-2.5 rounded-full bg-blue-600" />}
                    </span>
                  </button>
                );
              })}
            </div>
            )}

            {careerTrack === "reemployment" && (
              <div className="mt-4 pt-4 border-t border-neutral-100 dark:border-white/10 space-y-1.5">
                <label className="block text-xs font-semibold text-neutral-500 dark:text-slate-400 uppercase tracking-wider">
                  Feedbacks recebidos (opcional)
                </label>
                <textarea
                  value={pastFeedback}
                  onChange={(e) => setPastFeedback(e.target.value)}
                  rows={3}
                  placeholder="Cole aqui comentários recebidos de entrevistadores para análise de pontos a ajustar"
                  className="w-full rounded-xl border border-neutral-200 dark:border-white/10 bg-transparent px-3 py-2.5 text-xs md:text-sm outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
                />
              </div>
            )}
          </section>

          {/* Curiosidades sobre currículos e recrutamento */}
          <section className="relative overflow-hidden rounded-2xl border border-blue-100 bg-[linear-gradient(135deg,#f8fbff_0%,#eef5ff_55%,#fff7ed_100%)] p-5 md:p-6 shadow-sm dark:border-white/10 dark:bg-[linear-gradient(135deg,#0d1629_0%,#0f1f3f_60%,#1b1730_100%)]">
            <div className="flex items-start gap-3">
              <span className="h-9 w-9 rounded-xl bg-amber-400/90 text-white flex items-center justify-center shrink-0 shadow-md shadow-amber-500/20">
                <BulbIcon className="h-5 w-5" />
              </span>
              <div className="min-w-0 flex-1">
                <p className="text-[11px] font-bold uppercase tracking-wider text-blue-700 dark:text-blue-300">Você sabia?</p>
                <p
                  key={curiosityIndex}
                  className="mt-1.5 text-sm leading-relaxed text-neutral-700 dark:text-neutral-200 animate-[fadeIn_0.4s_ease]"
                >
                  {CURIOSITIES[curiosityIndex]}
                </p>
              </div>
            </div>
            <div className="mt-4 flex items-center gap-1.5">
              {CURIOSITIES.map((_, i) => (
                <span
                  key={i}
                  className={`h-1.5 rounded-full transition-all ${
                    i === curiosityIndex ? "w-5 bg-blue-600" : "w-1.5 bg-blue-200 dark:bg-white/15"
                  }`}
                />
              ))}
            </div>
          </section>
        </div>

        {/* Sidebar stats panel */}
        <aside className="rounded-2xl border border-neutral-200 dark:border-white/10 bg-white dark:bg-[#0d1629]/90 p-6 shadow-sm space-y-6 lg:sticky lg:top-6">
          <div>
            <h2 className="font-bold text-sm md:text-base flex items-center gap-2">
              <span>📋</span> O que você vai receber
            </h2>
            <p className="text-[11px] text-neutral-400 mt-1">Abaixo estão as análises exclusivas geradas para seu perfil.</p>
          </div>

          <div className="rounded-2xl border border-blue-100 bg-blue-50/70 p-4 dark:border-blue-900/50 dark:bg-blue-950/20">
            <p className="text-[11px] font-bold uppercase tracking-wider text-blue-700 dark:text-blue-300">Resumo da análise</p>
            <p className="mt-2 text-sm font-semibold text-neutral-900 dark:text-white">
              {selectedTrackMeta ? selectedTrackMeta.title : "Escolha seu momento"}
            </p>
            <div className="mt-3 grid grid-cols-2 gap-2 text-[11px]">
              <span className={`rounded-lg px-2.5 py-2 font-semibold ${file ? "bg-emerald-50 text-emerald-700 dark:bg-emerald-950/30 dark:text-emerald-300" : "bg-white/80 text-neutral-500 dark:bg-white/10 dark:text-neutral-300"}`}>
                {file ? "PDF anexado" : "PDF pendente"}
              </span>
              <span className={`rounded-lg px-2.5 py-2 font-semibold ${jobText.trim() || jobLink.trim() ? "bg-emerald-50 text-emerald-700 dark:bg-emerald-950/30 dark:text-emerald-300" : "bg-white/80 text-neutral-500 dark:bg-white/10 dark:text-neutral-300"}`}>
                {jobText.trim() || jobLink.trim() ? "Vaga informada" : "Vaga pendente"}
              </span>
            </div>
          </div>

          <div className="space-y-3">
            {RECEIVES.map((item) => {
              const Icon = item.icon;
              return (
                <div key={item.title} className="flex gap-3 rounded-xl border border-neutral-100 bg-neutral-50/60 p-3 dark:border-white/10 dark:bg-white/[0.03]">
                  <span className="h-9 w-9 rounded-lg bg-white dark:bg-blue-950/40 text-blue-600 dark:text-blue-400 flex items-center justify-center shrink-0 border border-blue-100/50 dark:border-blue-900/50">
                    <Icon className="h-4.5 w-4.5" />
                  </span>
                  <div>
                    <p className="text-xs font-bold text-neutral-800 dark:text-white">{item.title}</p>
                    <p className="text-[10px] text-neutral-500 dark:text-slate-400 mt-0.5 leading-relaxed">{item.description}</p>
                  </div>
                </div>
              );
            })}
          </div>

          <div className="border-t border-neutral-100 dark:border-white/10 pt-4 text-[10px] text-neutral-500 dark:text-slate-400 flex items-start gap-2.5 leading-relaxed">
            <span className="h-4 w-4 rounded-full border border-neutral-300 dark:border-slate-600 flex items-center justify-center shrink-0 text-[8px] font-bold">✓</span>
            <p>Seus dados estão protegidos com criptografia e não são compartilhados com terceiros.</p>
          </div>
        </aside>
        </div>

        {/* Step 2: Currículo e Vaga */}
        <section className="rounded-2xl border border-neutral-200 dark:border-white/10 bg-white dark:bg-[#0d1629]/90 p-5 md:p-6 shadow-sm space-y-5">
            <div className="flex items-center gap-3">
              <span className="h-7 w-7 rounded-full bg-gradient-to-br from-blue-500 to-indigo-600 text-white text-xs font-bold flex items-center justify-center shadow-md shadow-blue-500/20">2</span>
              <div>
                <h2 className="font-bold text-base md:text-lg">Currículo e descrição da vaga</h2>
                <p className="text-xs text-neutral-500 dark:text-neutral-400">Insira seu PDF e os detalhes da vaga que deseja analisar.</p>
              </div>
            </div>

            <div className="space-y-1.5">
              <label className="block text-xs font-semibold text-neutral-500 dark:text-slate-400 uppercase tracking-wider">Cargo desejado</label>
              <input
                type="text"
                value={jobTitle}
                onChange={(e) => setJobTitle(e.target.value)}
                placeholder="Ex: DevOps Engenheiro Junior"
                className="w-full rounded-xl border border-neutral-200 bg-neutral-50/40 px-3.5 py-3 text-xs outline-none focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 dark:border-white/10 dark:bg-white/[0.03] md:text-sm"
              />
            </div>

            {/* Split layout in step 2: 1/3 for file upload, 2/3 for text area */}
            <div className="grid grid-cols-1 lg:grid-cols-[1fr_2fr] gap-6">
              {/* PDF upload box (1/3) */}
              <div className="space-y-2">
                <label className="block text-xs font-semibold text-neutral-500 dark:text-slate-400 uppercase tracking-wider">Seu currículo (PDF)</label>
                <div
                  onDragOver={(e) => {
                    e.preventDefault();
                    setDragActive(true);
                  }}
                  onDragLeave={() => setDragActive(false)}
                  onDrop={handleDrop}
                  onClick={() => fileInputRef.current?.click()}
                  className={`rounded-2xl border-2 border-dashed p-6 text-center cursor-pointer transition-all h-[260px] flex flex-col justify-center items-center ${
                    dragActive
                      ? "border-blue-500 bg-blue-50/50 dark:bg-blue-950/20 scale-[1.01]"
                      : "border-neutral-300 bg-neutral-50/40 dark:border-slate-600 dark:bg-white/[0.03] hover:border-blue-400 hover:bg-blue-50/30 dark:hover:bg-blue-950/10"
                  }`}
                >
                  <svg className={`h-8 w-8 mx-auto mb-2.5 transition-colors ${dragActive ? "text-blue-500" : "text-neutral-400"}`} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4M17 8l-5-5-5 5M12 3v12"/>
                  </svg>
                  <p className="text-xs text-neutral-600 dark:text-neutral-400 font-bold">
                    Arraste o PDF aqui ou clique
                  </p>
                  <p className="text-[10px] text-neutral-400 mt-1">Formatos suportados: PDF (máx. 10MB)</p>
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="application/pdf"
                    onChange={(e) => setFile(e.target.files?.[0] ?? null)}
                    className="hidden"
                  />
                </div>

                {file && (
                  <div className="flex items-center gap-3 rounded-xl border border-emerald-100 dark:border-emerald-950/50 bg-emerald-50/10 p-3">
                    <PdfIcon className="h-6 w-6 text-emerald-600 shrink-0" />
                    <div className="min-w-0 flex-1">
                      <p className="text-xs font-semibold truncate text-neutral-900 dark:text-white">{file.name}</p>
                      <p className="text-[10px] text-neutral-400">{Math.round(file.size / 1024)} KB</p>
                    </div>
                    <button
                      type="button"
                      onClick={() => setFile(null)}
                      className="text-neutral-400 hover:text-neutral-600 dark:hover:text-neutral-200 shrink-0 text-sm px-1.5"
                      aria-label="Remover arquivo"
                    >
                      ✕
                    </button>
                  </div>
                )}
              </div>

              {/* Job description input (2/3) - expanded height to allow longer descriptions */}
              <div className="space-y-2 flex flex-col">
                <label className="block text-xs font-semibold text-neutral-500 dark:text-slate-400 uppercase tracking-wider">Requisitos / Descrição da vaga</label>
                <textarea
                  value={jobText}
                  onChange={(e) => setJobText(e.target.value)}
                  placeholder="Cole os requisitos, atribuições, diferenciais e todos os detalhes da descrição da vaga aqui..."
                  className="w-full flex-1 min-h-[260px] rounded-2xl border border-neutral-200 bg-neutral-50/40 px-4 py-3.5 text-xs outline-none focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 dark:border-white/10 dark:bg-white/[0.03] md:text-sm"
                />
                <p className="text-[10px] text-neutral-400">{jobText.length} caracteres adicionados</p>
              </div>
            </div>

            {/* Job link fallback */}
            <div className="pt-3 border-t border-neutral-100 dark:border-white/10 space-y-1.5">
              <label className="flex items-center gap-1.5 text-xs font-semibold text-blue-600 dark:text-blue-400 cursor-pointer">
                <LinkIcon className="h-4 w-4" />
                Inserir link da vaga (LinkedIn, Gupy, etc.)
              </label>
              <input
                type="url"
                value={jobLink}
                onChange={(e) => setJobLink(e.target.value)}
                placeholder="https://..."
                className="w-full rounded-xl border border-neutral-200 bg-neutral-50/40 px-3.5 py-3 text-xs outline-none focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 dark:border-white/10 dark:bg-white/[0.03] md:text-sm"
              />
            </div>
          </section>

          {/* Action buttons */}
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-end gap-3 pt-2">
            {error && (
              <div className="sm:mr-auto space-y-2 order-first sm:order-none">
                <p className="text-xs font-semibold text-red-500">{error}</p>
              </div>
            )}
            <div className="flex gap-3">
              <button
                type="button"
                onClick={saveDraft}
                className="flex-1 sm:flex-none rounded-xl border border-neutral-300 bg-white font-semibold px-6 py-3 text-xs transition-colors hover:bg-neutral-50 dark:border-slate-600 dark:bg-transparent dark:hover:bg-slate-900"
              >
                {draftSaved ? "Salvo ✓" : "Salvar Rascunho"}
              </button>
              <button
                type="submit"
                disabled={loading}
                className="flex-1 sm:flex-none rounded-xl bg-blue-600 px-7 py-3 text-xs font-semibold text-white shadow-sm shadow-blue-600/20 transition-all hover:bg-blue-700 hover:shadow-md disabled:opacity-50"
              >
                {loading ? "Analisando..." : "Analisar Vaga →"}
              </button>
            </div>
          </div>
      </form>
    </div>
  );
}
