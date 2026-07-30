import Link from "next/link";
import { FileText, ClipboardCheck, Briefcase, Brain, Compass, GraduationCap, Target } from "lucide-react";
import { formatBrazilDate } from "@/lib/brazil";
import { VOCATION_AREAS } from "@/lib/vocation-areas";

type CareerProfileHubProps = {
  objectiveLabel: string | null;
  resume: { id: string; fileName: string; createdAt: Date } | null;
  analysesCount: number;
  applicationsCount: number;
  softSkillResult: { personalityLabel: string; createdAt: Date } | null;
  vocationResult: { areaSlug: string; createdAt: Date } | null;
  coursesCount: number;
};

/** Hub que reúne, numa só tela, o que hoje fica espalhado entre /resume, /report,
 * /applications, os testes vocacional/comportamental e os cursos salvos — sem
 * duplicar nenhuma dessas telas, só linkando pra cada uma com o estado atual. */
export function CareerProfileHub({
  objectiveLabel,
  resume,
  analysesCount,
  applicationsCount,
  softSkillResult,
  vocationResult,
  coursesCount,
}: CareerProfileHubProps) {
  const vocationLabel = VOCATION_AREAS.find((a) => a.slug === vocationResult?.areaSlug)?.label ?? null;

  const cards = [
    {
      icon: FileText,
      title: "Currículo",
      status: resume ? resume.fileName : "Nenhum currículo enviado ainda",
      meta: resume ? `Atualizado em ${formatBrazilDate(resume.createdAt)}` : null,
      href: resume ? "/resume" : "/curriculo-gratis",
      cta: resume ? "Ver currículo" : "Criar currículo",
    },
    {
      icon: ClipboardCheck,
      title: "Análises",
      status: analysesCount > 0 ? `${analysesCount} análise${analysesCount > 1 ? "s" : ""} feita${analysesCount > 1 ? "s" : ""}` : "Nenhuma análise ainda",
      meta: null,
      href: analysesCount > 0 ? "/history" : "/analise",
      cta: analysesCount > 0 ? "Ver histórico" : "Analisar currículo",
    },
    {
      icon: Briefcase,
      title: "Candidaturas",
      status: applicationsCount > 0 ? `${applicationsCount} candidatura${applicationsCount > 1 ? "s" : ""} registrada${applicationsCount > 1 ? "s" : ""}` : "Nenhuma candidatura ainda",
      meta: null,
      href: "/applications",
      cta: "Ver candidaturas",
    },
    {
      icon: Brain,
      title: "Perfil comportamental",
      status: softSkillResult ? softSkillResult.personalityLabel : "Teste ainda não feito",
      meta: softSkillResult ? `Feito em ${formatBrazilDate(softSkillResult.createdAt)}` : null,
      href: "/tools/behavioral-test",
      cta: softSkillResult ? "Refazer teste" : "Fazer teste",
    },
    {
      icon: Compass,
      title: "Área vocacional",
      status: vocationLabel ?? "Teste ainda não feito",
      meta: vocationResult ? `Feito em ${formatBrazilDate(vocationResult.createdAt)}` : null,
      href: "/tools/vocation-test",
      cta: vocationResult ? "Refazer teste" : "Fazer teste",
    },
    {
      icon: GraduationCap,
      title: "Cursos",
      status: coursesCount > 0 ? `${coursesCount} curso${coursesCount > 1 ? "s" : ""} registrado${coursesCount > 1 ? "s" : ""}` : "Nenhum curso registrado",
      meta: null,
      href: "/tools",
      cta: "Explorar cursos",
    },
  ];

  return (
    <div className="px-4 md:px-8 pt-8 max-w-6xl mx-auto w-full space-y-4">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 pb-2">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-slate-900 dark:text-white">
            Meu perfil de carreira
          </h1>
          {objectiveLabel ? (
            <p className="text-slate-600 dark:text-slate-400 mt-1 text-sm">
              Objetivo atual: <span className="font-semibold text-slate-800 dark:text-slate-200">{objectiveLabel}</span>
            </p>
          ) : (
            <p className="text-slate-600 dark:text-slate-400 mt-1 text-sm">
              Tudo o que você já construiu no CarreirasMatch, num só lugar.
            </p>
          )}
        </div>
        {!objectiveLabel && (
          <Link
            href="/onboarding"
            className="inline-flex items-center gap-1.5 shrink-0 rounded-xl border border-blue-200 dark:border-blue-900 bg-blue-50 dark:bg-blue-950/40 text-blue-700 dark:text-blue-300 text-xs font-semibold px-4 py-2.5 hover:bg-blue-100 dark:hover:bg-blue-950/60 transition-all"
          >
            <Target className="w-3.5 h-3.5" />
            Definir meu objetivo
          </Link>
        )}
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {cards.map((card) => (
          <Link
            key={card.title}
            href={card.href}
            className="group rounded-2xl border border-slate-200/90 dark:border-slate-800 bg-white dark:bg-slate-900 p-5 shadow-xs hover:border-blue-300 dark:hover:border-blue-800 transition-all"
          >
            <span className="inline-flex h-9 w-9 items-center justify-center rounded-xl bg-blue-50 text-blue-600 dark:bg-blue-950/40 dark:text-blue-400">
              <card.icon className="h-4.5 w-4.5" />
            </span>
            <h3 className="mt-3 text-sm font-bold text-slate-900 dark:text-white">{card.title}</h3>
            <p className="mt-1 text-xs text-slate-600 dark:text-slate-400 leading-relaxed">{card.status}</p>
            {card.meta && <p className="mt-0.5 text-[11px] text-slate-400">{card.meta}</p>}
            <span className="mt-3 inline-block text-xs font-semibold text-blue-600 dark:text-blue-400 group-hover:underline">
              {card.cta} →
            </span>
          </Link>
        ))}
      </div>
    </div>
  );
}
