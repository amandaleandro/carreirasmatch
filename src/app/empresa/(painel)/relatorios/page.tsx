import {
  BarChart3,
  TrendingUp,
  FileSearch,
  FileText,
  Target,
  Briefcase,
  Users,
  CheckCircle2,
  XCircle,
  Star,
} from "lucide-react";
import { prisma } from "@/lib/prisma";
import { requireCompanyPage } from "@/lib/company-auth";

export const dynamic = "force-dynamic";

function pct(part: number, total: number): number {
  if (total <= 0) return 0;
  return Math.round((part / total) * 100);
}

export default async function CompanyReportsPage() {
  const { company } = await requireCompanyPage();
  const candidateWhere = { job: { companyId: company.id } };

  const [
    jobCount,
    candidateCount,
    fitAgg,
    high,
    mid,
    low,
    favorite,
    approved,
    rejected,
    openVagas,
    closedVagas,
    contactPending,
    contactAccepted,
    contactDeclined,
  ] = await Promise.all([
    prisma.companyJob.count({ where: { companyId: company.id } }),
    prisma.companyCandidate.count({ where: candidateWhere }),
    prisma.companyCandidate.aggregate({ _avg: { fitScore: true }, where: candidateWhere }),
    prisma.companyCandidate.count({ where: { ...candidateWhere, fitScore: { gte: 70 } } }),
    prisma.companyCandidate.count({ where: { ...candidateWhere, fitScore: { gte: 40, lt: 70 } } }),
    prisma.companyCandidate.count({ where: { ...candidateWhere, fitScore: { lt: 40 } } }),
    prisma.companyCandidate.count({ where: { ...candidateWhere, status: "favorite" } }),
    prisma.companyCandidate.count({ where: { ...candidateWhere, status: "approved" } }),
    prisma.companyCandidate.count({ where: { ...candidateWhere, status: "rejected" } }),
    prisma.companyVaga.count({ where: { companyId: company.id, status: "open" } }),
    prisma.companyVaga.count({ where: { companyId: company.id, status: "closed" } }),
    prisma.talentContactRequest.count({ where: { companyId: company.id, status: "pending" } }),
    prisma.talentContactRequest.count({ where: { companyId: company.id, status: "accepted" } }),
    prisma.talentContactRequest.count({ where: { companyId: company.id, status: "declined" } }),
  ]);

  const avgFit = Math.round(fitAgg._avg.fitScore ?? 0);
  const contactTotal = contactPending + contactAccepted + contactDeclined;
  const acceptRate = pct(contactAccepted, contactAccepted + contactDeclined);

  const cards = [
    { label: "Triagens Realizadas", value: jobCount, icon: FileSearch, color: "blue" },
    { label: "Currículos Analisados", value: candidateCount, icon: FileText, color: "indigo" },
    { label: "Aderência Média", value: candidateCount > 0 ? `${avgFit}%` : "Sem dados", icon: Target, color: "emerald" },
    { label: "Vagas Abertas", value: openVagas, icon: Briefcase, color: "purple" },
    { label: "Vagas Fechadas", value: closedVagas, icon: Briefcase, color: "amber" },
    { label: "Pedidos de Contato", value: contactTotal, icon: Users, color: "rose" },
  ];

  const bands = [
    { label: "Alta Compatibilidade (70%+)", value: high, color: "bg-emerald-500" },
    { label: "Média Compatibilidade (40 a 69%)", value: mid, color: "bg-amber-500" },
    { label: "Baixa Compatibilidade (<40%)", value: low, color: "bg-rose-500" },
  ];

  const actions = [
    { label: "Favoritos", value: favorite, color: "text-amber-600 dark:text-amber-400", icon: Star },
    { label: "Aprovados", value: approved, color: "text-emerald-600 dark:text-emerald-400", icon: CheckCircle2 },
    { label: "Reprovados", value: rejected, color: "text-rose-600 dark:text-rose-400", icon: XCircle },
  ];

  return (
    <main className="max-w-6xl mx-auto px-4 md:px-8 py-7 space-y-6 font-sans">
      {/* Header Banner */}
      <div className="pb-4 border-b border-slate-200 dark:border-slate-800">
        <span className="inline-flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wider rounded-full px-3 py-1 mb-2 bg-blue-500/10 text-blue-600 dark:text-blue-400 border border-blue-500/20">
          <BarChart3 className="w-3.5 h-3.5" />
          Relatórios & Métricas da Empresa
        </span>
        <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-slate-900 dark:text-white">
          Visão Geral do Recrutamento
        </h1>
        <p className="text-slate-600 dark:text-slate-400 mt-1 text-sm max-w-2xl">
          Acompanhe os resultados das suas triagens, vagas cadastradas e interações com o banco de talentos.
        </p>
      </div>

      {/* Stat Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
        {cards.map((c) => {
          const Icon = c.icon;
          return (
            <div key={c.label} className="rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-4 shadow-2xs space-y-2">
              <div className="flex items-center justify-between">
                <p className="text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                  {c.label}
                </p>
                <div className="w-8 h-8 rounded-lg bg-blue-500/10 text-blue-600 dark:text-blue-400 flex items-center justify-center border border-blue-500/20">
                  <Icon className="w-4 h-4" />
                </div>
              </div>
              <p className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white">{c.value}</p>
            </div>
          );
        })}
      </div>

      {/* Distribution Chart */}
      <section className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-6 shadow-sm space-y-4">
        <div>
          <h2 className="font-bold text-slate-900 dark:text-white text-base flex items-center gap-2">
            <TrendingUp className="w-5 h-5 text-blue-600 dark:text-blue-400" />
            Distribuição de Aderência dos Currículos
          </h2>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
            Classificação por faixa de pontuação calculada pela IA.
          </p>
        </div>

        {candidateCount === 0 ? (
          <p className="text-xs text-slate-500 py-4 text-center">Nenhum currículo analisado até o momento.</p>
        ) : (
          <div className="space-y-4 pt-1">
            {bands.map((b) => (
              <div key={b.label} className="space-y-1.5">
                <div className="flex items-center justify-between text-xs font-semibold">
                  <span className="text-slate-700 dark:text-slate-300">{b.label}</span>
                  <span className="text-slate-500">
                    {b.value} ({pct(b.value, candidateCount)}%)
                  </span>
                </div>
                <div className="h-2.5 rounded-full bg-slate-100 dark:bg-slate-800 overflow-hidden">
                  <div className={`h-full ${b.color}`} style={{ width: `${pct(b.value, candidateCount)}%` }} />
                </div>
              </div>
            ))}
          </div>
        )}
      </section>

      {/* Decisions & Talent Contact Grid */}
      <div className="grid gap-5 sm:grid-cols-2">
        <section className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-6 shadow-sm space-y-4">
          <h2 className="font-bold text-slate-900 dark:text-white text-base">Decisões nas Triagens</h2>
          <div className="grid grid-cols-3 gap-3 text-center">
            {actions.map((a) => {
              const Icon = a.icon;
              return (
                <div key={a.label} className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/40 border border-slate-100 dark:border-slate-800 space-y-1">
                  <Icon className={`w-5 h-5 mx-auto ${a.color}`} />
                  <p className={`text-2xl font-extrabold ${a.color}`}>{a.value}</p>
                  <p className="text-xs font-semibold text-slate-500">{a.label}</p>
                </div>
              );
            })}
          </div>
        </section>

        <section className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-6 shadow-sm space-y-4">
          <h2 className="font-bold text-slate-900 dark:text-white text-base">Banco de Talentos</h2>
          {contactTotal === 0 ? (
            <p className="text-xs text-slate-500 py-4 text-center">Nenhum pedido de contato realizado ainda.</p>
          ) : (
            <div className="space-y-2.5 text-xs font-semibold">
              <div className="flex justify-between items-center p-2 rounded-lg bg-slate-50 dark:bg-slate-800/40">
                <span className="text-slate-600 dark:text-slate-400">Contatos Liberados</span>
                <span className="text-emerald-600 dark:text-emerald-400 font-bold text-sm">{contactAccepted}</span>
              </div>
              <div className="flex justify-between items-center p-2 rounded-lg bg-slate-50 dark:bg-slate-800/40">
                <span className="text-slate-600 dark:text-slate-400">Aguardando Resposta</span>
                <span className="text-amber-600 dark:text-amber-400 font-bold text-sm">{contactPending}</span>
              </div>
              <div className="flex justify-between items-center p-2 rounded-lg bg-slate-50 dark:bg-slate-800/40">
                <span className="text-slate-600 dark:text-slate-400">Recusados</span>
                <span className="text-slate-500 font-bold text-sm">{contactDeclined}</span>
              </div>
              <div className="flex justify-between items-center pt-2 border-t border-slate-100 dark:border-slate-800">
                <span className="text-slate-700 dark:text-slate-300">Taxa de Aceite de Contato</span>
                <span className="font-extrabold text-slate-900 dark:text-white text-sm">{acceptRate}%</span>
              </div>
            </div>
          )}
        </section>
      </div>
    </main>
  );
}
