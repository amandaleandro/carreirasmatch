"use client";

import Link from "next/link";
import { useState } from "react";
import { ChecklistCard } from "@/components/checklist-card";
import { InterviewSimulator } from "@/components/interview-simulator";
import { CircularScore } from "@/components/circular-score";
import {
  SOFT_SKILL_LABELS,
  type SoftSkillDimension,
} from "@/lib/behavioral-test";

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
  return (
    <section className="space-y-4 font-sans">
      <div className={`rounded-2xl border p-4 ${STATUS_CONFIG[result.applicationStatus].chipClass}`}>
        <p className="font-title font-bold text-sm">
          {STATUS_CONFIG[result.applicationStatus].label}
        </p>
        <p className="text-xs mt-1 leading-relaxed opacity-90">{result.applicationStatusReason}</p>
      </div>

      <div className="rounded-2xl border border-[#E2E8F0] dark:border-neutral-800 bg-[#FFFFFF] p-5 shadow-sm space-y-4">
        <h2 className="font-title font-bold text-sm text-[#071827]">Análise preliminar</h2>
        <ScoreBar label="Aderência geral" value={result.overallScore} />
        <ScoreBar label="Currículo / ATS" value={result.atsScore} />
      </div>

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
  const config = STATUS_CONFIG[status];
  const subScores = [
    { label: "Técnica", value: technical },
    { label: "Experiência", value: experience },
    { label: "Senioridade", value: seniority },
    { label: "Currículo / ATS", value: ats },
  ];
  return (
    <div
      className="relative overflow-hidden rounded-3xl border border-[#E2E8F0] dark:border-neutral-800 bg-[#FFFFFF] dark:bg-neutral-900/60 p-5 md:p-6 shadow-[0_8px_30px_rgb(0,0,0,0.01)]"
    >
      <div className="flex flex-col items-center gap-5 text-center sm:flex-row sm:items-center sm:gap-6 sm:text-left relative z-10">
        <div className="shrink-0 relative bg-[#F8FAFC] dark:bg-neutral-950 p-2 rounded-full border border-[#E2E8F0] dark:border-neutral-800">
          <CircularScore value={overall} size={110} strokeWidth={9} />
        </div>
        <div className="space-y-1.5 min-w-0">
          <span className={`inline-flex items-center gap-1.5 px-3 py-0.5 rounded-full text-[9px] font-bold uppercase tracking-wider border ${config.chipClass}`}>
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
            className="flex flex-col items-center gap-2.5 rounded-2xl border border-[#E2E8F0] dark:border-neutral-800 bg-[#F8FAFC] dark:bg-neutral-950/20 p-3 hover:border-[#2563EB] transition-all duration-300"
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
}) {
  const isEntryLevel = careerTrack === "internship" || careerTrack === "apprentice";
  const [activeTab, setActiveTab] = useState<"overview" | "gaps" | "preparation" | "study">("overview");

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
            <ScoreHero
              status={result.applicationStatus}
              reason={result.applicationStatusReason}
              overall={result.overallScore}
              technical={result.technicalScore}
              experience={result.experienceScore}
              seniority={result.seniorityScore}
              ats={result.atsScore}
            />

            <BehavioralFitCard jobTitle={jobTitle} behavioralResult={behavioralResult} />

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

            {/* Análise Gramatical, Dados Faltantes & Estrutura */}
            {(() => {
              const parsedGrammarErrors = typeof result.grammarErrors === "string" 
                ? (() => { try { return JSON.parse(result.grammarErrors); } catch(e) { return []; } })()
                : result.grammarErrors || [];
              const parsedMissingBasicInfo = typeof result.missingBasicInfo === "string"
                ? (() => { try { return JSON.parse(result.missingBasicInfo); } catch(e) { return []; } })()
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
  } catch (e) {
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
