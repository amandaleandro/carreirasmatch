import Link from "next/link";
import { ArrowLeft, BarChart3, CheckCircle2, Lightbulb, Target, TrendingUp } from "lucide-react";
import { prisma } from "@/lib/prisma";
import { requireSubscriptionPage } from "@/lib/require-subscription-page";

export const dynamic = "force-dynamic";

export default async function ApplicationInsightsPage() {
  const session = await requireSubscriptionPage();
  const applications = await prisma.application.findMany({
    where: { userId: session.user.id },
    select: { jobTitle: true, company: true, fitScore: true, status: true, appliedAt: true, responseAt: true, rejectionReason: true, outcomeNote: true },
    orderBy: { updatedAt: "desc" },
  });

  const sent = applications.filter((item) => item.appliedAt);
  const interviews = applications.filter((item) => ["interview", "technical_test", "offer"].includes(item.status));
  const responses = sent.filter((item) => item.responseAt);
  const responseDays = responses.map((item) => Math.max(0, item.responseAt!.getTime() - item.appliedAt!.getTime()) / 86400000);
  const averageResponse = responseDays.length ? Math.round((responseDays.reduce((a, b) => a + b, 0) / responseDays.length) * 10) / 10 : null;
  const interviewRate = sent.length ? Math.round((interviews.length / sent.length) * 100) : 0;
  const scoreGroups = [
    { label: "Match 80%+", items: sent.filter((item) => (item.fitScore ?? 0) >= 80) },
    { label: "Match 60–79%", items: sent.filter((item) => (item.fitScore ?? 0) >= 60 && (item.fitScore ?? 0) < 80) },
    { label: "Match abaixo de 60%", items: sent.filter((item) => (item.fitScore ?? 0) < 60) },
  ];
  const bestGroup = scoreGroups.filter((group) => group.items.length).sort((a, b) => {
    const rate = (items: typeof a.items) => items.length ? items.filter((item) => ["interview", "technical_test", "offer"].includes(item.status)).length / items.length : 0;
    return rate(b.items) - rate(a.items);
  })[0];
  const rejectionReasons = applications.map((item) => item.rejectionReason.trim()).filter(Boolean);

  return <main className="mx-auto w-full max-w-6xl space-y-6 px-4 py-7 sm:px-6 md:px-8 md:py-10">
    <Link href="/applications" className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white"><ArrowLeft className="h-3.5 w-3.5" /> Voltar às candidaturas</Link>
    <header className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-900">
      <p className="inline-flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-violet-600 dark:text-violet-400"><BarChart3 className="h-4 w-4" /> Aprendizado da sua busca</p>
      <h1 className="mt-2 text-2xl font-bold text-slate-900 dark:text-white">Descubra o que realmente gera entrevistas</h1>
      <p className="mt-2 max-w-2xl text-sm leading-relaxed text-slate-500 dark:text-slate-400">Use seus próprios resultados para ajustar prioridade, currículo e preparação. Os dados são sinais da sua amostra, não garantia de contratação.</p>
    </header>
    <section className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
      {[{ label: "Enviadas", value: sent.length, icon: Target }, { label: "Entrevistas", value: interviews.length, icon: CheckCircle2 }, { label: "Taxa de entrevista", value: `${interviewRate}%`, icon: TrendingUp }, { label: "Resposta média", value: averageResponse === null ? "—" : `${averageResponse}d`, icon: BarChart3 }].map((item) => { const Icon = item.icon; return <div key={item.label} className="rounded-2xl border border-slate-200 bg-white p-4 dark:border-slate-800 dark:bg-slate-900"><Icon className="h-4 w-4 text-violet-500" /><p className="mt-3 text-[10px] font-bold uppercase tracking-wider text-slate-500">{item.label}</p><p className="mt-1 text-2xl font-extrabold text-slate-900 dark:text-white">{item.value}</p></div>; })}
    </section>
    <section className="grid gap-5 lg:grid-cols-2">
      <div className="rounded-2xl border border-slate-200 bg-white p-5 dark:border-slate-800 dark:bg-slate-900"><h2 className="text-base font-bold text-slate-900 dark:text-white">Conversão por faixa de Match</h2><div className="mt-4 space-y-3">{scoreGroups.map((group) => { const advanced = group.items.filter((item) => ["interview", "technical_test", "offer"].includes(item.status)).length; const rate = group.items.length ? Math.round((advanced / group.items.length) * 100) : 0; return <div key={group.label}><div className="flex justify-between text-xs font-semibold text-slate-600 dark:text-slate-300"><span>{group.label} ({group.items.length})</span><span>{rate}% avançaram</span></div><div className="mt-1 h-2 rounded-full bg-slate-100 dark:bg-slate-800"><div className="h-full rounded-full bg-violet-500" style={{ width: `${rate}%` }} /></div></div>; })}</div></div>
      <div className="rounded-2xl border border-amber-200 bg-amber-50/60 p-5 dark:border-amber-900/50 dark:bg-amber-950/20"><div className="flex items-center gap-2"><Lightbulb className="h-5 w-5 text-amber-500" /><h2 className="text-base font-bold text-slate-900 dark:text-white">Próximo experimento</h2></div><p className="mt-3 text-sm leading-relaxed text-slate-700 dark:text-slate-300">{bestGroup ? `Sua melhor conversão até agora está em ${bestGroup.label}. Priorize vagas nessa faixa e compare o resultado com as próximas cinco candidaturas.` : "Envie algumas candidaturas e registre os resultados para gerar recomendações personalizadas."}</p>{rejectionReasons.length > 0 && <p className="mt-3 text-xs font-semibold text-amber-800 dark:text-amber-200">Motivos registrados recentemente: {rejectionReasons.slice(0, 3).join(" · ")}</p>}</div>
    </section>
    <div className="rounded-2xl border border-blue-200 bg-blue-50/60 p-5 text-xs leading-relaxed text-blue-900 dark:border-blue-900/50 dark:bg-blue-950/20 dark:text-blue-200">Registre sempre o resultado e o motivo quando houver retorno. Isso alimenta esta visão e ajuda a decidir quais lacunas estudar e quais vagas deixar de priorizar.</div>
  </main>;
}
