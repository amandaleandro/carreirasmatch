import Link from "next/link";
import { ChecklistCard } from "@/components/checklist-card";
import { InterviewSimulator } from "@/components/interview-simulator";

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
      ? "bg-emerald-100 text-emerald-800 dark:bg-emerald-900/50 dark:text-emerald-300"
      : "bg-red-100 text-red-800 dark:bg-red-900/50 dark:text-red-300";
  return (
    <div className="rounded-xl border border-neutral-200 dark:border-neutral-800 p-5">
      <h3 className="font-semibold mb-3">{title}</h3>
      {items.length === 0 ? (
        <p className="text-sm text-neutral-500">Nenhum item identificado.</p>
      ) : (
        <div className="flex flex-wrap gap-2">
          {items.map((item, i) => (
            <span key={i} className={`text-xs rounded-full px-3 py-1 ${chipClass}`}>
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

export function ListCard({ title, items }: { title: string; items: string[] }) {
  return (
    <div className="rounded-xl border border-neutral-200 dark:border-neutral-800 p-5">
      <h3 className="font-semibold mb-3">{title}</h3>
      {items.length === 0 ? (
        <p className="text-sm text-neutral-500">Nenhum item identificado nesta análise.</p>
      ) : (
        <ul className="space-y-2 list-disc list-inside text-sm text-neutral-700 dark:text-neutral-300">
          {items.map((item, i) => (
            <li key={i}>{item}</li>
          ))}
        </ul>
      )}
    </div>
  );
}

export function SummaryCard({
  title,
  summary,
}: {
  title: string;
  summary: string;
}) {
  return (
    <div className="rounded-xl border border-neutral-200 dark:border-neutral-800 p-5">
      <h3 className="font-semibold mb-3">{title}</h3>
      <p className="text-sm text-neutral-700 dark:text-neutral-300 whitespace-pre-line">
        {summary}
      </p>
    </div>
  );
}

export function OrderedListCard({
  title,
  items,
}: {
  title: string;
  items: string[];
}) {
  return (
    <div className="rounded-xl border border-neutral-200 dark:border-neutral-800 p-5">
      <h3 className="font-semibold mb-3">{title}</h3>
      <ol className="space-y-2 list-decimal list-inside text-sm text-neutral-700 dark:text-neutral-300">
        {items.map((item, i) => (
          <li key={i}>{item}</li>
        ))}
      </ol>
    </div>
  );
}

export function StudyPlanCard({ plan }: { plan: StudyPlanPhased }) {
  const groups: { label: string; items: string[] }[] = [
    { label: "Essencial", items: plan.essential },
    { label: "Bom ter", items: plan.niceToHave },
    { label: "Pode ficar para depois", items: plan.later },
  ];
  return (
    <div className="rounded-xl border border-neutral-200 dark:border-neutral-800 p-5">
      <h3 className="font-semibold mb-3">Plano de estudo</h3>
      <div className="space-y-4">
        {groups.map(
          (group) =>
            group.items.length > 0 && (
              <div key={group.label}>
                <p className="text-xs font-semibold uppercase tracking-wide text-neutral-500 mb-1.5">
                  {group.label}
                </p>
                <ul className="space-y-1 list-disc list-inside text-sm text-neutral-700 dark:text-neutral-300">
                  {group.items.map((item, i) => (
                    <li key={i}>{item}</li>
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

      <div className="rounded-xl border border-neutral-200 dark:border-neutral-800 p-5 space-y-4">
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

      <ListCard title="Pontos fortes" items={result.strengths} />
      <ListCard title="Pontos fracos" items={result.weaknesses} />

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
  result: Pick<Analysis, "overallScore">;
  children?: React.ReactNode;
}) {
  const level = fitLevelFromScore(result.overallScore);
  const config = FIT_CONFIG[level];
  return (
    <section className="space-y-6">
      <div className={`rounded-2xl border p-6 md:p-8 text-center space-y-3 ${config.className}`}>
        <p className="text-4xl">{config.emoji}</p>
        <p className="font-bold text-lg md:text-xl">{config.label}</p>
        <p className="text-sm text-neutral-700 dark:text-neutral-300 max-w-md mx-auto">
          {config.message}
        </p>
      </div>
      {children}
    </section>
  );
}

export function AnalysisResult({
  result,
  careerTrack,
  jobTitle = "",
}: {
  result: Analysis;
  careerTrack: CareerTrack;
  jobTitle?: string;
}) {
  return (
    <section className="space-y-6">
      <StatusBanner
        status={result.applicationStatus}
        reason={result.applicationStatusReason}
      />

      <div className="rounded-xl border border-neutral-200 dark:border-neutral-800 p-5 space-y-4">
        <h2 className="font-semibold text-lg">Diagnóstico para esta vaga</h2>
        <ScoreBar label="Aderência geral" value={result.overallScore} />
        <ScoreBar label="Técnica" value={result.technicalScore} />
        <ScoreBar label="Experiência" value={result.experienceScore} />
        <ScoreBar label="Senioridade" value={result.seniorityScore} />
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

      <SummaryCard title="Resumo profissional sugerido" summary={result.suggestedSummary} />

      {(careerTrack === "internship" || careerTrack === "apprentice") &&
        result.talkAboutYourselfAnswer && (
        <SummaryCard
          title='Resposta pronta: "Fale sobre você"'
          summary={result.talkAboutYourselfAnswer}
        />
      )}

      {careerTrack === "career_change" && (
        <>
          {result.transferableSkills && result.transferableSkills.length > 0 && (
            <ListCard
              title="Habilidades transferíveis da sua experiência anterior"
              items={result.transferableSkills}
            />
          )}
          {result.transitionNarrative && (
            <SummaryCard
              title="Narrativa de transição (LinkedIn/entrevista)"
              summary={result.transitionNarrative}
            />
          )}
          {result.whyCareerChangeAnswer && (
            <SummaryCard
              title='Resposta pronta: "Por que você quer mudar de área?"'
              summary={result.whyCareerChangeAnswer}
            />
          )}
          {result.bridgeRoles && result.bridgeRoles.length > 0 && (
            <OrderedListCard
              title="Cargos-ponte até seu objetivo"
              items={result.bridgeRoles}
            />
          )}
          <p className="text-sm text-neutral-600 dark:text-neutral-400">
            <Link href="/tools/career-change-guide" className="text-blue-600 dark:text-blue-400 hover:underline font-medium">
              Ver guia completo de transição de carreira →
            </Link>
          </p>
        </>
      )}

      {careerTrack === "reemployment" && (
        <>
          {result.recruiterObjections && result.recruiterObjections.length > 0 && (
            <ListCard
              title="Objeções prováveis do recrutador"
              items={result.recruiterObjections}
            />
          )}
          {result.applicationStrategy && (
            <SummaryCard
              title="Estratégia de candidatura"
              summary={result.applicationStrategy}
            />
          )}
          {result.weeklyApplicationPlan && result.weeklyApplicationPlan.length > 0 && (
            <OrderedListCard
              title="Plano semanal de candidaturas"
              items={result.weeklyApplicationPlan}
            />
          )}
          {result.feedbackAnalysis && (
            <SummaryCard
              title="Análise dos feedbacks recebidos"
              summary={result.feedbackAnalysis}
            />
          )}
          <p className="text-sm text-neutral-600 dark:text-neutral-400">
            <Link href="/tools/reemployment-guide" className="text-blue-600 dark:text-blue-400 hover:underline font-medium">
              Ver guia completo de recolocação →
            </Link>
          </p>
        </>
      )}

      {result.alternativeRoles && result.alternativeRoles.length > 0 && (
        <ListCard
          title="Vagas mais adequadas para o seu momento agora"
          items={result.alternativeRoles}
        />
      )}

      <ListCard title="Pontos fortes" items={result.strengths} />
      <ListCard title="Pontos fracos" items={result.weaknesses} />
      <ListCard title="Antes de aplicar, corrija isso" items={result.fixes} />

      {(careerTrack === "internship" || careerTrack === "apprentice") && (
        <ChecklistCard items={result.fixes} />
      )}

      <ListCard
        title="Perguntas prováveis da entrevista"
        items={result.interviewQuestions}
      />
      <InterviewSimulator questions={result.interviewQuestions} jobTitle={jobTitle} />
      <StudyPlanCard plan={result.studyPlan} />
      <SummaryCard title="Mensagem pronta para o recrutador" summary={result.recruiterMessage} />
    </section>
  );
}
