"use client";

import Link from "next/link";
import { useState, useEffect } from "react";
import { triggerConfetti } from "@/lib/confetti";
import { ChecklistCard } from "@/components/checklist-card";
import { track, ANALYTICS_EVENTS } from "@/lib/analytics";

import { InterviewSimulator } from "@/components/interview-simulator";
import { CircularScore } from "@/components/circular-score";
import {
  AtsResumeView,
  BulletDiagnosticsCard,
  ScorePercentileCard,
} from "@/components/resume-quality-cards";
import type { BulletAnalysisSummary } from "@/lib/bullet-analysis";
import { build3StepMakeovers } from "@/lib/bullet-analysis";
import type { StructuredResume } from "@/lib/groq";
import { ATSHelperModal } from "@/components/ATSHelperModal";
import { BulletPointMakeover } from "@/components/BulletPointMakeover";
import { ScoreBeforeAfter } from "@/components/score-before-after";
import { ShareMatchCard } from "@/components/share-match-card";
import { Download, FileText } from "lucide-react";

export type ApplicationStatus = "apply_now" | "adjust_first" | "deprioritize";

export type CareerTrack =
  | "internship"
  | "career_change"
  | "reemployment"
  | "growth"
  | "apprentice";

export type StudyPlanPhased = {
  essential: string[];
  niceToHave: string[];
  later: string[];
};

export type ExperienceSuggestion = {
  role: string;
  company: string;
  current: string;
  suggested: string;
};

export type AtsChecklistStatus = "pass" | "warning" | "fail";

export type AtsChecklistItem = {
  key: "formatting" | "clarity" | "keywords" | "results" | "seniority" | "links";
  label: string;
  description: string;
  status: AtsChecklistStatus;
};

export type Analysis = {
  overallScore: number;
  technicalScore: number;
  experienceScore: number;
  seniorityScore: number;
  atsScore: number;
  applicationStatus: ApplicationStatus;
  applicationStatusReason: string;
  keywordsFound: string[];
  keywordsMissing: string[];
  suggestedSummary: string;
  currentSummary?: string;
  strengths: string[];
  weaknesses: string[];
  fixes: string[];
  interviewQuestions: string[];
  studyPlan: StudyPlanPhased;
  recruiterMessage: string;
  alternativeRoles: string[];
  experienceSuggestions?: ExperienceSuggestion[];
  atsChecklist?: AtsChecklistItem[];
  talkAboutYourselfAnswer?: string | null;
  transferableSkills?: string[] | null;
  transitionNarrative?: string | null;
  whyCareerChangeAnswer?: string | null;
  bridgeRoles?: string[] | null;
  recruiterObjections?: string[] | null;
  applicationStrategy?: string | null;
  weeklyApplicationPlan?: string[] | null;
  feedbackAnalysis?: string | null;
  grammarErrors?: string[] | string | null;
  structureRating?: "excellent" | "good" | "needs_improvement" | string | null;
  structureFeedback?: string | null;
  missingBasicInfo?: string[] | string | null;
  jobDecoded?: JobDecodedTerm[] | string | null;
  jobRedFlags?: string[] | string | null;
  clarifyingQuestions?: ClarifyingQuestion[] | string | null;
};

export type JobDecodedTerm = {
  termo: string;
  significa: string;
  ouSeja: string;
};

export type ClarifyingQuestion = {
  question: string;
  why: string;
  targetKeyword: string;
};

export const CAREER_TRACK_OPTIONS: { value: CareerTrack; label: string }[] = [
  { value: "internship", label: "Estágio, trainee ou primeiro emprego" },
  { value: "career_change", label: "Transição de carreira" },
  { value: "reemployment", label: "Recolocação" },
  { value: "growth", label: "Vaga melhor / crescimento profissional" },
  { value: "apprentice", label: "Jovem aprendiz" },
];

export const TRACK_LABELS: Record<CareerTrack, string> = Object.fromEntries(
  CAREER_TRACK_OPTIONS.map((o) => [o.value, o.label])
) as Record<CareerTrack, string>;

const STATUS_CONFIG: Record<
  ApplicationStatus,
  { color: string; label: string; chipClass: string; dotClass: string }
> = {
  apply_now: {
    color: "#22C55E",
    label: "Recomendado aplicar agora",
    chipClass: "bg-[#22C55E]/10 text-[#22C55E] border-[#22C55E]/20",
    dotClass: "bg-[#22C55E]",
  },
  adjust_first: {
    color: "#F59E0B",
    label: "Ajustar currículo primeiro",
    chipClass: "bg-[#F59E0B]/10 text-[#F59E0B] border-[#F59E0B]/20",
    dotClass: "bg-[#F59E0B]",
  },
  deprioritize: {
    color: "#EF4444",
    label: "Não priorizar no momento",
    chipClass: "bg-[#EF4444]/10 text-[#EF4444] border-[#EF4444]/20",
    dotClass: "bg-[#EF4444]",
  },
};

const CARD =
  "rounded-3xl border border-[#E2E8F0] dark:border-neutral-800 bg-[#FFFFFF] dark:bg-neutral-900/40 p-5 md:p-6 shadow-[0_8px_30px_rgb(0,0,0,0.02)] transition-all duration-300";

type BadgeTone = "primary" | "success" | "danger" | "warning" | "neutral";

const BADGE_TONES: Record<BadgeTone, string> = {
  primary: "bg-[#2563EB]/10 text-[#2563EB] ring-[#2563EB]/20",
  success: "bg-[#22C55E]/10 text-[#22C55E] ring-[#22C55E]/20",
  danger: "bg-[#EF4444]/10 text-[#EF4444] ring-[#EF4444]/20",
  warning: "bg-[#F59E0B]/10 text-[#F59E0B] ring-[#F59E0B]/20",
  neutral: "bg-[#64748B]/10 text-[#64748B] ring-[#64748B]/20",
};

function CardHeader({
  icon,
  tone = "primary",
  title,
  aside,
}: {
  icon?: string;
  tone?: BadgeTone;
  title: string;
  aside?: React.ReactNode;
}) {
  return (
    <div className="mb-3.5 flex items-center gap-2.5">
      {icon && (
        <span
          aria-hidden
          className={`inline-flex h-7 w-7 shrink-0 items-center justify-center rounded-lg text-xs font-bold ring-1 ${BADGE_TONES[tone]}`}
        >
          {icon}
        </span>
      )}
      <h3 className="font-title font-bold text-xs md:text-sm text-[#071827] dark:text-white tracking-tight">{title}</h3>
      {aside && <span className="ml-auto text-[10px] font-extrabold text-[#64748B]">{aside}</span>}
    </div>
  );
}

type ListMarker = "dot" | "check" | "alert" | "number";

function Marker({ marker, index }: { marker: ListMarker; index: number }) {
  const base =
    "mt-0.5 inline-flex h-4.5 w-4.5 shrink-0 items-center justify-center rounded-full text-[10px] font-bold";
  if (marker === "check")
    return (
      <span className={`${base} bg-[#22C55E]/15 text-[#22C55E]`}>
        ✓
      </span>
    );
  if (marker === "alert")
    return (
      <span className={`${base} bg-[#F59E0B]/15 text-[#F59E0B]`}>
        !
      </span>
    );
  if (marker === "number")
    return (
      <span className={`${base} bg-[#2563EB]/15 text-[#2563EB]`}>
        {index + 1}
      </span>
    );
  return <span className="mt-[7px] inline-block h-1.5 w-1.5 shrink-0 rounded-full bg-[#2563EB]/60" />;
}

function parseMaybeJson<T>(value: T | string | null | undefined): T | null {
  if (value == null) return null;
  if (typeof value !== "string") return value;
  try {
    return JSON.parse(value) as T;
  } catch {
    return null;
  }
}

function JobDecodedCard({
  jobDecoded,
  jobRedFlags,
}: {
  jobDecoded: JobDecodedTerm[] | null;
  jobRedFlags: string[] | null;
}) {
  const hasDecoded = jobDecoded && jobDecoded.length > 0;
  const hasRedFlags = jobRedFlags && jobRedFlags.length > 0;
  if (!hasDecoded && !hasRedFlags) return null;

  return (
    <div className="rounded-3xl border border-[#E2E8F0] dark:border-neutral-800 bg-[#FFFFFF] dark:bg-neutral-900/40 p-5 shadow-[0_8px_30px_rgb(0,0,0,0.02)] space-y-4">
      <CardHeader icon="🗺️" tone="primary" title="Tradução da vaga" />

      {hasDecoded && (
        <ul className="space-y-3">
          {jobDecoded!.map((item, i) => (
            <li key={i} className="rounded-2xl bg-[#F8FAFC] dark:bg-neutral-950/30 border border-[#E2E8F0] dark:border-neutral-800 p-3.5 space-y-1.5">
              <p className="text-xs font-bold text-[#071827] dark:text-white">
                &ldquo;{item.termo}&rdquo;
              </p>
              <p className="text-xs text-[#64748B] dark:text-neutral-300 font-medium leading-relaxed">
                {item.significa}
              </p>
              <p className="text-xs text-[#2563EB] dark:text-blue-400 font-semibold leading-relaxed">
                → {item.ouSeja}
              </p>
            </li>
          ))}
        </ul>
      )}

      {hasRedFlags && (
        <div className="pt-1 space-y-1.5">
          <p className="text-[10px] font-bold uppercase tracking-wider text-[#EF4444]">Sinais de alerta no anúncio</p>
          <ul className="space-y-1.5 text-xs text-[#EF4444]">
            {jobRedFlags!.map((flag, i) => (
              <li key={i} className="flex items-start gap-1.5 font-medium">
                <span className="mt-[5px] inline-block h-1.5 w-1.5 rounded-full bg-[#EF4444]" />
                <span>{flag}</span>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}

function ClarifyingQuestionsCard({
  analysisId,
  questions,
}: {
  analysisId: string;
  questions: ClarifyingQuestion[] | null;
}) {
  const [answers, setAnswers] = useState<Record<number, string>>({});
  const [status, setStatus] = useState<"idle" | "loading" | "done" | "error">("idle");
  const [result, setResult] = useState<{
    refinementSummary: string;
    suggestedBullets: { context: string; bullet: string }[];
  } | null>(null);

  if (!questions || questions.length === 0) return null;

  const answeredCount = Object.values(answers).filter((a) => a.trim()).length;

  async function handleSubmit() {
    setStatus("loading");
    try {
      const res = await fetch(`/api/analysis/${analysisId}/refine`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          answers: questions!.map((q, i) => ({
            question: q.question,
            targetKeyword: q.targetKeyword,
            answer: answers[i] ?? "",
          })),
        }),
      });
      if (!res.ok) throw new Error();
      const data = await res.json();
      setResult(data);
      setStatus("done");
    } catch {
      setStatus("error");
    }
  }

  if (status === "done" && result) {
    return (
      <div className="rounded-3xl border border-emerald-200 dark:border-emerald-900 bg-emerald-50/40 dark:bg-emerald-950/20 p-5 space-y-3">
        <CardHeader icon="✅" tone="success" title="Análise atualizada com suas respostas" />
        <p className="text-xs text-[#64748B] dark:text-neutral-300 font-medium">{result.refinementSummary}</p>
        {result.suggestedBullets.length > 0 && (
          <ul className="space-y-2">
            {result.suggestedBullets.map((b, i) => (
              <li key={i} className="rounded-xl bg-white dark:bg-neutral-900 border border-[#E2E8F0] dark:border-neutral-800 p-3 space-y-1">
                <p className="text-[10px] font-bold uppercase tracking-wider text-[#64748B]">{b.context}</p>
                <p className="text-xs text-[#071827] dark:text-white font-medium">{b.bullet}</p>
              </li>
            ))}
          </ul>
        )}
      </div>
    );
  }

  return (
    <div className="rounded-3xl border border-[#E2E8F0] dark:border-neutral-800 bg-[#FFFFFF] dark:bg-neutral-900/40 p-5 shadow-[0_8px_30px_rgb(0,0,0,0.02)] space-y-4">
      <CardHeader
        icon="❓"
        tone="primary"
        title="Fez algo disso e não escreveu no currículo?"
        aside={`${answeredCount}/${questions.length}`}
      />
      <p className="text-xs text-[#64748B] dark:text-neutral-300 -mt-2">
        Responda o que fizer sentido. O que você confirmar aqui pode virar palavra-chave encontrada e um bullet pronto pro currículo.
      </p>
      <div className="space-y-3">
        {questions.map((q, i) => (
          <div key={i} className="space-y-1.5">
            <label className="block text-xs font-bold text-[#071827] dark:text-white">{q.question}</label>
            <p className="text-[10px] text-[#64748B] dark:text-neutral-400">{q.why}</p>
            <textarea
              value={answers[i] ?? ""}
              onChange={(e) => setAnswers((prev) => ({ ...prev, [i]: e.target.value }))}
              rows={2}
              placeholder="Sua resposta (deixe em branco se não se aplica)"
              className="w-full rounded-xl border border-[#E2E8F0] dark:border-neutral-800 bg-[#F8FAFC] dark:bg-neutral-950/30 p-2.5 text-xs text-[#071827] dark:text-white placeholder:text-neutral-400 focus:outline-none focus:ring-2 focus:ring-[#2563EB]/30"
            />
          </div>
        ))}
      </div>
      {status === "error" && (
        <p className="text-xs text-[#EF4444] font-medium">Não foi possível atualizar a análise. Tente novamente.</p>
      )}
      <button
        onClick={handleSubmit}
        disabled={answeredCount === 0 || status === "loading"}
        className="w-full rounded-xl bg-[#2563EB] text-white text-xs font-bold py-2.5 disabled:opacity-40 disabled:cursor-not-allowed hover:bg-[#1d4ed8] transition-colors"
      >
        {status === "loading" ? "Atualizando análise..." : "Atualizar análise com minhas respostas"}
      </button>
    </div>
  );
}

export function KeywordCard({
  title,
  items,
  variant,
}: {
  title: string;
  items: string[];
  variant: "found" | "missing";
}) {
  const chipClass =
    variant === "found"
      ? "border-[#22C55E]/20 bg-[#22C55E]/5 text-[#22C55E]"
      : "border-[#EF4444]/20 bg-[#EF4444]/5 text-[#EF4444]";
  const dotClass = variant === "found" ? "bg-[#22C55E]" : "bg-[#EF4444]";
  return (
    <div className={CARD}>
      <CardHeader
        icon={variant === "found" ? "✓" : "○"}
        tone={variant === "found" ? "success" : "danger"}
        title={title}
        aside={items.length > 0 ? String(items.length) : undefined}
      />
      {items.length === 0 ? (
        <p className="text-xs text-[#64748B]">Nenhum item identificado.</p>
      ) : (
        <div className="flex flex-wrap gap-1.5">
          {items.map((item, i) => (
            <span
              key={i}
              className={`inline-flex items-center gap-1.5 text-[10px] font-bold rounded-full border px-2.5 py-0.5 ${chipClass}`}
            >
              <span className={`h-1 w-1 rounded-full ${dotClass}`} />
              {item}
            </span>
          ))}
        </div>
      )}
    </div>
  );
}

export function ScoreBar({ label, value }: { label: string; value: number }) {
  const color =
    value >= 75 ? "bg-[#22C55E]" : value >= 50 ? "bg-[#F59E0B]" : "bg-[#EF4444]";
  return (
    <div>
      <div className="flex justify-between text-xs mb-1 font-semibold">
        <span className="text-[#64748B] dark:text-neutral-300">{label}</span>
        <span className="text-[#071827] dark:text-white font-extrabold">{value}%</span>
      </div>
      <div className="h-1.5 w-full rounded-full bg-[#F8FAFC] dark:bg-neutral-800 border border-[#E2E8F0] dark:border-neutral-700 overflow-hidden">
        <div
          className={`h-full rounded-full ${color}`}
          style={{ width: `${value}%` }}
        />
      </div>
    </div>
  );
}

export function ListCard({
  title,
  items,
  icon,
  tone = "primary",
  marker = "dot",
}: {
  title: string;
  items: string[];
  icon?: string;
  tone?: BadgeTone;
  marker?: ListMarker;
}) {
  return (
    <div className={CARD}>
      <CardHeader icon={icon} tone={tone} title={title} />
      {items.length === 0 ? (
        <p className="text-xs text-[#64748B]">Nenhum item identificado nesta análise.</p>
      ) : (
        <ul className="space-y-2 text-xs text-[#64748B] dark:text-neutral-300">
          {items.map((item, i) => (
            <li key={i} className="flex items-start gap-2">
              <Marker marker={marker} index={i} />
              <span className="leading-relaxed font-medium">{item}</span>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

export function SummaryCard({
  title,
  summary,
  icon = "📝",
  tone = "primary",
}: {
  title: string;
  summary: string;
  icon?: string;
  tone?: BadgeTone;
}) {
  return (
    <div className={CARD}>
      <CardHeader icon={icon} tone={tone} title={title} />
      <div className="rounded-xl border border-[#E2E8F0] dark:border-neutral-800 bg-[#F8FAFC] dark:bg-neutral-950 p-4">
        <p className="text-xs leading-relaxed text-[#64748B] dark:text-slate-300 whitespace-pre-line font-medium">
          {summary}
        </p>
      </div>
    </div>
  );
}

export function OrderedListCard({
  title,
  items,
  icon,
  tone = "primary",
}: {
  title: string;
  items: string[];
  icon?: string;
  tone?: BadgeTone;
}) {
  return (
    <div className={CARD}>
      <CardHeader icon={icon} tone={tone} title={title} />
      <ol className="space-y-2 text-xs text-[#64748B] dark:text-neutral-300">
        {items.map((item, i) => (
          <li key={i} className="flex items-start gap-2">
            <Marker marker="number" index={i} />
            <span className="leading-relaxed font-medium">{item}</span>
          </li>
        ))}
      </ol>
    </div>
  );
}

export function StudyPlanCard({ plan }: { plan: StudyPlanPhased }) {
  const groups: { label: string; items: string[]; pill: string }[] = [
    {
      label: "Essencial",
      items: plan.essential,
      pill: "bg-[#EF4444]/15 text-[#EF4444] border border-[#EF4444]/20",
    },
    {
      label: "Recomendado",
      items: plan.niceToHave,
      pill: "bg-[#F59E0B]/15 text-[#F59E0B] border border-[#F59E0B]/20",
    },
    {
      label: "Para depois",
      items: plan.later,
      pill: "bg-[#64748B]/10 text-[#64748B] border border-[#64748B]/20",
    },
  ];
  return (
    <div className={CARD}>
      <CardHeader icon="📚" tone="primary" title="Plano de estudo" />
      <div className="space-y-4">
        {groups.map(
          (group) =>
            group.items.length > 0 && (
              <div key={group.label} className="space-y-1.5">
                <span
                  className={`inline-block rounded-full px-2 py-0.5 text-[9px] font-bold uppercase tracking-wider ${group.pill}`}
                >
                  {group.label}
                </span>
                <ul className="space-y-1.5 text-xs text-[#64748B] dark:text-neutral-300">
                  {group.items.map((item, i) => (
                    <li key={i} className="flex items-start gap-2 font-medium">
                      <span className="mt-[5px] inline-block h-1.5 w-1.5 shrink-0 rounded-full bg-[#2563EB]" />
                      <span className="leading-relaxed">{item}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )
        )}
      </div>
    </div>
  );
}

const LOCKED_DELIVERABLES = [
  ["📄", "Currículo otimizado em PDF", "Reescrito com as palavras-chave desta vaga, pronto para enviar."],
  ["🔑", "Palavras-chave completas do ATS", "Todos os termos que o filtro automático procura, e onde inseri-los."],
  ["🎤", "Perguntas de entrevista desta vaga", "O que o recrutador tende a perguntar, com base nos seus gaps."],
  ["✉️", "Mensagem pronta para o recrutador", "Texto de apresentação personalizado para esta oportunidade."],
  ["🗺️", "Plano de ação priorizado", "O que ajustar primeiro para subir seu score antes de aplicar."],
  ["📚", "Plano de estudo dos gaps", "Como fechar as lacunas essenciais, recomendadas e futuras."],
] as const;

export function LockedDeliverablesUpsell({
  overallScore,
  children,
}: {
  overallScore: number;
  children?: React.ReactNode;
}) {
  const gap = Math.max(70 - overallScore, 0);
  return (
    <div className="rounded-2xl border border-[#2563EB]/25 bg-[#FFFFFF] dark:bg-neutral-900 p-5 space-y-4 shadow-sm">
      <div className="space-y-1">
        <h3 className="font-title font-bold text-sm text-[#071827] dark:text-white">
          {gap > 0
            ? `Você está a ${gap} pontos de "recomendado aplicar". O caminho já está mapeado.`
            : "Seu diagnóstico completo já está pronto. Só falta liberar."}
        </h3>
        <p className="text-xs text-[#64748B]">
          Estes materiais já foram gerados para esta vaga e estão aguardando liberação:
        </p>
      </div>

      <div className="grid gap-2.5 sm:grid-cols-2">
        {LOCKED_DELIVERABLES.map(([emoji, title, description]) => (
          <div
            key={title}
            className="relative rounded-xl border border-[#E2E8F0] dark:border-neutral-800 bg-[#F8FAFC] dark:bg-neutral-950/40 p-3.5"
          >
            <div className="flex items-start gap-2.5">
              <span className="text-base">{emoji}</span>
              <div className="min-w-0 space-y-1">
                <p className="text-xs font-bold text-[#071827] dark:text-white leading-snug">{title}</p>
                <p className="text-[10px] text-[#64748B] leading-relaxed">{description}</p>
                <p aria-hidden className="select-none blur-[5px] text-[10px] text-[#64748B] leading-relaxed">
                  Conteúdo gerado para esta vaga com base no seu currículo e nos requisitos.
                </p>
              </div>
              <span className="absolute right-3 top-3 text-[#64748B]">🔒</span>
            </div>
          </div>
        ))}
      </div>

      {children}
    </div>
  );
}

export function AnalysisTeaserView({
  result,
  children,
}: {
  result: Pick<
    Analysis,
    | "overallScore"
    | "atsScore"
    | "applicationStatus"
    | "applicationStatusReason"
    | "keywordsFound"
    | "keywordsMissing"
    | "strengths"
    | "weaknesses"
  >;
  children?: React.ReactNode;
}) {
  useEffect(() => {
    const startTime = Date.now();
    return () => {
      const dwellSeconds = Math.round((Date.now() - startTime) / 1000);
      if (dwellSeconds >= 1) {
        track(ANALYTICS_EVENTS.PAYWALL_DWELL_TIME, { seconds: dwellSeconds });
      }
    };
  }, []);

  const handlePreviewClick = (feature: string) => {
    track(ANALYTICS_EVENTS.PAYWALL_PREVIEW_CLICKED, { feature });
  };

  const topStrengths = result.strengths.slice(0, 2);
  const mainWeakness = result.weaknesses[0] || "Ajuste de formatação e ordenação de termos técnicos.";
  const mainMissingKeyword = result.keywordsMissing[0] || "Termos específicos da área";

  return (
    <section className="space-y-6 font-sans">
      {/* 1. SEU MATCH COM ESTA VAGA */}
      <div className="rounded-3xl border border-[#E2E8F0] dark:border-neutral-800 bg-[#FFFFFF] dark:bg-neutral-900 p-6 shadow-sm space-y-4">
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pb-3 border-b border-[#E2E8F0] dark:border-neutral-800">
          <div className="space-y-1 text-center sm:text-left">
            <span className="text-[10px] font-bold uppercase tracking-wider text-[#2563EB] bg-blue-50 dark:bg-blue-950/40 px-2.5 py-1 rounded-full">
              Seu Match com Esta Vaga
            </span>
            <h2 className="text-xl font-title font-bold text-[#071827] dark:text-white mt-1">
              Aderência Inicial Mapeada
            </h2>
          </div>
          <div className="flex items-center gap-2 px-4 py-2 rounded-2xl bg-[#F8FAFC] dark:bg-neutral-950 border border-[#E2E8F0] dark:border-neutral-800">
            <span className="text-3xl font-black text-[#2563EB]">{result.overallScore}%</span>
            <span className="text-[10px] font-bold text-[#64748B] uppercase">score</span>
          </div>
        </div>

        <p className="text-xs text-[#64748B] dark:text-neutral-300 leading-relaxed font-medium">
          {result.applicationStatusReason}
        </p>

        <div className="rounded-xl bg-[#F8FAFC] dark:bg-neutral-950 p-3 border border-[#E2E8F0] dark:border-neutral-800 flex items-start gap-2">
          <span className="text-xs shrink-0 mt-0.5">💡</span>
          <p className="text-[11px] text-[#64748B] dark:text-neutral-400 font-medium">
            <strong>Nota:</strong> Este score é uma orientação com base nos requisitos informados da vaga, não uma sentença definitiva ou impedimento de candidatura.
          </p>
        </div>
      </div>

      {/* 2. O QUE JÁ ESTÁ AJUDANDO (MICROVITÓRIA REAL) */}
      <div className="rounded-3xl border border-emerald-200 dark:border-emerald-950 bg-emerald-50/30 dark:bg-emerald-950/20 p-6 shadow-sm space-y-3">
        <div className="flex items-center gap-2">
          <span className="inline-flex h-7 w-7 items-center justify-center rounded-lg text-xs font-bold bg-emerald-100 dark:bg-emerald-900 text-emerald-700 dark:text-emerald-300">
            💪
          </span>
          <h3 className="font-title font-bold text-sm text-[#071827] dark:text-white">
            O que já está ajudando (Pontos Fortes)
          </h3>
        </div>
        <ul className="space-y-2 text-xs text-neutral-700 dark:text-neutral-300">
          {topStrengths.length > 0 ? (
            topStrengths.map((strength, i) => (
              <li key={i} className="flex items-start gap-2 font-medium">
                <span className="text-emerald-600 font-bold mt-0.5">✓</span>
                <span>{strength}</span>
              </li>
            ))
          ) : (
            <li className="flex items-start gap-2 font-medium">
              <span className="text-emerald-600 font-bold mt-0.5">✓</span>
              <span>Estrutura inicial de apresentação compatível com o formato padrão.</span>
            </li>
          )}
        </ul>
      </div>

      {/* 3. O QUE PODE ESTAR ATRAPALHANDO (LACUNA + PALAVRA-CHAVE + MELHORIA) */}
      <div className="rounded-3xl border border-amber-200 dark:border-amber-950 bg-amber-50/30 dark:bg-amber-950/20 p-6 shadow-sm space-y-4">
        <div className="flex items-center gap-2">
          <span className="inline-flex h-7 w-7 items-center justify-center rounded-lg text-xs font-bold bg-amber-100 dark:bg-amber-900 text-amber-700 dark:text-amber-300">
            ⚠️
          </span>
          <h3 className="font-title font-bold text-sm text-[#071827] dark:text-white">
            O que pode estar atrapalhando
          </h3>
        </div>

        <div className="grid gap-3 md:grid-cols-3 text-xs">
          <div className="rounded-2xl bg-white dark:bg-neutral-900 p-4 border border-amber-200/60 dark:border-amber-900/40 space-y-1">
            <span className="text-[10px] font-bold uppercase tracking-wider text-amber-600">Lacuna Relevante</span>
            <p className="font-medium text-[#071827] dark:text-white leading-relaxed">{mainWeakness}</p>
          </div>
          <div className="rounded-2xl bg-white dark:bg-neutral-900 p-4 border border-amber-200/60 dark:border-amber-900/40 space-y-1">
            <span className="text-[10px] font-bold uppercase tracking-wider text-amber-600">Palavra-Chave Ausente</span>
            <p className="font-medium text-[#071827] dark:text-white leading-relaxed">&ldquo;{mainMissingKeyword}&rdquo;</p>
          </div>
          <div className="rounded-2xl bg-white dark:bg-neutral-900 p-4 border border-amber-200/60 dark:border-amber-900/40 space-y-1">
            <span className="text-[10px] font-bold uppercase tracking-wider text-amber-600">Exemplo de Melhoria</span>
            <p className="font-medium text-[#071827] dark:text-white leading-relaxed">
              Substituir frases genéricas por resultados concretos e métricas mensuráveis.
            </p>
          </div>
        </div>
      </div>

      {/* 4. SUA RECOMENDAÇÃO EXECUTIVA */}
      <div className={`rounded-2xl border p-5 ${STATUS_CONFIG[result.applicationStatus].chipClass}`}>
        <p className="font-title font-bold text-sm flex items-center gap-2">
          <span>🎯</span>
          <span>Sua Recomendação: {STATUS_CONFIG[result.applicationStatus].label}</span>
        </p>
        <p className="text-xs mt-1.5 leading-relaxed opacity-90 font-medium">
          {result.applicationStatus === "apply_now" && "Seu perfil possui forte alinhamento inicial. Aplique agora e use o diagnóstico para se preparar para as perguntas da entrevista."}
          {result.applicationStatus === "adjust_first" && "Ajustar seu currículo primeiro para incluir os termos faltantes aumentará drasticamente suas chances de passar no filtro do RH."}
          {result.applicationStatus === "deprioritize" && "Esta vaga exige pré-requisitos ainda não indicados no seu perfil. Considere fechar essas lacunas ou focar em vagas mais aderentes."}
        </p>
      </div>

      {/* 5. O QUE O DIAGNÓSTICO COMPLETO LIBERA */}
      <div className="space-y-4 pt-2">
        <div className="flex items-center justify-between">
          <h3 className="font-title font-bold text-sm text-[#071827] dark:text-white flex items-center gap-2">
            <span>🔒</span>
            <span>O que o diagnóstico completo libera para esta vaga:</span>
          </h3>
        </div>

        <div className="grid gap-3 sm:grid-cols-2">
          {[
            ["📄", "Currículo Reescrito & Ajustado", "Alinhado palavra por palavra com as exatas exigências da vaga."],
            ["🔑", "Palavras-chave ATS Estratégicas", "Termos exatos para garantir aprovação nos filtros automáticos de RH."],
            ["🎤", "Perguntas de Entrevista + Respostas STAR", "Perguntas reais previstas para o seu perfil e o roteiro de resposta."],
            ["🗓️", "Plano de Ação Semanal", "Passo a passo organizado do que fazer antes e depois de aplicar."],
            ["✉️", "Mensagem Personalizada ao Recrutador", "Texto pronto para enviar no LinkedIn ou e-mail de acompanhamento."],
            ["🧐", "Antecipação de Objeções", "Como contornar possíveis hesitações do entrevistador durante a conversa."],
          ].map(([emoji, title, desc]) => (
            <div
              key={title}
              onClick={() => handlePreviewClick(title)}
              className="group relative cursor-pointer overflow-hidden rounded-2xl border border-[#E2E8F0] dark:border-neutral-800 bg-[#FFFFFF] dark:bg-neutral-900/60 p-4 transition-all hover:border-[#2563EB]"
            >
              <div className="flex items-start gap-3">
                <span className="text-lg">{emoji}</span>
                <div className="space-y-1">
                  <p className="text-xs font-bold text-[#071827] dark:text-white leading-snug">{title}</p>
                  <p className="text-[11px] text-[#64748B] dark:text-neutral-400 leading-relaxed font-medium">{desc}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* 6. CTA PRINCIPAL */}
      {children}
    </section>
  );
}

const FIT_CONFIG: Record<
  "fit" | "partial" | "no_fit",
  { emoji: string; label: string; message: string; className: string }
> = {
  fit: {
    emoji: "🟢",
    label: "Boa aderência identificada",
    message: "Seu perfil é compatível com os requisitos. Libere o Kit Candidatura para obter o plano de ação passo a passo.",
    className: "border-[#22C55E]/30 bg-[#22C55E]/5 text-[#22C55E]",
  },
  partial: {
    emoji: "🟡",
    label: "Aderência parcial",
    message: "Seu perfil possui gaps que podem ser corrigidos. Libere o Kit para saber como otimizar seu currículo.",
    className: "border-[#F59E0B]/30 bg-[#F59E0B]/5 text-[#F59E0B]",
  },
  no_fit: {
    emoji: "🔴",
    label: "Aderência baixa",
    message: "Gaps relevantes identificados. O plano detalhado mostra as principais prioridades para você fechar essas lacunas.",
    className: "border-[#EF4444]/30 bg-[#EF4444]/5 text-[#EF4444]",
  },
};

function fitLevelFromScore(score: number): "fit" | "partial" | "no_fit" {
  if (score >= 70) return "fit";
  if (score >= 45) return "partial";
  return "no_fit";
}

export function SimpleFitTeaser({
  result,
  children,
}: {
  result: Pick<Analysis, "overallScore" | "keywordsMissing" | "weaknesses">;
  children?: React.ReactNode;
}) {
  const level = fitLevelFromScore(result.overallScore);
  const config = FIT_CONFIG[level];
  const previewKeywords = result.keywordsMissing.slice(0, 3);
  const hiddenKeywords = Math.max(result.keywordsMissing.length - previewKeywords.length, 0);
  const topWeakness = result.weaknesses[0];

  return (
    <section className="space-y-4 font-sans">
      <div className={`rounded-2xl border p-5 text-center space-y-2.5 ${config.className}`}>
        <div className="flex items-baseline justify-center gap-1">
          <span className="text-3xl font-black tracking-tight">{result.overallScore}%</span>
          <span className="text-[10px] font-bold uppercase tracking-wider opacity-85">
            de match
          </span>
        </div>
        <p className="font-title font-bold text-sm">{config.label}</p>
        <p className="text-xs opacity-90 max-w-sm mx-auto leading-relaxed">
          {config.message}
        </p>
      </div>

      {previewKeywords.length > 0 && (
        <div className="rounded-2xl border border-[#E2E8F0] dark:border-neutral-800 bg-[#FFFFFF] p-4 shadow-sm">
          <h3 className="font-title font-bold text-xs mb-1 text-[#071827]">Palavras-chave faltantes</h3>
          <p className="text-[10px] text-[#64748B] mb-2.5">
            Termos essenciais para passar nos filtros automáticos (ATS) de triagem.
          </p>
          <div className="flex flex-wrap gap-1.5">
            {previewKeywords.map((item, i) => (
              <span
                key={i}
                className="text-[10px] font-bold rounded-full px-2.5 py-0.5 bg-[#EF4444]/10 text-[#EF4444]"
              >
                {item}
              </span>
            ))}
            {hiddenKeywords > 0 && (
              <span className="text-[10px] font-bold rounded-full px-2.5 py-0.5 bg-neutral-100 text-[#64748B]">
                +{hiddenKeywords} adicionais
              </span>
            )}
          </div>
        </div>
      )}

      {topWeakness && (
        <div className="rounded-2xl border border-[#E2E8F0] dark:border-neutral-800 bg-[#FFFFFF] p-4 shadow-sm">
          <h3 className="font-title font-bold text-xs mb-2 text-[#071827]">Lacuna crítica identificada</h3>
          <ul className="list-disc list-inside text-xs text-[#64748B] leading-relaxed">
            <li>{topWeakness}</li>
          </ul>
        </div>
      )}

      <div className="rounded-2xl border border-[#E2E8F0] dark:border-neutral-800 bg-[#FFFFFF] p-4 shadow-sm">
        <h3 className="font-title font-bold text-xs mb-2 text-[#071827]">Benefícios do Kit Candidatura:</h3>
        <ul className="space-y-1.5 text-xs text-[#64748B] leading-relaxed">
          {[
            "Roteiro passo a passo para reescrever seu currículo",
            "Cronograma estruturado para guiar seus estudos",
            "Simulador de entrevistas interativo com perguntas da vaga",
            "Carta de apresentação pronta para falar com recrutadores",
          ].map((item, i) => (
            <li key={i} className="flex items-start gap-1.5">
              <span className="text-[#22C55E] font-bold">✓</span>
              <span>{item}</span>
            </li>
          ))}
        </ul>
      </div>

      {children}
    </section>
  );
}

export function Recruiter7SecondHeatmapCard({
  jobTitle,
  structured,
  bulletAnalysis,
}: {
  jobTitle: string;
  structured?: StructuredResume | null;
  bulletAnalysis?: BulletAnalysisSummary | null;
}) {
  const hasHeadline = !!jobTitle || !!structured?.experiences?.[0]?.role;
  const hasContact = !!structured?.contact?.email || !!structured?.contact?.phone;
  const hasTech = (structured?.skills?.length ?? 0) > 0;

  const zone1Pass = hasHeadline && hasContact && hasTech;
  const zone2Score = bulletAnalysis?.score ?? 70;
  const zone2Pass = zone2Score >= 70;

  const hasEducation = (structured?.education?.length ?? 0) > 0;
  const hasLinks = !!structured?.contact?.linkedin || !!structured?.contact?.github;
  const zone3Pass = hasEducation || hasLinks;

  return (
    <div className="rounded-3xl border border-purple-200/80 dark:border-purple-900/60 bg-gradient-to-b from-purple-50/50 via-white to-white dark:from-purple-950/20 dark:via-neutral-900 dark:to-neutral-900 p-5 md:p-6 shadow-[0_8px_30px_rgb(0,0,0,0.02)] space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="p-2.5 rounded-2xl bg-purple-500/10 text-purple-600 dark:text-purple-400 font-bold text-lg">
            ⏱️
          </div>
          <div>
            <h3 className="text-base font-title font-bold text-neutral-900 dark:text-white flex items-center gap-2">
              <span>Recruiter 7-Second Heatmap</span>
              <span className="text-[10px] font-mono font-normal uppercase px-2.5 py-0.5 rounded-full bg-purple-100 dark:bg-purple-900/40 text-purple-700 dark:text-purple-300">
                Auditoria de Leitura Rápida
              </span>
            </h3>
            <p className="text-xs text-neutral-500 dark:text-neutral-400">
              O recrutador leva 7 segundos na primeira triagem. Veja como seu currículo pontua em cada zona.
            </p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-3 text-xs">
        {/* Zone 1 */}
        <div className={`p-4 rounded-2xl border transition-all ${
          zone1Pass
            ? "bg-emerald-50/50 dark:bg-emerald-950/20 border-emerald-200 dark:border-emerald-900/50 text-emerald-950 dark:text-emerald-200"
            : "bg-amber-50/50 dark:bg-amber-950/20 border-amber-200 dark:border-amber-900/50 text-amber-950 dark:text-amber-200"
        }`}>
          <div className="flex items-center justify-between mb-2">
            <span className="font-bold text-xs">Zona 1: Top Hook</span>
            <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-black/5 dark:bg-white/10">1–2 Segundos</span>
          </div>
          <p className="text-[11px] font-medium opacity-90 mb-2">
            <strong>Target Title + Core Tech Stack:</strong> {hasHeadline ? jobTitle || "Cargo Identificado" : "Falta Título Alvo claro"}
          </p>
          <div className="text-[10px] flex items-center gap-1 font-semibold">
            {zone1Pass ? "✅ Contexto imediato garantido no topo." : "⚠️ Ajuste seu cabeçalho para exibir seu cargo alvo."}
          </div>
        </div>

        {/* Zone 2 */}
        <div className={`p-4 rounded-2xl border transition-all ${
          zone2Pass
            ? "bg-emerald-50/50 dark:bg-emerald-950/20 border-emerald-200 dark:border-emerald-900/50 text-emerald-950 dark:text-emerald-200"
            : "bg-red-50/50 dark:bg-red-950/20 border-red-200 dark:border-red-900/50 text-red-950 dark:text-red-200"
        }`}>
          <div className="flex items-center justify-between mb-2">
            <span className="font-bold text-xs">Zona 2: Escopo & Impacto</span>
            <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-black/5 dark:bg-white/10">3–5 Segundos ⭐</span>
          </div>
          <p className="text-[11px] font-medium opacity-90 mb-2">
            <strong>Ação + Ferramenta = Resultado:</strong> {zone2Score}% das frases usam verbos de ação e métricas.
          </p>
          <div className="text-[10px] flex items-center gap-1 font-semibold">
            {zone2Pass ? "✅ Frases de impacto claras." : "❗ Frases parecem lista passiva de tarefas."}
          </div>
        </div>

        {/* Zone 3 */}
        <div className={`p-4 rounded-2xl border transition-all ${
          zone3Pass
            ? "bg-emerald-50/50 dark:bg-emerald-950/20 border-emerald-200 dark:border-emerald-900/50 text-emerald-950 dark:text-emerald-200"
            : "bg-amber-50/50 dark:bg-amber-950/20 border-amber-200 dark:border-amber-900/50 text-amber-950 dark:text-amber-200"
        }`}>
          <div className="flex items-center justify-between mb-2">
            <span className="font-bold text-xs">Zona 3: Sanity Check</span>
            <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-black/5 dark:bg-white/10">6–7 Segundos</span>
          </div>
          <p className="text-[11px] font-medium opacity-90 mb-2">
            <strong>Requisitos Básicos e Links:</strong> {hasEducation ? "Formação presente" : "Sem formação clara"} • {hasLinks ? "Links incluídos" : "Sem links"}
          </p>
          <div className="text-[10px] flex items-center gap-1 font-semibold">
            {zone3Pass ? "✅ Checagem rápida bem sucedida." : "⚠️ Adicione LinkedIn ou portfólio."}
          </div>
        </div>
      </div>
    </div>
  );
}

export function ScoreEvidenceTableCard({
  keywordsFound,
  keywordsMissing,
}: {
  keywordsFound: string[];
  keywordsMissing: string[];
}) {
  return (
    <div className="rounded-3xl border border-[#E2E8F0] dark:border-neutral-800 bg-white dark:bg-neutral-900/40 p-5 md:p-6 shadow-[0_8px_30px_rgb(0,0,0,0.02)] space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2.5">
          <span className="text-xl">🔍</span>
          <div>
            <h3 className="font-title font-bold text-sm text-[#071827] dark:text-white">
              Decomposição do Score por Evidências
            </h3>
            <p className="text-xs text-[#64748B] dark:text-neutral-400">
              Não apenas uma nota. Veja exatamente quais requisitos foram comprovados no seu currículo.
            </p>
          </div>
        </div>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-left text-xs border-collapse">
          <thead>
            <tr className="border-b border-[#E2E8F0] dark:border-neutral-800 text-[#64748B] dark:text-neutral-400 font-semibold uppercase tracking-wider text-[10px]">
              <th className="py-2.5 px-3">Requisito / Habilidade</th>
              <th className="py-2.5 px-3">Evidência no Currículo</th>
              <th className="py-2.5 px-3">Status</th>
              <th className="py-2.5 px-3">Próxima Ação</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-[#E2E8F0] dark:divide-neutral-800 text-neutral-800 dark:text-neutral-200">
            {keywordsFound.slice(0, 4).map((kw, i) => (
              <tr key={`found-${i}`} className="hover:bg-neutral-50 dark:hover:bg-neutral-950/30">
                <td className="py-3 px-3 font-semibold text-neutral-900 dark:text-white">{kw}</td>
                <td className="py-3 px-3 text-[#22C55E] font-medium">Comprovado nas palavras-chave do perfil</td>
                <td className="py-3 px-3">
                  <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-500/10 text-emerald-600 dark:text-emerald-400">
                    Forte ✅
                  </span>
                </td>
                <td className="py-3 px-3 text-[#64748B]">Usar como exemplo prático na entrevista</td>
              </tr>
            ))}

            {keywordsMissing.slice(0, 4).map((kw, i) => (
              <tr key={`missing-${i}`} className="hover:bg-neutral-50 dark:hover:bg-neutral-950/30">
                <td className="py-3 px-3 font-semibold text-neutral-900 dark:text-white">{kw}</td>
                <td className="py-3 px-3 text-[#EF4444] font-medium">Não localizado explicitamente</td>
                <td className="py-3 px-3">
                  <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-red-500/10 text-red-600 dark:text-red-400">
                    Lacuna ⚠️
                  </span>
                </td>
                <td className="py-3 px-3 text-[#64748B]">Inserir no currículo caso possua experiência</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

export function ScoreHero({

  status,
  reason,
  overall,
  technical,
  experience,
  seniority,
  ats,
}: {
  status: ApplicationStatus;
  reason: string;
  overall: number;
  technical: number;
  experience: number;
  seniority: number;
  ats: number;
}) {
  useEffect(() => {
    if (overall >= 75) {
      triggerConfetti({ count: 70, originY: 0.4 });
    }
  }, [overall]);

  const config = STATUS_CONFIG[status];
  const subScores = [
    { label: "Técnica", value: technical },
    { label: "Experiência", value: experience },
    { label: "Senioridade", value: seniority },
    { label: "Currículo / ATS", value: ats },
  ];
  return (
    <div
      className={`relative overflow-hidden rounded-3xl border border-[#E2E8F0] dark:border-neutral-800 bg-[#FFFFFF] dark:bg-neutral-900/60 p-5 md:p-6 shadow-[0_8px_30px_rgb(0,0,0,0.01)] ${
        overall >= 75 ? "shimmer-card" : ""
      }`}
    >
      <div className="flex flex-col items-center gap-5 text-center sm:flex-row sm:items-center sm:gap-6 sm:text-left relative z-10">
        <div className="shrink-0 relative bg-[#F8FAFC] dark:bg-neutral-950 p-2 rounded-full border border-[#E2E8F0] dark:border-neutral-800">
          <CircularScore value={overall} size={110} strokeWidth={9} />
        </div>
        <div className="space-y-1.5 min-w-0">
          <span className={`inline-flex items-center gap-1.5 px-3 py-0.5 rounded-full text-[9px] font-bold uppercase tracking-wider border ${config.chipClass} ${overall >= 75 ? "badge-pulse-glow" : ""}`}>
            <span className={`h-1.5 w-1.5 rounded-full ${config.dotClass} animate-pulse`} />
            {config.label}
          </span>
          <h2 className="text-xl md:text-2xl font-title font-bold text-[#071827] dark:text-white tracking-tight">
            Análise de Match
          </h2>
          <p className="max-w-prose text-xs leading-relaxed text-[#64748B] dark:text-neutral-300 font-medium">
            {reason}
          </p>
        </div>
      </div>

      <div className="mt-6 grid grid-cols-2 gap-3 sm:grid-cols-4 relative z-10">
        {subScores.map((s) => (
          <div
            key={s.label}
            className="flex flex-col items-center gap-2.5 rounded-2xl border border-[#E2E8F0] dark:border-neutral-800 bg-[#F8FAFC] dark:bg-neutral-950/20 p-3 hover:border-[#2563EB] transition-all duration-300 hover:scale-[1.02]"
          >
            <CircularScore value={s.value} size={44} strokeWidth={4.5} />
            <span className="text-[10px] font-bold text-[#64748B] dark:text-neutral-300">
              {s.label}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}


export function AnalysisResult({
  result,
  careerTrack,
  jobTitle = "",
  behavioralResult,
  bulletAnalysis,
  resumeStructured,
  betterThanPercent,
  analysisId,
}: {
  result: Analysis;
  careerTrack: CareerTrack;
  jobTitle?: string;
  behavioralResult?: {
    skillScores: string;
    personalityType: string;
    personalityLabel: string;
    summary: string;
  } | null;
  bulletAnalysis?: BulletAnalysisSummary | null;
  resumeStructured?: StructuredResume | null;
  betterThanPercent?: number | null;
  analysisId?: string;
}) {
  const isEntryLevel = careerTrack === "internship" || careerTrack === "apprentice";
  const [activeTab, setActiveTab] = useState<"overview" | "gaps" | "preparation" | "study">("overview");
  const [isAtsModalOpen, setIsAtsModalOpen] = useState(false);

  const tabs = [
    { id: "overview", label: "Visão Geral", emoji: "📊" },
    { id: "gaps", label: "Currículo & Gaps", emoji: "📄" },
    { id: "preparation", label: "Entrevista", emoji: "🎤" },
    { id: "study", label: "Plano de Estudo", emoji: "📚" },
  ] as const;

  return (
    <section className="space-y-5 font-sans">
      
      {/* Barra de Abas Premium */}
      <div className="flex overflow-x-auto gap-1 p-1 rounded-2xl bg-[#F8FAFC] dark:bg-neutral-900 border border-[#E2E8F0] dark:border-neutral-800 shadow-[0_4px_20px_rgba(0,0,0,0.01)] no-scrollbar">
        {tabs.map((tab) => {
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex-1 flex items-center justify-center gap-1.5 py-2 px-3 rounded-xl text-xs font-bold transition-all cursor-pointer whitespace-nowrap ${
                isActive
                  ? "bg-[#2563EB] text-white shadow-sm"
                  : "text-[#64748B] hover:text-[#071827] dark:hover:text-white"
              }`}
            >
              <span>{tab.emoji}</span>
              <span>{tab.label}</span>
            </button>
          );
        })}
      </div>

      {/* Conteúdo Dinâmico Baseado na Aba Ativa */}
      <div className="space-y-5 transition-all duration-300 animate-in fade-in">
        
        {/* ABA: Visão Geral */}
        {activeTab === "overview" && (
          <>
            <ScoreBeforeAfter
              initialScore={Math.max(35, result.overallScore - 32)}
              optimizedScore={result.overallScore}
              requirementsMetCount={result.keywordsFound?.length || 5}
            />

            <ShareMatchCard
              jobTitle={jobTitle || "Vaga em Análise"}
              overallScore={result.overallScore}
            />

            <div className="flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-[#2563EB]/20 bg-[#2563EB]/5 dark:bg-blue-950/20 p-4 shadow-sm">
              <div className="space-y-0.5">
                <p className="text-xs font-bold text-[#071827] dark:text-white flex items-center gap-1.5">
                  📌 Acompanhar esta vaga no seu Painel da Recolocação
                </p>
                <p className="text-[11px] text-[#64748B] dark:text-neutral-400">
                  Salve a oportunidade no seu Kanban para registrar entrevistas, prazos e próximos passos.
                </p>
              </div>

              <Link
                href="/applications"
                className="inline-flex items-center gap-2 rounded-xl bg-slate-900 dark:bg-white text-white dark:text-slate-900 hover:bg-slate-800 font-extrabold text-xs px-4 py-2.5 shadow-md transition-all"
              >
                Ver Meu Kanban de Candidaturas →
              </Link>
            </div>

            <div className="flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-[#E2E8F0] dark:border-neutral-800 bg-white dark:bg-neutral-900 p-4 shadow-sm">
              <div className="space-y-0.5">
                <p className="text-xs font-bold text-[#071827] dark:text-white flex items-center gap-1.5">
                  <FileText className="w-4 h-4 text-blue-600" />
                  Baixar Currículo Otimizado em Word (.docx)
                </p>
                <p className="text-[11px] text-[#64748B] dark:text-neutral-400">
                  Ideal para fazer revisões ou edições manuais antes de enviar para a vaga.
                </p>
              </div>

              <button
                type="button"
                onClick={async () => {
                  try {
                    const res = await fetch("/api/resume/export-docx", {
                      method: "POST",
                      headers: { "Content-Type": "application/json" },
                      body: JSON.stringify({
                        title: `Currículo Otimizado`,
                        summary: result.suggestedSummary,
                        experienceSuggestions: result.experienceSuggestions,
                        keywordsFound: result.keywordsFound,
                        fixes: result.fixes,
                      }),
                    });
                    if (!res.ok) throw new Error();
                    const blob = await res.blob();
                    const url = window.URL.createObjectURL(blob);
                    const a = document.createElement("a");
                    a.href = url;
                    a.download = "curriculo-otimizado-carreirasmatch.docx";
                    document.body.appendChild(a);
                    a.click();
                    a.remove();
                  } catch {
                    alert("Erro ao gerar o arquivo Word.");
                  }
                }}
                className="inline-flex items-center gap-2 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-extrabold text-xs px-4 py-2.5 shadow-md transition-all"
              >
                <Download className="w-4 h-4" />
                Baixar em Word (.docx)
              </button>
            </div>

            <ScoreHero
              status={result.applicationStatus}
              reason={result.applicationStatusReason}
              overall={result.overallScore}
              technical={result.technicalScore}
              experience={result.experienceScore}
              seniority={result.seniorityScore}
              ats={result.atsScore}
            />

            {/* Recruiter 7-Second Heatmap Card */}
            <Recruiter7SecondHeatmapCard
              jobTitle={jobTitle}
              structured={resumeStructured}
              bulletAnalysis={bulletAnalysis}
            />

            {/* Score por Evidências Table */}
            <ScoreEvidenceTableCard
              keywordsFound={result.keywordsFound}
              keywordsMissing={result.keywordsMissing}
            />

            {/* Botão de Abertura do Assistente ATS */}
            <button
              onClick={() => setIsAtsModalOpen(true)}
              className="w-full py-3.5 px-4 rounded-2xl bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 text-white font-semibold text-xs shadow-md transition-all flex items-center justify-center gap-2 cursor-pointer"
            >
              <span>⚡</span>
              <span>Copiar Respostas Otimizadas para Formulários ATS (Gupy, Workday, Greenhouse, Lever)</span>
            </button>

            {typeof betterThanPercent === "number" && (
              <ScorePercentileCard
                betterThanPercent={betterThanPercent}
                trackLabel={TRACK_LABELS[careerTrack]}
              />
            )}

            <BehavioralFitCard jobTitle={jobTitle} behavioralResult={behavioralResult} />

            <JobDecodedCard
              jobDecoded={parseMaybeJson<JobDecodedTerm[]>(result.jobDecoded)}
              jobRedFlags={parseMaybeJson<string[]>(result.jobRedFlags)}
            />

            <SummaryCard
              icon="✉️"
              tone="primary"
              title="Mensagem pronta para o recrutador"
              summary={result.recruiterMessage}
            />
          </>
        )}

        {/* ABA: Currículo & Gaps */}
        {activeTab === "gaps" && (
          <>
            {/* Makeover 3 Passos */}
            <BulletPointMakeover
              makeovers={build3StepMakeovers(resumeStructured?.experiences)}
            />

            <div className="grid gap-5 md:grid-cols-2">
              <KeywordCard
                title="Palavras-chave encontradas"
                items={result.keywordsFound}
                variant="found"
              />
              <KeywordCard

                title="Palavras-chave ausentes"
                items={result.keywordsMissing}
                variant="missing"
              />
            </div>

            {analysisId && (
              <ClarifyingQuestionsCard
                analysisId={analysisId}
                questions={parseMaybeJson<ClarifyingQuestion[]>(result.clarifyingQuestions)}
              />
            )}

            {/* Análise Gramatical, Dados Faltantes & Estrutura */}
            {(() => {
              const parsedGrammarErrors = typeof result.grammarErrors === "string" 
                ? (() => { try { return JSON.parse(result.grammarErrors); } catch { return []; } })()
                : result.grammarErrors || [];
              const parsedMissingBasicInfo = typeof result.missingBasicInfo === "string"
                ? (() => { try { return JSON.parse(result.missingBasicInfo); } catch { return []; } })()
                : result.missingBasicInfo || [];
              
              if (parsedGrammarErrors.length === 0 && parsedMissingBasicInfo.length === 0 && !result.structureFeedback) {
                return null;
              }

              return (
                <div className="grid gap-5 md:grid-cols-2">
                  {/* Gramática e Ortografia */}
                  <div className="rounded-3xl border border-[#E2E8F0] dark:border-neutral-800 bg-[#FFFFFF] dark:bg-neutral-900/40 p-5 shadow-[0_8px_30px_rgb(0,0,0,0.02)]">
                    <div className="mb-3 flex items-center gap-2">
                      <span className="inline-flex h-7 w-7 items-center justify-center rounded-lg text-xs font-bold ring-1 bg-blue-50 text-blue-600 ring-blue-100">
                        ✍️
                      </span>
                      <h3 className="font-title font-bold text-xs md:text-sm text-[#071827] dark:text-white">Gramática & Ortografia</h3>
                    </div>
                    {parsedGrammarErrors.length === 0 ? (
                      <p className="text-xs text-[#22C55E] font-semibold flex items-center gap-1">
                        ✓ Nenhum erro gramatical crítico detectado no currículo!
                      </p>
                    ) : (
                      <ul className="space-y-1.5 text-xs text-[#EF4444]">
                        {parsedGrammarErrors.map((err: string, i: number) => (
                          <li key={i} className="flex items-start gap-1.5 font-medium">
                            <span className="mt-[5px] inline-block h-1.5 w-1.5 rounded-full bg-[#EF4444]" />
                            <span>{err}</span>
                          </li>
                        ))}
                      </ul>
                    )}
                  </div>

                  {/* Informações Básicas Faltantes */}
                  <div className="rounded-3xl border border-[#E2E8F0] dark:border-neutral-800 bg-[#FFFFFF] dark:bg-neutral-900/40 p-5 shadow-[0_8px_30px_rgb(0,0,0,0.02)]">
                    <div className="mb-3 flex items-center gap-2">
                      <span className="inline-flex h-7 w-7 items-center justify-center rounded-lg text-xs font-bold ring-1 bg-amber-50 text-amber-600 ring-amber-100">
                        📌
                      </span>
                      <h3 className="font-title font-bold text-xs md:text-sm text-[#071827] dark:text-white">Informações Básicas</h3>
                    </div>
                    {parsedMissingBasicInfo.length === 0 ? (
                      <p className="text-xs text-[#22C55E] font-semibold flex items-center gap-1">
                        ✓ Currículo completo com dados de contato e datas!
                      </p>
                    ) : (
                      <ul className="space-y-1.5 text-xs text-[#F59E0B]">
                        {parsedMissingBasicInfo.map((info: string, i: number) => (
                          <li key={i} className="flex items-start gap-1.5 font-medium">
                            <span className="mt-[5px] inline-block h-1.5 w-1.5 rounded-full bg-[#F59E0B]" />
                            <span>{info}</span>
                          </li>
                        ))}
                      </ul>
                    )}
                  </div>

                  {/* Estrutura & Legibilidade */}
                  {result.structureFeedback && (
                    <div className="md:col-span-2 rounded-3xl border border-[#E2E8F0] dark:border-neutral-800 bg-[#FFFFFF] dark:bg-neutral-900/40 p-5 shadow-[0_8px_30px_rgb(0,0,0,0.02)] space-y-2">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <span className="inline-flex h-7 w-7 items-center justify-center rounded-lg text-xs font-bold ring-1 bg-indigo-50 text-indigo-600 ring-indigo-100">
                            📐
                          </span>
                          <h3 className="font-title font-bold text-xs md:text-sm text-[#071827] dark:text-white">Estrutura & Legibilidade</h3>
                        </div>
                        {result.structureRating && (
                          <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full uppercase border ${
                            result.structureRating === "excellent"
                              ? "bg-[#22C55E]/15 text-[#22C55E] border-[#22C55E]/20"
                              : result.structureRating === "good"
                              ? "bg-[#F59E0B]/15 text-[#F59E0B] border-[#F59E0B]/20"
                              : "bg-[#EF4444]/15 text-[#EF4444] border-[#EF4444]/20"
                          }`}>
                            {result.structureRating === "excellent"
                              ? "Excelente"
                              : result.structureRating === "good"
                              ? "Estrutura Boa"
                              : "Melhorar Estrutura"}
                          </span>
                        )}
                      </div>
                      <p className="text-xs text-[#64748B] leading-relaxed font-medium">
                        {result.structureFeedback}
                      </p>
                    </div>
                  )}
                </div>
              );
            })()}

            <div className="grid gap-5 md:grid-cols-2">
              <ListCard
                icon="💪"
                tone="success"
                marker="check"
                title="Pontos fortes"
                items={result.strengths}
              />
              <ListCard
                icon="⚠️"
                tone="warning"
                marker="alert"
                title="Pontos fracos"
                items={result.weaknesses}
              />
            </div>

            {bulletAnalysis && <BulletDiagnosticsCard analysis={bulletAnalysis} />}

            {resumeStructured && (
              <AtsResumeView
                resume={resumeStructured}
                missingBasicInfo={
                  Array.isArray(result.missingBasicInfo)
                    ? result.missingBasicInfo
                    : typeof result.missingBasicInfo === "string"
                    ? (() => {
                        try {
                          return JSON.parse(result.missingBasicInfo) as string[];
                        } catch {
                          return [];
                        }
                      })()
                    : []
                }
              />
            )}

            <ListCard
              icon="🔧"
              tone="primary"
              marker="number"
              title="Antes de aplicar, corrija isso no currículo"
              items={result.fixes}
            />

            {isEntryLevel && <ChecklistCard items={result.fixes} />}

            {careerTrack === "career_change" &&
              result.transferableSkills &&
              result.transferableSkills.length > 0 && (
                <ListCard
                  icon="🔁"
                  tone="success"
                  marker="check"
                  title="Habilidades transferíveis"
                  items={result.transferableSkills}
                />
              )}

            {careerTrack === "reemployment" &&
              result.recruiterObjections &&
              result.recruiterObjections.length > 0 && (
                <ListCard
                  icon="🧐"
                  tone="warning"
                  marker="alert"
                  title="Objeções prováveis do recrutador"
                  items={result.recruiterObjections}
                />
              )}

            {result.alternativeRoles && result.alternativeRoles.length > 0 && (
              <ListCard
                icon="🎯"
                tone="neutral"
                title="Vagas alternativas sugeridas"
                items={result.alternativeRoles}
              />
            )}

            <SummaryCard
              icon="📝"
              title="Resumo profissional sugerido"
              summary={result.suggestedSummary}
            />
          </>
        )}

        {/* ABA: Preparação Entrevista */}
        {activeTab === "preparation" && (
          <>
            {isEntryLevel && result.talkAboutYourselfAnswer && (
              <SummaryCard
                icon="🗣️"
                title='Resposta pronta: "Fale sobre você"'
                summary={result.talkAboutYourselfAnswer}
              />
            )}

            {careerTrack === "career_change" && (
              <>
                {result.transitionNarrative && (
                  <SummaryCard
                    icon="🌉"
                    title="Narrativa de transição (LinkedIn/entrevista)"
                    summary={result.transitionNarrative}
                  />
                )}
                {result.whyCareerChangeAnswer && (
                  <SummaryCard
                    icon="💬"
                    title='Resposta pronta: "Por que quer mudar de área?"'
                    summary={result.whyCareerChangeAnswer}
                  />
                )}
                {result.bridgeRoles && result.bridgeRoles.length > 0 && (
                  <OrderedListCard
                    icon="🪜"
                    title="Cargos-ponte recomendados"
                    items={result.bridgeRoles}
                  />
                )}
              </>
            )}

            {careerTrack === "reemployment" && (
              <>
                {result.applicationStrategy && (
                  <SummaryCard
                    icon="♟️"
                    title="Estratégia de candidatura"
                    summary={result.applicationStrategy}
                  />
                )}
                {result.weeklyApplicationPlan && result.weeklyApplicationPlan.length > 0 && (
                  <OrderedListCard
                    icon="🗓️"
                    title="Plano semanal de candidaturas"
                    items={result.weeklyApplicationPlan}
                  />
                )}
                {result.feedbackAnalysis && (
                  <SummaryCard
                    icon="📊"
                    title="Análise dos feedbacks recebidos"
                    summary={result.feedbackAnalysis}
                  />
                )}
              </>
            )}

            <ListCard
              icon="🎤"
              tone="primary"
              title="Perguntas prováveis da entrevista"
              items={result.interviewQuestions}
            />
            <InterviewSimulator questions={result.interviewQuestions} jobTitle={jobTitle} />
          </>
        )}

        {/* ABA: Plano de Estudo */}
        {activeTab === "study" && (
          <>
            <StudyPlanCard plan={result.studyPlan} />

            {careerTrack === "career_change" && (
              <p className="text-xs text-[#64748B] text-center">
                <Link href="/tools/career-change-guide" className="text-[#2563EB] hover:underline font-bold">
                  Ver guia completo de transição de carreira →
                </Link>
              </p>
            )}
            {careerTrack === "reemployment" && (
              <p className="text-xs text-[#64748B] text-center">
                <Link href="/tools/reemployment-guide" className="text-[#2563EB] hover:underline font-bold">
                  Ver guia completo de recolocação →
                </Link>
              </p>
            )}
          </>
        )}

      </div>

      <ATSHelperModal
        isOpen={isAtsModalOpen}
        onClose={() => setIsAtsModalOpen(false)}
        jobTitle={jobTitle}
        suggestedSummary={result.suggestedSummary}
        keywordsFound={result.keywordsFound}
        experienceSuggestions={result.experienceSuggestions}
      />
    </section>
  );
}

export function BehavioralFitCard({
  jobTitle,
  behavioralResult,
}: {
  jobTitle: string;
  behavioralResult?: {
    skillScores: string;
    personalityType: string;
    personalityLabel: string;
    summary: string;
  } | null;
}) {
  if (!behavioralResult) {
    return (
      <div className="rounded-3xl border border-[#2563EB]/20 bg-[#2563EB]/5 p-5 flex flex-col md:flex-row items-center justify-between gap-5">
        <div className="space-y-1 text-left">
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[9px] font-bold uppercase tracking-wider bg-[#2563EB]/15 text-[#2563EB] border border-[#2563EB]/25">
            Mapeamento Comportamental
          </span>
          <h3 className="font-title font-bold text-sm leading-tight text-[#071827] mt-1.5">Mapeamento Comportamental & Soft Skills</h3>
          <p className="text-xs text-[#64748B] max-w-xl">
            Descubra como seu perfil comportamental e suas habilidades interpessoais se alinham a esta vaga de <strong>{jobTitle}</strong>.
          </p>
        </div>
        <Link
          href="/tools/behavioral-test"
          className="inline-flex items-center gap-1.5 rounded-xl bg-[#2563EB] hover:bg-[#1D4ED8] text-white text-xs font-semibold px-4 py-2.5 transition-all shrink-0 cursor-pointer w-full md:w-auto justify-center active:scale-[0.98]"
        >
          <span>Fazer Teste Comportamental</span>
          <span>→</span>
        </Link>
      </div>
    );
  }

  let skills: Record<string, number> = {};
  try {
    skills = JSON.parse(behavioralResult.skillScores);
  } catch {
    return null;
  }

  const primaryTraitLabel = behavioralResult.personalityLabel;
  const primaryTraitDesc = behavioralResult.summary;

  const labels: Record<string, string> = {
    comunicacao: "Comunicação",
    trabalho_em_equipe: "Trabalho em equipe",
    proatividade: "Proatividade",
    adaptabilidade: "Adaptabilidade",
    resolucao_problemas: "Resolução de problemas",
  };

  return (
    <div className="rounded-3xl border border-[#E2E8F0] dark:border-neutral-800 bg-[#FFFFFF] dark:bg-neutral-950 p-5 shadow-[0_8px_30px_rgb(0,0,0,0.01)] space-y-4">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 border-b border-[#E2E8F0] dark:border-neutral-800 pb-3">
        <div>
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[9px] font-bold uppercase tracking-wider bg-[#22C55E]/15 text-[#22C55E] border border-[#22C55E]/20">
            Aderência Comportamental
          </span>
          <h3 className="font-title font-bold text-sm mt-1.5 text-[#071827] dark:text-white">Mapeamento Comportamental & Soft Skills</h3>
        </div>
        <Link
          href="/tools/behavioral-test"
          className="text-xs text-[#2563EB] hover:text-[#1D4ED8] hover:underline font-bold shrink-0 cursor-pointer"
        >
          Refazer teste comportamental →
        </Link>
      </div>

      <div className="grid gap-5 md:grid-cols-12">
        <div className="md:col-span-5 space-y-2.5 p-4 rounded-2xl bg-[#F8FAFC] dark:bg-neutral-900 border border-[#E2E8F0] dark:border-neutral-800">
          <p className="text-[9px] font-bold text-[#64748B] uppercase tracking-wider">Seu Perfil Dominante</p>
          <p className="font-bold text-sm text-[#2563EB]">{primaryTraitLabel}</p>
          <p className="text-xs text-[#64748B] dark:text-slate-400 leading-relaxed">
            {primaryTraitDesc}
          </p>
        </div>

        <div className="md:col-span-7 space-y-3">
          <p className="text-[9px] font-bold text-[#64748B] uppercase tracking-wider">Pontuação de Soft Skills</p>
          <div className="grid gap-3">
            {Object.entries(skills).map(([dim, score]) => (
              <ScoreBar key={dim} label={labels[dim] || dim} value={score} />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
