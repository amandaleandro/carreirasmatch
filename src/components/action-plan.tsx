"use client";

import { useState } from "react";
import Link from "next/link";
import { CircularScore } from "@/components/circular-score";

type StudyPlanPhased = { essential: string[]; niceToHave: string[]; later: string[] };
type PriorityGap = { skill: string; proficiency: number };

type PlanItem = { key: string; title: string; description: string };

const IDEAL_TARGET = 85;

const COURSE_CATALOG: Record<string, { title: string; provider: string; duration: string }> = {
  terraform: { title: "Terraform para Iniciantes", provider: "HashiCorp Learn", duration: "5h" },
  aws: { title: "AWS Cloud Practitioner Essentials", provider: "AWS Skill Builder", duration: "6h" },
  docker: { title: "Docker: Da Base ao Avançado", provider: "Docker Docs", duration: "7h" },
  kubernetes: { title: "Kubernetes na Prática", provider: "Kubernetes.io", duration: "8h" },
  "ci/cd": { title: "GitHub Actions na Prática", provider: "GitHub Docs", duration: "4h" },
  "github actions": { title: "GitHub Actions na Prática", provider: "GitHub Docs", duration: "4h" },
  python: { title: "Python para Dados", provider: "Python.org", duration: "6h" },
  sql: { title: "SQL do Zero ao Avançado", provider: "Mode Analytics", duration: "5h" },
  "power bi": { title: "Power BI Essentials", provider: "Microsoft Learn", duration: "5h" },
  "power bi.": { title: "Power BI Essentials", provider: "Microsoft Learn", duration: "5h" },
  inglês: { title: "Inglês Técnico para TI", provider: "Estudo dirigido", duration: "contínuo" },
  monitoramento: { title: "Observabilidade e Monitoramento", provider: "Grafana Labs", duration: "4h" },
};

function courseFor(skill: string) {
  const key = skill.toLowerCase();
  const match = Object.keys(COURSE_CATALOG).find((k) => key.includes(k));
  if (match) return COURSE_CATALOG[match];
  return { title: `Fundamentos de ${skill}`, provider: "Estudo dirigido", duration: "3-5h" };
}

function GoalIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" className={className}>
      <circle cx="12" cy="12" r="8.5" stroke="currentColor" strokeWidth="1.8" />
      <circle cx="12" cy="12" r="4" stroke="currentColor" strokeWidth="1.8" />
      <circle cx="12" cy="12" r="1" fill="currentColor" />
    </svg>
  );
}
function CalendarIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" className={className}>
      <rect x="3.5" y="5" width="17" height="15.5" rx="2" stroke="currentColor" strokeWidth="1.8" />
      <path d="M3.5 9.5h17M8 3v4M16 3v4" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
    </svg>
  );
}
function BookIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" className={className}>
      <path d="M4 5.5A2.5 2.5 0 0 1 6.5 3H20v15.5H6.5A2.5 2.5 0 0 0 4 21V5.5Z" stroke="currentColor" strokeWidth="1.8" strokeLinejoin="round" />
      <path d="M4 18.5A2.5 2.5 0 0 1 6.5 16H20" stroke="currentColor" strokeWidth="1.8" strokeLinejoin="round" />
    </svg>
  );
}
function ToolIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" className={className}>
      <path d="M14.5 6.5a3.5 3.5 0 0 1-4.6 4.6L4 17l3 3 5.9-5.9a3.5 3.5 0 0 1 4.6-4.6L14.5 6.5Z" stroke="currentColor" strokeWidth="1.6" strokeLinejoin="round" />
    </svg>
  );
}
function FlagIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" className={className}>
      <path d="M6 21V4" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
      <path d="M6 4h11l-2.5 3.5L17 11H6" stroke="currentColor" strokeWidth="1.8" strokeLinejoin="round" />
    </svg>
  );
}
function PersonIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" className={className}>
      <circle cx="12" cy="8" r="3.5" stroke="currentColor" strokeWidth="1.8" />
      <path d="M5 20c1.5-4 4.5-5.5 7-5.5s5.5 1.5 7 5.5" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
    </svg>
  );
}
function DocIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" className={className}>
      <path d="M7 3h7l5 5v13a1 1 0 0 1-1 1H7a1 1 0 0 1-1-1V4a1 1 0 0 1 1-1Z" stroke="currentColor" strokeWidth="1.6" strokeLinejoin="round" />
      <path d="M9 12h6M9 16h6" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
    </svg>
  );
}
function CheckIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" className={className}>
      <path d="m5 12.5 4.5 4.5L19 7" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

export function ActionPlan({
  analysisId,
  jobTitle,
  overallScore,
  fixes,
  studyPlan,
  priorityGaps,
  applyNowCount,
  initialChecked,
  careerTrack,
  bridgeRoles,
  transitionNarrative,
  whyCareerChangeAnswer,
}: {
  analysisId: string;
  jobTitle: string;
  overallScore: number;
  fixes: string[];
  studyPlan: StudyPlanPhased;
  priorityGaps: PriorityGap[];
  applyNowCount: number;
  initialChecked: string[];
  careerTrack?: string;
  bridgeRoles?: string[];
  transitionNarrative?: string | null;
  whyCareerChangeAnswer?: string | null;
}) {
  const today: PlanItem[] = fixes.slice(0, 2).map((f, i) => ({
    key: `today-${i}`,
    title: f,
    description: "Ajuste no currículo com base no diagnóstico da última análise.",
  }));

  const thisWeek: PlanItem[] = [
    ...studyPlan.essential.slice(0, 2).map((s, i) => ({
      key: `week-study-${i}`,
      title: `Estudar ${s}`,
      description: "Fundamento essencial identificado como lacuna prioritária.",
    })),
    {
      key: "week-linkedin",
      title: "Revisar e otimizar perfil no LinkedIn",
      description: "Atualize título, resumo e experiências com as palavras-chave da vaga.",
    },
  ];

  const isCareerChange = careerTrack === "career_change";
  const nextBridgeRole = bridgeRoles?.[0];

  const next15Days: PlanItem[] = [
    ...studyPlan.niceToHave.slice(0, 1).map((s, i) => ({
      key: `next-study-${i}`,
      title: `Aprender ${s}`,
      description: "Reforço técnico para se diferenciar na candidatura.",
    })),
    ...(isCareerChange && nextBridgeRole
      ? [
          {
            key: "next-bridge-role",
            title: `Buscar vagas de "${nextBridgeRole}"`,
            description: "Cargo-ponte mais acessível para entrar na área nova sem dar um salto grande demais.",
          },
        ]
      : [
          {
            key: "next-cicd",
            title: "Praticar um projeto ponta a ponta",
            description: "Consolide o que foi estudado em um projeto real para o portfólio.",
          },
        ]),
    {
      key: "next-apply",
      title: `Candidatar-se a vagas alinhadas`,
      description:
        applyNowCount > 0
          ? `Você já tem ${applyNowCount} vaga(s) com aderência alta — aplique agora.`
          : "Aplique e acompanhe o progresso das suas candidaturas.",
    },
  ];

  const buckets: { label: string; icon: (p: { className?: string }) => React.JSX.Element; items: PlanItem[] }[] = [
    { label: "Hoje", icon: CalendarIcon, items: today },
    { label: "Esta semana", icon: BookIcon, items: thisWeek },
    { label: "Próximos 15 dias", icon: FlagIcon, items: next15Days },
  ];

  const [checked, setChecked] = useState<Set<string>>(new Set(initialChecked));
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  async function persist(next: Set<string>) {
    setSaving(true);
    try {
      await fetch(`/api/action-plan/${analysisId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ checked: Array.from(next) }),
      });
      setSaved(true);
      setTimeout(() => setSaved(false), 2000);
    } finally {
      setSaving(false);
    }
  }

  function toggle(key: string) {
    setChecked((prev) => {
      const next = new Set(prev);
      if (next.has(key)) next.delete(key);
      else next.add(key);
      persist(next);
      return next;
    });
  }

  const deltaPP = Math.max(IDEAL_TARGET - overallScore, 0);
  const weekTotal = thisWeek.length;
  const weekDone = thisWeek.filter((i) => checked.has(i.key)).length;

  return (
    <div className="px-4 md:px-8 py-8 max-w-6xl mx-auto w-full space-y-6">
      <div>
        <h1 className="text-2xl md:text-3xl font-bold tracking-tight">Seu plano de ação</h1>
        <p className="text-neutral-600 dark:text-neutral-400 mt-2">
          Veja o que você pode fazer nos próximos 15 dias para chegar ao seu
          próximo objetivo.
        </p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="rounded-xl border border-neutral-200 dark:border-neutral-800 p-4 flex gap-3 items-start">
          <span className="h-9 w-9 rounded-lg bg-blue-50 dark:bg-blue-950/40 text-blue-600 dark:text-blue-400 flex items-center justify-center shrink-0">
            <GoalIcon className="h-5 w-5" />
          </span>
          <div>
            <p className="text-xs text-neutral-500">Objetivo</p>
            <p className="font-semibold">{jobTitle}</p>
            <p className="text-xs text-neutral-500 mt-0.5">
              Cargo-alvo definido com base no seu perfil e aderência.
            </p>
          </div>
        </div>

        <div className="rounded-xl border border-neutral-200 dark:border-neutral-800 p-4 flex gap-3 items-start">
          <span className="h-9 w-9 rounded-lg bg-emerald-50 dark:bg-emerald-950/40 text-emerald-600 dark:text-emerald-400 flex items-center justify-center shrink-0">
            <CalendarIcon className="h-5 w-5" />
          </span>
          <div>
            <p className="text-xs text-neutral-500">Prazo sugerido</p>
            <p className="font-semibold">15 dias</p>
            <p className="text-xs text-neutral-500 mt-0.5">
              Período ideal para ganhos consistentes de aderência.
            </p>
          </div>
        </div>

        <div className="rounded-xl border border-neutral-200 dark:border-neutral-800 p-4 flex gap-3 items-center">
          <CircularScore value={overallScore} size={48} strokeWidth={5} />
          <div>
            <p className="text-xs text-neutral-500">Aderência atual</p>
            <p className="font-semibold">{overallScore}%</p>
            <p className="text-xs text-neutral-500 mt-0.5">
              {deltaPP > 0
                ? `Você está a ${deltaPP}pp da aderência ideal para seu objetivo.`
                : "Você já está na faixa ideal de aderência!"}
            </p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-start">
        <div className="lg:col-span-2 rounded-xl border border-neutral-200 dark:border-neutral-800 p-6">
          <h2 className="font-semibold mb-4">Plano personalizado</h2>
          <div className="space-y-6">
            {buckets.map((bucket) => {
              const Icon = bucket.icon;
              return (
                <div key={bucket.label} className="flex gap-4">
                  <div className="flex flex-col items-center">
                    <span className="h-3 w-3 rounded-full bg-blue-600 mt-1.5" />
                    <span className="h-10 w-10 rounded-full bg-neutral-100 dark:bg-neutral-800 flex items-center justify-center mt-2 text-neutral-500">
                      <Icon className="h-5 w-5" />
                    </span>
                    <span className="w-px flex-1 bg-neutral-200 dark:bg-neutral-800 mt-2" />
                  </div>
                  <div className="flex-1 pb-2">
                    <p className="text-sm font-semibold text-blue-600 dark:text-blue-400 mb-2">
                      {bucket.label}
                    </p>
                    <div className="space-y-2">
                      {bucket.items.map((item) => (
                        <label
                          key={item.key}
                          className="flex items-start gap-3 rounded-lg border border-neutral-200 dark:border-neutral-800 p-3 cursor-pointer"
                        >
                          <input
                            type="checkbox"
                            checked={checked.has(item.key)}
                            onChange={() => toggle(item.key)}
                            className="mt-0.5 h-4 w-4 shrink-0"
                          />
                          <DocIcon className="h-4 w-4 text-neutral-400 mt-0.5 shrink-0" />
                          <div>
                            <p
                              className={`text-sm font-medium ${
                                checked.has(item.key) ? "line-through text-neutral-400" : ""
                              }`}
                            >
                              {item.title}
                            </p>
                            <p className="text-xs text-neutral-500 mt-0.5">{item.description}</p>
                          </div>
                        </label>
                      ))}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
          <p className="text-xs text-neutral-500 flex items-center gap-1.5 mt-2">
            💡 Dica: marque as ações conforme concluir para manter seu plano sempre atualizado.
          </p>
        </div>

        <div className="space-y-6">
          {isCareerChange && bridgeRoles && bridgeRoles.length > 0 && (
            <div className="rounded-xl border border-orange-200 dark:border-orange-900/50 bg-orange-50/40 dark:bg-orange-950/10 p-6">
              <div className="flex items-center gap-2 mb-1">
                <span className="h-7 w-7 rounded-lg bg-orange-100 dark:bg-orange-950/40 text-orange-600 dark:text-orange-400 flex items-center justify-center shrink-0">
                  <FlagIcon className="h-4 w-4" />
                </span>
                <h2 className="font-semibold">Sua rota de cargos-ponte</h2>
              </div>
              <p className="text-xs text-neutral-500 mb-4">
                Do mais acessível ao mais próximo do seu objetivo final.
              </p>
              <ol className="space-y-2">
                {bridgeRoles.map((role, i) => (
                  <li
                    key={role}
                    className="flex items-center gap-3 rounded-lg border border-orange-100 dark:border-orange-900/40 bg-white/70 dark:bg-transparent px-3 py-2 text-sm"
                  >
                    <span className="h-5 w-5 rounded-full bg-orange-600 text-white text-[10px] font-bold flex items-center justify-center shrink-0">
                      {i + 1}
                    </span>
                    <span className={i === 0 ? "font-semibold" : "text-neutral-600 dark:text-neutral-400"}>
                      {role}
                    </span>
                  </li>
                ))}
              </ol>
              {transitionNarrative && (
                <div className="mt-4 pt-4 border-t border-orange-100 dark:border-orange-900/40">
                  <p className="text-xs font-semibold uppercase tracking-wide text-orange-700 dark:text-orange-400 mb-1.5">
                    Narrativa de transição
                  </p>
                  <p className="text-sm text-neutral-700 dark:text-neutral-300 leading-relaxed">
                    {transitionNarrative}
                  </p>
                </div>
              )}
              {whyCareerChangeAnswer && (
                <div className="mt-4 pt-4 border-t border-orange-100 dark:border-orange-900/40">
                  <p className="text-xs font-semibold uppercase tracking-wide text-orange-700 dark:text-orange-400 mb-1.5">
                    {'"Por que você quer mudar de área?"'}
                  </p>
                  <p className="text-sm text-neutral-700 dark:text-neutral-300 leading-relaxed">
                    {whyCareerChangeAnswer}
                  </p>
                </div>
              )}
            </div>
          )}

          <div className="rounded-xl border border-neutral-200 dark:border-neutral-800 p-6">
            <h2 className="font-semibold mb-4">Lacunas prioritárias</h2>
            <div className="space-y-3">
              {priorityGaps.map((gap) => (
                <div key={gap.skill}>
                  <div className="flex justify-between text-sm mb-1">
                    <span>{gap.skill}</span>
                    <span className="text-neutral-500">{gap.proficiency}%</span>
                  </div>
                  <div className="h-2 w-full rounded-full bg-neutral-200 dark:bg-neutral-800">
                    <div
                      className="h-2 rounded-full bg-blue-600"
                      style={{ width: `${gap.proficiency}%` }}
                    />
                  </div>
                </div>
              ))}
              {priorityGaps.length === 0 && (
                <p className="text-sm text-neutral-500">
                  Nenhuma lacuna crítica identificada na última análise.
                </p>
              )}
            </div>
          </div>

          <div className="rounded-xl border border-neutral-200 dark:border-neutral-800 p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="font-semibold">Cursos e temas recomendados</h2>
            </div>
            <div className="grid grid-cols-1 gap-3">
              {priorityGaps.slice(0, 4).map((gap, i) => {
                const course = courseFor(gap.skill);
                const priority = i === 0 || i === 1 ? "Alta" : "Média";
                return (
                  <div
                    key={gap.skill}
                    className="flex items-center gap-3 rounded-lg border border-neutral-200 dark:border-neutral-800 p-3"
                  >
                    <span className="h-9 w-9 rounded-md bg-neutral-100 dark:bg-neutral-800 flex items-center justify-center shrink-0 text-neutral-500">
                      <ToolIcon className="h-4 w-4" />
                    </span>
                    <div className="min-w-0 flex-1">
                      <p className="text-sm font-medium truncate">{course.title}</p>
                      <p className="text-xs text-neutral-500">{course.provider}</p>
                    </div>
                    <div className="text-right shrink-0">
                      <p className="text-xs text-neutral-500">{course.duration}</p>
                      <span
                        className={`text-[10px] font-medium rounded px-1.5 py-0.5 ${
                          priority === "Alta"
                            ? "bg-red-50 text-red-600 dark:bg-red-950/40 dark:text-red-400"
                            : "bg-amber-50 text-amber-600 dark:bg-amber-950/40 dark:text-amber-400"
                        }`}
                      >
                        {priority}
                      </span>
                    </div>
                  </div>
                );
              })}
              {priorityGaps.length === 0 && (
                <p className="text-sm text-neutral-500">
                  Sem recomendações de curso no momento.
                </p>
              )}
            </div>
          </div>

          <div className="rounded-xl border border-neutral-200 dark:border-neutral-800 p-6">
            <div className="flex items-center gap-3">
              <span className="h-9 w-9 rounded-lg bg-blue-50 dark:bg-blue-950/40 text-blue-600 dark:text-blue-400 flex items-center justify-center shrink-0">
                <GoalIcon className="h-5 w-5" />
              </span>
              <div className="flex-1">
                <p className="text-sm font-medium">Meta da semana</p>
                <p className="text-xs text-neutral-500">
                  Conclua {weekTotal} de {weekTotal} ações desta semana. Mantenha o foco e avance!
                </p>
                <div className="h-1.5 w-full rounded-full bg-neutral-200 dark:bg-neutral-800 mt-2">
                  <div
                    className="h-1.5 rounded-full bg-emerald-500"
                    style={{ width: `${weekTotal ? (weekDone / weekTotal) * 100 : 0}%` }}
                  />
                </div>
              </div>
              <span className="text-sm font-semibold shrink-0">
                {weekDone}/{weekTotal}
              </span>
            </div>
          </div>
        </div>
      </div>

      <div className="flex flex-wrap gap-3">
        <button
          type="button"
          onClick={() => persist(checked)}
          disabled={saving}
          className="flex items-center gap-1.5 rounded-md bg-blue-600 text-white font-medium px-5 py-2.5 hover:bg-blue-700 transition-colors disabled:opacity-50"
        >
          <CheckIcon className="h-4 w-4" />
          {saved ? "Progresso salvo ✓" : saving ? "Salvando..." : "Marcar progresso"}
        </button>
        <Link
          href="/dashboard"
          className="flex items-center gap-1.5 rounded-md border border-neutral-300 dark:border-neutral-700 font-medium px-5 py-2.5 hover:bg-neutral-50 dark:hover:bg-neutral-900 transition-colors"
        >
          <PersonIcon className="h-4 w-4" />
          Ver evolução do plano
        </Link>
      </div>
    </div>
  );
}
