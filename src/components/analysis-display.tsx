import Link from "next/link";
import { ChecklistCard } from "@/components/checklist-card";
import { InterviewSimulator } from "@/components/interview-simulator";
import { CircularScore } from "@/components/circular-score";
import {
  SOFT_SKILL_LABELS,
  PERSONALITY_TRAIT_LABELS,
  PERSONALITY_TRAIT_DESCRIPTIONS,
  type SoftSkillDimension,
  type PersonalityTrait,
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
  { emoji: string; label: string; className: string }
> = {
  apply_now: {
    emoji: "🟢",
    label: "Aplicar agora",
    className: "border-emerald-300 bg-emerald-50 dark:border-emerald-900 dark:bg-emerald-950/40",
  },
  adjust_first: {
    emoji: "🟡",
    label: "Ajustar antes de aplicar",
    className: "border-amber-300 bg-amber-50 dark:border-amber-900 dark:bg-amber-950/40",
  },
  deprioritize: {
    emoji: "🔴",
    label: "Não priorizar agora",
    className: "border-red-300 bg-red-50 dark:border-red-900 dark:bg-red-950/40",
  },
};

export function StatusBanner({
  status,
  reason,
}: {
  status: ApplicationStatus;
  reason: string;
}) {
  const config = STATUS_CONFIG[status];
  return (
    <div className={`rounded-xl border p-5 ${config.className}`}>
      <p className="font-semibold text-lg">
        {config.emoji} {config.label}
      </p>
      <p className="text-sm text-neutral-700 dark:text-neutral-300 mt-1">{reason}</p>
    </div>
  );
}

/** Superfície de card premium compartilhada por todo o diagnóstico: profundidade
 *  suave e borda discreta, alinhada à identidade das ferramentas (globals.css). */
const CARD =
  "rounded-3xl border border-neutral-200/70 dark:border-neutral-850 bg-white dark:bg-neutral-950 p-6 shadow-sm hover:shadow-md hover:-translate-y-[2px] transition-all duration-300";

type BadgeTone = "primary" | "success" | "danger" | "warning" | "neutral";

const BADGE_TONES: Record<BadgeTone, string> = {
  primary:
    "bg-blue-50 text-blue-600 ring-blue-100 dark:bg-blue-950/50 dark:text-blue-300 dark:ring-blue-900/50",
  success:
    "bg-emerald-50 text-emerald-600 ring-emerald-100 dark:bg-emerald-950/50 dark:text-emerald-300 dark:ring-emerald-900/50",
  danger:
    "bg-red-50 text-red-600 ring-red-100 dark:bg-red-950/50 dark:text-red-300 dark:ring-red-900/50",
  warning:
    "bg-amber-50 text-amber-600 ring-amber-100 dark:bg-amber-950/50 dark:text-amber-300 dark:ring-amber-900/50",
  neutral:
    "bg-neutral-100 text-neutral-600 ring-neutral-200 dark:bg-neutral-900 dark:text-neutral-300 dark:ring-neutral-800",
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
    <div className="mb-4 flex items-center gap-3">
      {icon && (
        <span
          aria-hidden
          className={`inline-flex h-8 w-8 shrink-0 items-center justify-center rounded-lg text-sm ring-1 ${BADGE_TONES[tone]}`}
        >
          {icon}
        </span>
      )}
      <h3 className="font-semibold tracking-tight">{title}</h3>
      {aside && <span className="ml-auto text-xs text-neutral-500">{aside}</span>}
    </div>
  );
}

type ListMarker = "dot" | "check" | "alert" | "number";

function Marker({ marker, index }: { marker: ListMarker; index: number }) {
  const base =
    "mt-0.5 inline-flex h-5 w-5 shrink-0 items-center justify-center rounded-full text-[11px] font-bold";
  if (marker === "check")
    return (
      <span className={`${base} bg-emerald-100 text-emerald-600 dark:bg-emerald-950/60 dark:text-emerald-300`}>
        ✓
      </span>
    );
  if (marker === "alert")
    return (
      <span className={`${base} bg-amber-100 text-amber-600 dark:bg-amber-950/60 dark:text-amber-300`}>
        !
      </span>
    );
  if (marker === "number")
    return (
      <span className={`${base} bg-blue-100 text-blue-600 dark:bg-blue-950/60 dark:text-blue-300`}>
        {index + 1}
      </span>
    );
  return <span className="mt-[7px] inline-block h-1.5 w-1.5 shrink-0 rounded-full bg-blue-500/70" />;
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
      ? "border-emerald-200 bg-emerald-50 text-emerald-700 dark:border-emerald-900/60 dark:bg-emerald-950/40 dark:text-emerald-300"
      : "border-red-200 bg-red-50 text-red-700 dark:border-red-900/60 dark:bg-red-950/40 dark:text-red-300";
  const dotClass = variant === "found" ? "bg-emerald-500" : "bg-red-500";
  return (
    <div className={CARD}>
      <CardHeader
        icon={variant === "found" ? "✓" : "○"}
        tone={variant === "found" ? "success" : "danger"}
        title={title}
        aside={items.length > 0 ? String(items.length) : undefined}
      />
      {items.length === 0 ? (
        <p className="text-sm text-neutral-500">Nenhum item identificado.</p>
      ) : (
        <div className="flex flex-wrap gap-2">
          {items.map((item, i) => (
            <span
              key={i}
              className={`inline-flex items-center gap-1.5 text-xs font-medium rounded-full border px-3 py-1 ${chipClass}`}
            >
              <span className={`h-1.5 w-1.5 rounded-full ${dotClass}`} />
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
    value >= 75 ? "bg-emerald-500" : value >= 50 ? "bg-amber-500" : "bg-red-500";
  return (
    <div>
      <div className="flex justify-between text-sm mb-1">
        <span className="text-neutral-600 dark:text-neutral-300">{label}</span>
        <span className="font-semibold">{value}%</span>
      </div>
      <div className="h-2 w-full rounded-full bg-neutral-200 dark:bg-neutral-800">
        <div
          className={`h-2 rounded-full ${color}`}
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
        <p className="text-sm text-neutral-500">Nenhum item identificado nesta análise.</p>
      ) : (
        <ul className="space-y-2.5 text-sm text-neutral-700 dark:text-neutral-300">
          {items.map((item, i) => (
            <li key={i} className="flex items-start gap-2.5">
              <Marker marker={marker} index={i} />
              <span className="leading-relaxed">{item}</span>
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
      <div className="rounded-xl border border-neutral-200/70 bg-neutral-50 p-4 dark:border-neutral-800/70 dark:bg-neutral-900/50">
        <p className="text-sm leading-relaxed text-neutral-700 dark:text-neutral-300 whitespace-pre-line">
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
      <ol className="space-y-2.5 text-sm text-neutral-700 dark:text-neutral-300">
        {items.map((item, i) => (
          <li key={i} className="flex items-start gap-2.5">
            <Marker marker="number" index={i} />
            <span className="leading-relaxed">{item}</span>
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
      pill: "bg-red-100 text-red-700 dark:bg-red-950/60 dark:text-red-300",
    },
    {
      label: "Bom ter",
      items: plan.niceToHave,
      pill: "bg-amber-100 text-amber-700 dark:bg-amber-950/60 dark:text-amber-300",
    },
    {
      label: "Pode ficar para depois",
      items: plan.later,
      pill: "bg-neutral-100 text-neutral-600 dark:bg-neutral-800 dark:text-neutral-300",
    },
  ];
  return (
    <div className={CARD}>
      <CardHeader icon="📚" tone="primary" title="Plano de estudo" />
      <div className="space-y-4">
        {groups.map(
          (group) =>
            group.items.length > 0 && (
              <div key={group.label}>
                <span
                  className={`mb-2 inline-block rounded-full px-2.5 py-0.5 text-[11px] font-semibold uppercase tracking-wide ${group.pill}`}
                >
                  {group.label}
                </span>
                <ul className="space-y-1.5 text-sm text-neutral-700 dark:text-neutral-300">
                  {group.items.map((item, i) => (
                    <li key={i} className="flex items-start gap-2.5">
                      <span className="mt-[7px] inline-block h-1.5 w-1.5 shrink-0 rounded-full bg-blue-500/70" />
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
    <section className="space-y-6">
      <StatusBanner
        status={result.applicationStatus}
        reason={result.applicationStatusReason}
      />

      <div className="rounded-2xl border border-neutral-200/80 dark:border-neutral-800 bg-white dark:bg-neutral-950 p-5 shadow-sm shadow-slate-900/5 space-y-4">
        <h2 className="font-semibold text-lg">Primeira análise</h2>
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
    emoji: "✅",
    label: "Você tem aderência com essa vaga",
    message: "Seu perfil combina bem com o que a vaga pede. Veja o diagnóstico completo para saber exatamente como se destacar.",
    className: "border-emerald-300 bg-emerald-50 dark:border-emerald-900 dark:bg-emerald-950/40",
  },
  partial: {
    emoji: "🟡",
    label: "Você tem aderência parcial com essa vaga",
    message: "Seu perfil tem pontos fortes, mas também gaps importantes. O diagnóstico completo mostra o que ajustar antes de aplicar.",
    className: "border-amber-300 bg-amber-50 dark:border-amber-900 dark:bg-amber-950/40",
  },
  no_fit: {
    emoji: "🔴",
    label: "Você ainda não tem aderência com essa vaga",
    message: "Existem gaps relevantes entre seu currículo e essa vaga. O diagnóstico completo mostra um plano para chegar lá.",
    className: "border-red-300 bg-red-50 dark:border-red-900 dark:bg-red-950/40",
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
    <section className="space-y-6">
      <div className={`rounded-2xl border p-6 md:p-8 text-center space-y-3 ${config.className}`}>
        <p className="text-4xl">{config.emoji}</p>
        <div className="flex items-baseline justify-center gap-2">
          <span className="text-4xl font-extrabold tracking-tight">{result.overallScore}%</span>
          <span className="text-sm font-medium text-neutral-600 dark:text-neutral-300">
            de aderência
          </span>
        </div>
        <p className="font-bold text-lg md:text-xl">{config.label}</p>
        <p className="text-sm text-neutral-700 dark:text-neutral-300 max-w-md mx-auto">
          {config.message}
        </p>
      </div>

      {previewKeywords.length > 0 && (
        <div className="rounded-2xl border border-neutral-200/80 dark:border-neutral-800 bg-white dark:bg-neutral-950 p-5 shadow-sm shadow-slate-900/5">
          <h3 className="font-semibold mb-1">Palavras-chave que faltam no seu currículo</h3>
          <p className="text-sm text-neutral-500 dark:text-neutral-400 mb-3">
            Sem elas, seu currículo pode ser barrado pelos filtros automáticos (ATS) antes de um
            recrutador ver.
          </p>
          <div className="flex flex-wrap gap-2">
            {previewKeywords.map((item, i) => (
              <span
                key={i}
                className="text-xs rounded-full px-3 py-1 bg-red-100 text-red-800 dark:bg-red-900/50 dark:text-red-300"
              >
                {item}
              </span>
            ))}
            {hiddenKeywords > 0 && (
              <span className="text-xs rounded-full px-3 py-1 bg-neutral-100 text-neutral-500 dark:bg-neutral-800 dark:text-neutral-400">
                +{hiddenKeywords} no diagnóstico completo
              </span>
            )}
          </div>
        </div>
      )}

      {topWeakness && (
        <div className="rounded-2xl border border-neutral-200/80 dark:border-neutral-800 bg-white dark:bg-neutral-950 p-5 shadow-sm shadow-slate-900/5">
          <h3 className="font-semibold mb-3">Um ponto que pode te tirar da vaga</h3>
          <ul className="list-disc list-inside text-sm text-neutral-700 dark:text-neutral-300">
            <li>{topWeakness}</li>
          </ul>
          <div className="mt-3 flex items-center gap-2 rounded-lg border border-dashed border-blue-300 dark:border-blue-800 bg-blue-50/60 dark:bg-blue-950/20 px-3 py-2.5">
            <span aria-hidden>🔒</span>
            <p className="text-sm text-blue-700 dark:text-blue-300">
              O plano passo a passo para corrigir este e os demais pontos está no diagnóstico
              completo.
            </p>
          </div>
        </div>
      )}

      <div className="rounded-2xl border border-neutral-200/80 dark:border-neutral-800 bg-white dark:bg-neutral-950 p-5 shadow-sm shadow-slate-900/5">
        <h3 className="font-semibold mb-3">No diagnóstico completo você ainda recebe:</h3>
        <ul className="space-y-2 text-sm text-neutral-700 dark:text-neutral-300">
          {[
            "Currículo reescrito e otimizado para esta vaga",
            "Plano de estudo priorizado para fechar seus gaps",
            "Perguntas de entrevista com respostas prontas",
            "Mensagem pronta para enviar ao recrutador",
            result.keywordsMissing.length > 0
              ? `As ${result.keywordsMissing.length} palavras-chave que faltam, com onde encaixar cada uma`
              : "Todas as palavras-chave da vaga, com onde encaixar cada uma",
          ].map((item, i) => (
            <li key={i} className="flex items-start gap-2">
              <span className="text-emerald-500 mt-0.5">✓</span>
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
      className={`relative overflow-hidden rounded-3xl border p-6 md:p-8 shadow-xl transition-all duration-300 hover:shadow-2xl ${config.className}`}
    >
      {/* Background decorations */}
      <div className="absolute -right-16 -top-16 w-44 h-44 rounded-full bg-blue-500/10 blur-3xl pointer-events-none" />
      <div className="absolute -left-16 -bottom-16 w-44 h-44 rounded-full bg-amber-500/10 blur-3xl pointer-events-none" />

      {/* vertical gradient bar */}
      <span
        aria-hidden
        className="absolute inset-y-0 left-0 w-1.5 bg-gradient-to-b from-blue-600 via-blue-400 to-emerald-400"
      />

      <div className="flex flex-col items-center gap-6 text-center sm:flex-row sm:items-center sm:gap-8 sm:text-left relative z-10">
        <div className="shrink-0 relative">
          <div className="absolute inset-0 rounded-full bg-blue-500/10 animate-ping opacity-75" />
          <div className="relative bg-white dark:bg-neutral-900 p-2 rounded-full shadow-inner">
            <CircularScore value={overall} size={124} strokeWidth={11} />
          </div>
        </div>
        <div className="space-y-1.5 min-w-0">
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider bg-white/80 dark:bg-black/20 shadow-sm border border-neutral-100 dark:border-neutral-800 text-neutral-500 dark:text-neutral-400">
            Diagnóstico de Aderência
          </span>
          <h2 className="text-2xl md:text-3xl font-extrabold tracking-tight mt-1">
            {config.emoji} {config.label}
          </h2>
          <p className="max-w-prose text-sm leading-relaxed text-neutral-700 dark:text-neutral-300 font-medium">
            {reason}
          </p>
        </div>
      </div>

      <div className="mt-8 grid grid-cols-2 gap-4 sm:grid-cols-4 relative z-10">
        {subScores.map((s) => (
          <div
            key={s.label}
            className="flex flex-col items-center gap-3 rounded-2xl border border-white/60 bg-white/40 dark:border-neutral-800/50 dark:bg-neutral-900/30 p-4 shadow-sm hover:shadow-md transition-all duration-300 backdrop-blur-md"
          >
            <div className="bg-white dark:bg-neutral-950 p-1.5 rounded-full shadow-inner">
              <CircularScore value={s.value} size={48} strokeWidth={5} />
            </div>
            <span className="px-1 text-center text-xs font-semibold text-neutral-600 dark:text-neutral-300">
              {s.label}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}

function SectionHeading({ icon, title }: { icon: string; title: string }) {
  return (
    <div className="flex items-center gap-3 pt-6 pb-2">
      <div className="flex items-center justify-center h-8 w-8 rounded-xl bg-neutral-100 dark:bg-neutral-900 border border-neutral-200/50 dark:border-neutral-800/50 shadow-sm text-sm">
        {icon}
      </div>
      <h2 className="text-xs font-extrabold uppercase tracking-wider text-neutral-800 dark:text-neutral-200">
        {title}
      </h2>
      <div className="h-[2px] flex-1 bg-gradient-to-r from-neutral-200 to-transparent dark:from-neutral-800" />
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
  return (
    <section className="space-y-6">
      <ScoreHero
        status={result.applicationStatus}
        reason={result.applicationStatusReason}
        overall={result.overallScore}
        technical={result.technicalScore}
        experience={result.experienceScore}
        seniority={result.seniorityScore}
        ats={result.atsScore}
      />

      {/* DIAGNÓSTICO — o que a vaga pede e o que já bate */}
      <SectionHeading icon="🎯" title="Diagnóstico" />
      <div className="grid gap-6 md:grid-cols-2">
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
          title="Vagas mais adequadas para o seu momento agora"
          items={result.alternativeRoles}
        />
      )}

      {/* SEU CURRÍCULO — leitura do que você tem hoje e o que ajustar */}
      <SectionHeading icon="📄" title="Seu currículo" />
      <div className="grid gap-6 md:grid-cols-2">
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
        title="Antes de aplicar, corrija isso"
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
            title="Habilidades transferíveis da sua experiência anterior"
            items={result.transferableSkills}
          />
        )}
      <SummaryCard
        icon="📝"
        title="Resumo profissional sugerido"
        summary={result.suggestedSummary}
      />

      {/* PREPARAÇÃO — entrevista e estudo */}
      <SectionHeading icon="🎓" title="Preparação" />
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
              title='Resposta pronta: "Por que você quer mudar de área?"'
              summary={result.whyCareerChangeAnswer}
            />
          )}
          {result.bridgeRoles && result.bridgeRoles.length > 0 && (
            <OrderedListCard
              icon="🪜"
              title="Cargos-ponte até seu objetivo"
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
      <StudyPlanCard plan={result.studyPlan} />

      {/* COMPORTAMENTAL & SOFT SKILLS */}
      <SectionHeading icon="🧠" title="Mapeamento comportamental" />
      <BehavioralFitCard jobTitle={jobTitle} behavioralResult={behavioralResult} />

      {/* AÇÃO — o próximo passo concreto */}
      <SectionHeading icon="✉️" title="Próxima ação" />
      <SummaryCard
        icon="✉️"
        tone="primary"
        title="Mensagem pronta para o recrutador"
        summary={result.recruiterMessage}
      />
      {careerTrack === "career_change" && (
        <p className="text-sm text-neutral-600 dark:text-neutral-400">
          <Link href="/tools/career-change-guide" className="text-blue-600 dark:text-blue-400 hover:underline font-medium">
            Ver guia completo de transição de carreira →
          </Link>
        </p>
      )}
      {careerTrack === "reemployment" && (
        <p className="text-sm text-neutral-600 dark:text-neutral-400">
          <Link href="/tools/reemployment-guide" className="text-blue-600 dark:text-blue-400 hover:underline font-medium">
            Ver guia completo de recolocação →
          </Link>
        </p>
      )}
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
      <div className="rounded-2xl border border-blue-200 dark:border-blue-900 bg-blue-50/30 dark:bg-blue-950/20 p-6 flex flex-col md:flex-row items-center justify-between gap-6">
        <div className="space-y-2">
          <div className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-blue-100 text-blue-800 dark:bg-blue-950 dark:text-blue-300 border border-blue-200 dark:border-blue-850">
            <span className="h-1.5 w-1.5 rounded-full bg-blue-500 animate-pulse" />
            <span>Novo Recurso Premium</span>
          </div>
          <h3 className="font-bold text-lg leading-tight">Mapeamento Comportamental & Soft Skills</h3>
          <p className="text-sm text-neutral-600 dark:text-neutral-400 max-w-xl">
            Descubra como seu perfil comportamental e suas habilidades interpessoais se alinham a esta vaga de <strong>{jobTitle}</strong>. Responda o quiz rápido de 5 minutos para liberar esta análise!
          </p>
        </div>
        <Link
          href="/tools/behavioral-test"
          className="inline-flex items-center gap-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-sm font-semibold px-5 py-3 shadow-sm shadow-blue-600/25 transition-all shrink-0 cursor-pointer w-full md:w-auto justify-center"
        >
          <span>Fazer Teste Comportamental</span>
          <span>→</span>
        </Link>
      </div>
    );
  }

  let skills: Record<SoftSkillDimension, number> = {} as any;
  try {
    skills = JSON.parse(behavioralResult.skillScores);
  } catch (e) {
    return null;
  }

  const primaryTraitLabel = behavioralResult.personalityLabel;
  const primaryTraitDesc = behavioralResult.summary;

  return (
    <div className="rounded-2xl border border-neutral-200 dark:border-neutral-800 bg-white dark:bg-neutral-950 p-6 shadow-sm space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b border-neutral-100 dark:border-neutral-900 pb-4">
        <div>
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider bg-emerald-50 text-emerald-700 dark:bg-emerald-950/30 dark:text-emerald-400 border border-emerald-100 dark:border-emerald-900/40">
            Aderência Comportamental
          </span>
          <h3 className="font-bold text-lg mt-2">Mapeamento Comportamental & Soft Skills</h3>
        </div>
        <Link
          href="/tools/behavioral-test"
          className="text-xs text-blue-600 dark:text-blue-400 hover:underline font-semibold shrink-0 cursor-pointer"
        >
          Refazer teste comportamental →
        </Link>
      </div>

      <div className="grid gap-6 md:grid-cols-12">
        <div className="md:col-span-5 space-y-3 p-4 rounded-xl bg-neutral-50 dark:bg-neutral-900/30 border border-neutral-200/50 dark:border-neutral-800/50">
          <p className="text-xs font-semibold text-neutral-500 uppercase tracking-wider font-medium">Seu Perfil Dominante</p>
          <p className="font-bold text-base text-blue-600 dark:text-blue-400">{primaryTraitLabel}</p>
          <p className="text-xs text-neutral-600 dark:text-neutral-400 leading-relaxed">
            {primaryTraitDesc}
          </p>
          <div className="pt-2">
            <p className="text-[11px] font-semibold text-neutral-500 dark:text-neutral-400 font-medium">Dica para a Vaga de {jobTitle}:</p>
            <p className="text-xs text-neutral-600 dark:text-neutral-400 leading-relaxed mt-1">
              Destaque na entrevista como sua personalidade de {primaryTraitLabel.toLowerCase()} o ajudará a gerar valor imediato como <strong>{jobTitle}</strong>.
            </p>
          </div>
        </div>

        <div className="md:col-span-7 space-y-4">
          <p className="text-xs font-semibold text-neutral-500 uppercase tracking-wider font-medium">Pontuação de Soft Skills</p>
          <div className="grid gap-3">
            {Object.entries(skills).map(([dim, score]) => (
              <ScoreBar key={dim} label={SOFT_SKILL_LABELS[dim as SoftSkillDimension]} value={score} />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
