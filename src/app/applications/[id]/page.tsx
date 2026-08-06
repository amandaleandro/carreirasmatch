import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft, ArrowRight, BriefcaseBusiness, CalendarDays, CheckCircle2, Circle, FileText, MessageSquare, Mic, Target } from "lucide-react";
import { prisma } from "@/lib/prisma";
import { requireSubscriptionPage } from "@/lib/require-subscription-page";
import { APPLICATION_STATUS_CONFIG, type ApplicationStatus } from "@/lib/applications";
import { updateApplicationDetails, updateApplicationOutcome } from "@/app/applications/actions";
import { SaveResumeVersionButton } from "@/components/save-resume-version-button";
import { ApplicationKitGenerator } from "@/components/application-kit-generator";
import { FormSubmitButton } from "@/components/form-submit-button";

const STATUS_NEXT_ACTION: Record<string, string> = {
  saved: "Analise a vaga e decida se vale o esforço.",
  tailor_resume: "Revise o currículo com base no Match antes de enviar.",
  applied: "Acompanhe a resposta e prepare um follow-up.",
  interview: "Treine as perguntas prováveis da entrevista.",
  technical_test: "Conclua o teste e registre o resultado.",
  offer: "Avalie a proposta e prepare a negociação.",
  rejected: "Registre o aprendizado para a próxima candidatura.",
};

function parseJson<T>(value: string | null | undefined, fallback: T): T {
  if (!value) return fallback;
  try {
    return JSON.parse(value) as T;
  } catch {
    return fallback;
  }
}

export default async function ApplicationWorkspacePage({ params }: { params: Promise<{ id: string }> }) {
  const session = await requireSubscriptionPage();
  const { id } = await params;
  const application = await prisma.application.findFirst({
    where: { id, userId: session.user.id },
    include: {
      activities: { orderBy: { createdAt: "desc" } },
      analysis: {
        select: {
          id: true,
          overallScore: true,
          applicationStatus: true,
          applicationStatusReason: true,
          keywordsFound: true,
          keywordsMissing: true,
          fixes: true,
          recruiterMessage: true,
          interviewQuestions: true,
          suggestedSummary: true,
          resumeStructured: true,
        },
      },
    },
  });

  if (!application) notFound();

  const analysis = application.analysis;
  const status = application.status as ApplicationStatus;
  const statusLabel = APPLICATION_STATUS_CONFIG[status]?.label ?? application.status;
  const keywordsFound = parseJson<string[]>(analysis?.keywordsFound, []);
  const keywordsMissing = parseJson<string[]>(analysis?.keywordsMissing, []);
  const fixes = parseJson<string[]>(analysis?.fixes, []);
  const checklist = [
    { label: "Vaga analisada", done: Boolean(analysis), href: analysis ? `/report/${analysis.id}` : "/analise", icon: Target },
    { label: "Currículo revisado", done: ["applied", "interview", "technical_test", "offer"].includes(status), href: analysis ? `/report/${analysis.id}` : "/resume", icon: FileText },
    { label: "Candidatura registrada", done: Boolean(application.appliedAt), href: "/applications", icon: CheckCircle2 },
    { label: "Entrevista preparada", done: ["interview", "technical_test", "offer"].includes(status), href: `/interviews/${application.id}`, icon: Mic },
  ];
  const completed = checklist.filter((item) => item.done).length;
  const preparationPercent = Math.round((completed / checklist.length) * 100);

  return (
    <main className="mx-auto w-full max-w-6xl space-y-6 px-4 py-7 sm:px-6 md:px-8 md:py-10">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <Link href="/applications" className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white">
          <ArrowLeft className="h-3.5 w-3.5" /> Voltar às candidaturas
        </Link>
        <span className="rounded-full border border-slate-200 bg-slate-100 px-3 py-1 text-[10px] font-bold uppercase tracking-wider text-slate-600 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-300">
          Workspace por vaga
        </span>
      </div>
      <Link href="/applications/insights" className="inline-flex items-center gap-2 text-xs font-bold text-violet-600 hover:underline dark:text-violet-400"><Target className="h-3.5 w-3.5" /> Ver o aprendizado de todas as candidaturas</Link>

      <header className="rounded-3xl border border-slate-200/80 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-900 md:p-8">
        <div className="flex flex-col gap-5 md:flex-row md:items-start md:justify-between">
          <div className="min-w-0 space-y-2">
            <p className="inline-flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-blue-600 dark:text-blue-400">
              <BriefcaseBusiness className="h-4 w-4" /> Sua candidatura
            </p>
            <h1 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-white sm:text-3xl">{application.jobTitle}</h1>
            <p className="text-sm font-semibold text-slate-500 dark:text-slate-400">{application.company || "Empresa não informada"}</p>
          </div>
          <div className="shrink-0 space-y-2 md:text-right">
            <span className="inline-flex rounded-full border border-blue-200 bg-blue-50 px-3 py-1 text-xs font-bold text-blue-700 dark:border-blue-900 dark:bg-blue-950/40 dark:text-blue-300">{statusLabel}</span>
            <p className="text-xs font-semibold text-slate-500 dark:text-slate-400">Preparação: {preparationPercent}%</p>
          </div>
        </div>
        <div className="mt-6 h-2 overflow-hidden rounded-full bg-slate-100 dark:bg-slate-800">
          <div className="h-full rounded-full bg-blue-600 transition-all" style={{ width: `${preparationPercent}%` }} />
        </div>
        <div className="mt-5 flex flex-col gap-3 rounded-2xl border border-blue-100 bg-blue-50/60 p-4 dark:border-blue-900/50 dark:bg-blue-950/30 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <p className="text-[10px] font-bold uppercase tracking-wider text-blue-600 dark:text-blue-400">Próxima ação</p>
            <p className="mt-1 text-sm font-semibold text-slate-800 dark:text-slate-100">{STATUS_NEXT_ACTION[status] ?? "Defina o próximo passo desta candidatura."}</p>
          </div>
          {analysis ? (
            <Link href={`/report/${analysis.id}`} className="inline-flex items-center justify-center gap-1.5 rounded-xl bg-blue-600 px-4 py-2.5 text-xs font-bold text-white hover:bg-blue-700">
              Abrir análise <ArrowRight className="h-3.5 w-3.5" />
            </Link>
          ) : (
            <Link href="/analise" className="inline-flex items-center justify-center gap-1.5 rounded-xl bg-blue-600 px-4 py-2.5 text-xs font-bold text-white hover:bg-blue-700">
              Analisar vaga <ArrowRight className="h-3.5 w-3.5" />
            </Link>
          )}
        </div>
      </header>

      <section className="grid gap-5 lg:grid-cols-[1.1fr_.9fr]">
        <div className="space-y-5">
          <section className="rounded-2xl border border-slate-200/80 bg-white p-5 shadow-sm dark:border-slate-800 dark:bg-slate-900">
            <h2 className="text-base font-bold text-slate-900 dark:text-white">Dados da vaga</h2>
            <p className="mt-1 text-xs leading-relaxed text-slate-500 dark:text-slate-400">Mantenha o cargo, o link e o prazo atualizados para não perder nenhum próximo passo.</p>
            <form action={updateApplicationDetails.bind(null, application.id)} className="mt-4 space-y-3">
              <label className="block text-[11px] font-semibold text-slate-600 dark:text-slate-300">
                Cargo
                <input name="jobTitle" required defaultValue={application.jobTitle} className="mt-1 w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2.5 text-xs text-slate-900 outline-none focus:border-blue-500 dark:border-slate-800 dark:bg-slate-950 dark:text-white" />
              </label>
              <label className="block text-[11px] font-semibold text-slate-600 dark:text-slate-300">
                Empresa
                <input name="company" defaultValue={application.company} className="mt-1 w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2.5 text-xs text-slate-900 outline-none focus:border-blue-500 dark:border-slate-800 dark:bg-slate-950 dark:text-white" />
              </label>
              <label className="block text-[11px] font-semibold text-slate-600 dark:text-slate-300">
                Link da vaga
                <input name="jobUrl" type="url" defaultValue={application.jobUrl} placeholder="https://..." className="mt-1 w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2.5 text-xs text-slate-900 outline-none focus:border-blue-500 dark:border-slate-800 dark:bg-slate-950 dark:text-white" />
              </label>
              <label className="block text-[11px] font-semibold text-slate-600 dark:text-slate-300">
                Prazo de candidatura
                <input name="deadline" type="date" defaultValue={application.deadline?.toISOString().slice(0, 10)} className="mt-1 w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2.5 text-xs text-slate-900 outline-none focus:border-blue-500 dark:border-slate-800 dark:bg-slate-950 dark:text-white" />
              </label>
              <FormSubmitButton pendingLabel="Salvando..." className="inline-flex min-h-11 w-full items-center justify-center rounded-xl bg-blue-600 px-4 py-2.5 text-xs font-bold text-white hover:bg-blue-700 disabled:cursor-wait disabled:opacity-60">Salvar dados da vaga</FormSubmitButton>
            </form>
          </section>

          <section className="rounded-2xl border border-slate-200/80 bg-white p-5 shadow-sm dark:border-slate-800 dark:bg-slate-900">
            <h2 className="text-base font-bold text-slate-900 dark:text-white">Checklist da candidatura</h2>
            <div className="mt-4 grid gap-3 sm:grid-cols-2">
              {checklist.map((item) => {
                const Icon = item.icon;
                return (
                  <Link key={item.label} href={item.href} className="flex items-center gap-3 rounded-xl border border-slate-200/80 p-3 transition-colors hover:border-blue-300 dark:border-slate-800 dark:hover:border-blue-800">
                    {item.done ? <CheckCircle2 className="h-5 w-5 shrink-0 text-emerald-500" /> : <Circle className="h-5 w-5 shrink-0 text-slate-300 dark:text-slate-600" />}
                    <span className="flex-1 text-xs font-semibold text-slate-700 dark:text-slate-200">{item.label}</span>
                    <Icon className="h-4 w-4 text-slate-400" />
                  </Link>
                );
              })}
            </div>
          </section>

          <section className="rounded-2xl border border-slate-200/80 bg-white p-5 shadow-sm dark:border-slate-800 dark:bg-slate-900">
            <div className="flex items-center justify-between gap-3">
              <h2 className="text-base font-bold text-slate-900 dark:text-white">Match desta vaga</h2>
              {analysis && <span className="text-xl font-bold text-emerald-600 dark:text-emerald-400">{analysis.overallScore}%</span>}
            </div>
            {analysis ? (
              <div className="mt-4 space-y-4 text-xs">
                <p className="rounded-xl bg-slate-50 p-3 leading-relaxed text-slate-600 dark:bg-slate-950 dark:text-slate-300">{analysis.applicationStatusReason}</p>
                <div className="grid gap-3 sm:grid-cols-2">
                  <div><p className="font-bold text-emerald-600 dark:text-emerald-400">Encontradas ({keywordsFound.length})</p><p className="mt-1 text-slate-500 dark:text-slate-400">{keywordsFound.slice(0, 6).join(", ") || "Nenhuma registrada"}</p></div>
                  <div><p className="font-bold text-amber-600 dark:text-amber-400">Para revisar ({keywordsMissing.length})</p><p className="mt-1 text-slate-500 dark:text-slate-400">{keywordsMissing.slice(0, 6).join(", ") || "Nenhuma registrada"}</p></div>
                </div>
                {fixes.length > 0 && <div><p className="font-bold text-slate-700 dark:text-slate-200">Melhorias prioritárias</p><ul className="mt-2 space-y-1 text-slate-500 dark:text-slate-400">{fixes.slice(0, 3).map((fix) => <li key={fix}>• {fix}</li>)}</ul></div>}
              </div>
            ) : <p className="mt-3 text-xs text-slate-500 dark:text-slate-400">Analise esta vaga para ver os requisitos e os ajustes recomendados.</p>}
          </section>
        </div>

        <div className="space-y-5">
          <section className="rounded-2xl border border-slate-200/80 bg-white p-5 shadow-sm dark:border-slate-800 dark:bg-slate-900">
            <h2 className="text-base font-bold text-slate-900 dark:text-white">Ações conectadas</h2>
            <div className="mt-4 space-y-2">
              {analysis && <Link href={`/report/${analysis.id}`} className="flex items-center gap-3 rounded-xl bg-slate-50 p-3 text-xs font-semibold text-slate-700 hover:bg-blue-50 dark:bg-slate-950 dark:text-slate-200 dark:hover:bg-blue-950/30"><FileText className="h-4 w-4 text-blue-500" /> Currículo e análise <ArrowRight className="ml-auto h-3.5 w-3.5" /></Link>}
              <Link href={`/interviews/${application.id}`} className="flex items-center gap-3 rounded-xl bg-slate-50 p-3 text-xs font-semibold text-slate-700 hover:bg-blue-50 dark:bg-slate-950 dark:text-slate-200 dark:hover:bg-blue-950/30"><Mic className="h-4 w-4 text-violet-500" /> Preparar entrevista <ArrowRight className="ml-auto h-3.5 w-3.5" /></Link>
              <Link href={`/tools/cover-letter?applicationId=${application.id}`} className="flex items-center gap-3 rounded-xl bg-slate-50 p-3 text-xs font-semibold text-slate-700 hover:bg-blue-50 dark:bg-slate-950 dark:text-slate-200 dark:hover:bg-blue-950/30"><MessageSquare className="h-4 w-4 text-emerald-500" /> Carta e mensagem <ArrowRight className="ml-auto h-3.5 w-3.5" /></Link>
              <Link href={`/tools/application-answer?applicationId=${application.id}`} className="flex items-center gap-3 rounded-xl bg-slate-50 p-3 text-xs font-semibold text-slate-700 hover:bg-blue-50 dark:bg-slate-950 dark:text-slate-200 dark:hover:bg-blue-950/30"><MessageSquare className="h-4 w-4 text-amber-500" /> Responder pergunta de candidatura <ArrowRight className="ml-auto h-3.5 w-3.5" /></Link>
            </div>
          </section>

          {analysis && (
            <section className="rounded-2xl border border-slate-200/80 bg-white p-5 shadow-sm dark:border-slate-800 dark:bg-slate-900">
              <div className="flex items-center justify-between gap-3">
                <h2 className="text-base font-bold text-slate-900 dark:text-white">Kit desta vaga</h2>
                <Link href={`/report/${analysis.id}`} className="text-xs font-semibold text-blue-600 hover:underline dark:text-blue-400">Ver relatório</Link>
              </div>
              <div className="mt-4 space-y-3">
                <div className="rounded-xl bg-slate-50 p-3 dark:bg-slate-950">
                  <p className="text-[10px] font-bold uppercase tracking-wider text-slate-500">Mensagem ao recrutador</p>
                  <p className="mt-1 line-clamp-4 text-xs leading-relaxed text-slate-600 dark:text-slate-300">{analysis.recruiterMessage || "A mensagem será gerada a partir da análise desta vaga."}</p>
                </div>
                <SaveResumeVersionButton
                  applicationId={application.id}
                  analysisId={analysis.id}
                  summary={analysis.suggestedSummary}
                  resumeStructured={parseJson(analysis.resumeStructured, {})}
                  approvedSuggestions={[]}
                />
                <Link href={`/interviews/${application.id}`} className="flex items-center justify-between rounded-xl border border-violet-200 bg-violet-50/60 p-3 text-xs font-semibold text-violet-800 hover:border-violet-400 dark:border-violet-900/60 dark:bg-violet-950/20 dark:text-violet-200">
                  <span>Treinar perguntas prováveis da vaga</span>
                  <span>{parseJson<string[]>(analysis.interviewQuestions, []).length} perguntas →</span>
                </Link>
              </div>
            </section>
          )}

          <section className="rounded-2xl border border-slate-200/80 bg-white p-5 shadow-sm dark:border-slate-800 dark:bg-slate-900">
            <h2 className="text-base font-bold text-slate-900 dark:text-white">Histórico</h2>
            <div className="mt-4 space-y-3">
              <div className="flex items-center gap-2 text-xs text-slate-500 dark:text-slate-400"><CalendarDays className="h-4 w-4" /> Criada em {application.createdAt.toLocaleDateString("pt-BR")}</div>
              {application.appliedAt && <div className="flex items-center gap-2 text-xs text-slate-500 dark:text-slate-400"><CheckCircle2 className="h-4 w-4 text-emerald-500" /> Enviada em {application.appliedAt.toLocaleDateString("pt-BR")}</div>}
              {application.interviewAt && <div className="flex items-center gap-2 text-xs text-slate-500 dark:text-slate-400"><Mic className="h-4 w-4 text-violet-500" /> Entrevista em {application.interviewAt.toLocaleDateString("pt-BR")}</div>}
              {application.activities.map((activity) => <div key={activity.id} className="text-xs text-slate-500 dark:text-slate-400">{activity.toStatus} · {activity.createdAt.toLocaleDateString("pt-BR")}</div>)}
            </div>
          </section>

          <section className="rounded-2xl border border-slate-200/80 bg-white p-5 shadow-sm dark:border-slate-800 dark:bg-slate-900">
            <h2 className="text-base font-bold text-slate-900 dark:text-white">Registrar resultado</h2>
            <p className="mt-1 text-xs leading-relaxed text-slate-500 dark:text-slate-400">Registre o que aconteceu para transformar esta candidatura em aprendizado.</p>
            <form action={updateApplicationOutcome.bind(null, application.id)} className="mt-4 space-y-3">
              <label className="block text-[11px] font-semibold text-slate-600 dark:text-slate-300">
                Data da resposta
                <input name="responseAt" type="date" defaultValue={application.responseAt?.toISOString().slice(0, 10)} className="mt-1 w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2.5 text-xs text-slate-900 outline-none focus:border-blue-500 dark:border-slate-800 dark:bg-slate-950 dark:text-white" />
              </label>
              <label className="block text-[11px] font-semibold text-slate-600 dark:text-slate-300">
                Resultado ou feedback
                <textarea name="outcomeNote" rows={3} defaultValue={application.outcomeNote} placeholder="Ex.: avançou para entrevista, recebeu teste ou não teve retorno." className="mt-1 w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2.5 text-xs text-slate-900 outline-none focus:border-blue-500 dark:border-slate-800 dark:bg-slate-950 dark:text-white" />
              </label>
              <label className="block text-[11px] font-semibold text-slate-600 dark:text-slate-300">
                Motivo da rejeição (se aplicável)
                <input name="rejectionReason" defaultValue={application.rejectionReason} placeholder="Ex.: senioridade, experiência, idioma ou outro motivo" className="mt-1 w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2.5 text-xs text-slate-900 outline-none focus:border-blue-500 dark:border-slate-800 dark:bg-slate-950 dark:text-white" />
              </label>
              <FormSubmitButton pendingLabel="Salvando..." className="inline-flex min-h-11 w-full items-center justify-center rounded-xl bg-slate-900 px-4 py-2.5 text-xs font-bold text-white hover:bg-slate-800 disabled:cursor-wait disabled:opacity-60 dark:bg-white dark:text-slate-900 dark:hover:bg-slate-100">Salvar resultado</FormSubmitButton>
            </form>
          </section>
        </div>
      </section>
      <ApplicationKitGenerator applicationId={application.id} />
    </main>
  );
}
