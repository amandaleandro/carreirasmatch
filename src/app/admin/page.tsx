import Link from "next/link";
import { requireAdminPage } from "@/lib/admin";
import { prisma } from "@/lib/prisma";
import { AdminUserLookup } from "@/components/admin-user-lookup";
import { AdminGroqModel } from "@/components/admin-groq-model";
import { AdminCouponManager } from "@/components/admin-coupon-manager";

export const dynamic = "force-dynamic";

const applicationStatusLabels: Record<string, string> = {
  saved: "Salvas",
  applied: "Aplicadas",
  interview: "Entrevistas",
  technical_test: "Teste tecnico",
  offer: "Ofertas",
  rejected: "Recusadas",
  archived: "Arquivadas",
};

const paymentStatusClasses: Record<string, string> = {
  paid: "bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-950/40 dark:text-emerald-300 dark:border-emerald-900",
  pending: "bg-amber-50 text-amber-700 border-amber-200 dark:bg-amber-950/40 dark:text-amber-300 dark:border-amber-900",
  expired: "bg-neutral-50 text-neutral-600 border-neutral-200 dark:bg-neutral-900 dark:text-neutral-300 dark:border-neutral-800",
  cancelled: "bg-red-50 text-red-700 border-red-200 dark:bg-red-950/40 dark:text-red-300 dark:border-red-900",
  refunded: "bg-blue-50 text-blue-700 border-blue-200 dark:bg-blue-950/40 dark:text-blue-300 dark:border-blue-900",
};

function formatDate(date: Date | null | undefined) {
  if (!date) return "-";
  return new Intl.DateTimeFormat("pt-BR", {
    timeZone: "America/Sao_Paulo",
    day: "2-digit",
    month: "2-digit",
    year: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
  }).format(date);
}

function formatCurrency(cents: number) {
  return new Intl.NumberFormat("pt-BR", {
    style: "currency",
    currency: "BRL",
  }).format(cents / 100);
}

function pct(part: number, total: number) {
  if (total === 0) return 0;
  return Math.round((part / total) * 100);
}

function StatCard({
  label,
  value,
  helper,
}: {
  label: string;
  value: string | number;
  helper: string;
}) {
  return (
    <div className="rounded-lg border border-neutral-200 dark:border-neutral-800 p-4 bg-white dark:bg-neutral-950">
      <p className="text-xs font-medium uppercase tracking-wide text-neutral-500">{label}</p>
      <p className="mt-2 text-2xl font-semibold tracking-tight">{value}</p>
      <p className="mt-1 text-xs text-neutral-500">{helper}</p>
    </div>
  );
}

export default async function AdminPage() {
  await requireAdminPage();

  // Dynamic admin telemetry intentionally uses the current clock on each request.
  // eslint-disable-next-line react-hooks/purity
  const since24h = new Date(Date.now() - 24 * 60 * 60 * 1000);
  const now = new Date();

  const [
    totalUsers,
    users24h,
    totalAnalyses,
    analyses24h,
    totalResumes,
    totalJobs,
    activeJobs,
    totalApplications,
    activeSubscriptions,
    paidPayments,
    payments24h,
    recentUsers,
    recentAnalyses,
    recentPayments,
    recentApplications,
    applicationGroups,
    analysisStatusGroups,
    openSupportTickets,
  ] = await Promise.all([
    prisma.user.count(),
    prisma.user.count({ where: { createdAt: { gte: since24h } } }),
    prisma.analysis.count(),
    prisma.analysis.count({ where: { createdAt: { gte: since24h } } }),
    prisma.resume.count(),
    prisma.job.count(),
    prisma.job.count({ where: { active: true } }),
    prisma.application.count(),
    prisma.subscription.count({
      where: {
        status: "active",
        OR: [{ currentPeriodEnd: null }, { currentPeriodEnd: { gt: now } }],
      },
    }),
    prisma.payment.aggregate({
      where: { status: "paid" },
      _sum: { amount: true },
      _count: true,
    }),
    prisma.payment.aggregate({
      where: { status: "paid", paidAt: { gte: since24h } },
      _sum: { amount: true },
      _count: true,
    }),
    prisma.user.findMany({
      orderBy: { createdAt: "desc" },
      take: 8,
      select: {
        id: true,
        name: true,
        email: true,
        careerSegment: true,
        createdAt: true,
        subscription: { select: { status: true, currentPeriodEnd: true } },
        _count: { select: { resumes: true, applications: true, payments: true } },
      },
    }),
    prisma.analysis.findMany({
      orderBy: { createdAt: "desc" },
      take: 8,
      select: {
        id: true,
        jobTitle: true,
        overallScore: true,
        applicationStatus: true,
        createdAt: true,
        resume: { select: { fileName: true, user: { select: { name: true, email: true } } } },
      },
    }),
    prisma.payment.findMany({
      orderBy: { createdAt: "desc" },
      take: 8,
      select: {
        id: true,
        kind: true,
        status: true,
        amount: true,
        segment: true,
        createdAt: true,
        paidAt: true,
        user: { select: { name: true, email: true } },
      },
    }),
    prisma.application.findMany({
      orderBy: { updatedAt: "desc" },
      take: 8,
      select: {
        id: true,
        company: true,
        jobTitle: true,
        status: true,
        fitScore: true,
        updatedAt: true,
        user: { select: { name: true, email: true } },
      },
    }),
    prisma.application.groupBy({
      by: ["status"],
      _count: { _all: true },
    }),
    prisma.analysis.groupBy({
      by: ["applicationStatus"],
      _count: { _all: true },
    }),
    prisma.supportTicket.count({ where: { status: "open" } }),
  ]);

  const revenueTotal = paidPayments._sum.amount ?? 0;
  const revenue24h = payments24h._sum.amount ?? 0;
  const conversionRate = pct(activeSubscriptions, totalUsers);
  const jobCoverage = pct(activeJobs, totalJobs);
  const paidCount = paidPayments._count;
  const paid24hCount = payments24h._count;

  return (
    <main className="px-4 md:px-8 py-8 max-w-7xl mx-auto w-full space-y-8">
      <header className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
        <div>
          <Link href="/dashboard" className="text-sm text-blue-600 dark:text-blue-400 hover:underline">
            Voltar para o dashboard
          </Link>
          <h1 className="mt-3 text-2xl md:text-3xl font-bold tracking-tight">Admin do sistema</h1>
          <p className="mt-2 max-w-3xl text-sm text-neutral-600 dark:text-neutral-400">
            Visão operacional do produto: usuários, análises, pagamentos, vagas, candidaturas e liberações manuais.
          </p>
        </div>
        <div className="rounded-lg border border-blue-200 bg-blue-50 px-4 py-3 text-sm text-blue-800 dark:border-blue-900 dark:bg-blue-950/40 dark:text-blue-200">
          Atualizado em tempo real a cada carregamento da página.
        </div>
      </header>

      <section className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
        <StatCard label="Usuários" value={totalUsers} helper={`+${users24h} nas últimas 24h`} />
        <StatCard label="Análises" value={totalAnalyses} helper={`+${analyses24h} nas últimas 24h`} />
        <StatCard label="Receita paga" value={formatCurrency(revenueTotal)} helper={`${paidCount} pagamento(s) confirmado(s)`} />
        <StatCard label="Assinaturas ativas" value={activeSubscriptions} helper={`${conversionRate}% da base total`} />
        <StatCard label="Currículos" value={totalResumes} helper="Arquivos e currículos gerados" />
        <StatCard label="Vagas" value={totalJobs} helper={`${activeJobs} ativas, ${jobCoverage}% do feed`} />
        <StatCard label="Candidaturas" value={totalApplications} helper="Pipeline acompanhado pelos usuários" />
        <StatCard label="Receita 24h" value={formatCurrency(revenue24h)} helper={`${paid24hCount} pagamento(s) hoje`} />
        <StatCard label="Suporte" value={openSupportTickets} helper="Chamado(s) aguardando resposta" />
      </section>

      <section className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 rounded-lg border border-neutral-200 dark:border-neutral-800 p-5 bg-white dark:bg-neutral-950">
          <div className="flex items-center justify-between gap-3 mb-4">
            <div>
              <h2 className="font-semibold">Atividade recente</h2>
              <p className="text-sm text-neutral-500">Últimas análises geradas pelos usuários.</p>
            </div>
            <Link href="/history" className="text-sm font-medium text-blue-600 dark:text-blue-400 hover:underline">
              Relatórios
            </Link>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="text-left text-xs uppercase tracking-wide text-neutral-500">
                <tr className="border-b border-neutral-200 dark:border-neutral-800">
                  <th className="py-2 pr-4 font-medium">Usuário</th>
                  <th className="py-2 pr-4 font-medium">Vaga</th>
                  <th className="py-2 pr-4 font-medium">Score</th>
                  <th className="py-2 pr-4 font-medium">Prioridade</th>
                  <th className="py-2 font-medium">Data</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-neutral-100 dark:divide-neutral-900">
                {recentAnalyses.map((analysis) => (
                  <tr key={analysis.id}>
                    <td className="py-3 pr-4">
                      <p className="font-medium">{analysis.resume.user?.name ?? "Sem nome"}</p>
                      <p className="text-xs text-neutral-500">{analysis.resume.user?.email ?? "-"}</p>
                    </td>
                    <td className="py-3 pr-4 max-w-[280px]">
                      <Link href={`/report/${analysis.id}`} className="font-medium hover:underline">
                        {analysis.jobTitle}
                      </Link>
                      <p className="text-xs text-neutral-500 truncate">{analysis.resume.fileName}</p>
                    </td>
                    <td className="py-3 pr-4 font-semibold">{analysis.overallScore}%</td>
                    <td className="py-3 pr-4 text-neutral-600 dark:text-neutral-400">{analysis.applicationStatus}</td>
                    <td className="py-3 text-neutral-500 whitespace-nowrap">{formatDate(analysis.createdAt)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        <div className="rounded-lg border border-neutral-200 dark:border-neutral-800 p-5 bg-white dark:bg-neutral-950">
          <h2 className="font-semibold">Funil ativo</h2>
          <p className="mt-1 text-sm text-neutral-500">Distribuição das candidaturas.</p>
          <div className="mt-5 space-y-3">
            {applicationGroups.map((group) => {
              const count = group._count._all;
              return (
                <div key={group.status}>
                  <div className="flex items-center justify-between text-sm">
                    <span>{applicationStatusLabels[group.status] ?? group.status}</span>
                    <span className="font-semibold">{count}</span>
                  </div>
                  <div className="mt-1 h-2 rounded-full bg-neutral-100 dark:bg-neutral-900">
                    <div
                      className="h-2 rounded-full bg-blue-600"
                      style={{ width: `${Math.max(4, pct(count, totalApplications))}%` }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      <section className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="rounded-lg border border-neutral-200 dark:border-neutral-800 p-5 bg-white dark:bg-neutral-950">
          <h2 className="font-semibold">Usuários novos</h2>
          <div className="mt-4 divide-y divide-neutral-100 dark:divide-neutral-900">
            {recentUsers.map((user) => (
              <div key={user.id} className="py-3 flex items-center justify-between gap-4">
                <div className="min-w-0">
                  <p className="font-medium truncate">{user.name ?? "Sem nome"}</p>
                  <p className="text-xs text-neutral-500 truncate">{user.email ?? "-"}</p>
                  <p className="text-xs text-neutral-400">
                    {user.careerSegment ?? "sem segmento"} · {formatDate(user.createdAt)}
                  </p>
                </div>
                <div className="text-right text-xs text-neutral-500 shrink-0">
                  <p>{user._count.resumes} currículo(s)</p>
                  <p>{user._count.applications} candidatura(s)</p>
                  <p>{user.subscription?.status === "active" ? "assinante" : `${user._count.payments} pag.`}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="rounded-lg border border-neutral-200 dark:border-neutral-800 p-5 bg-white dark:bg-neutral-950">
          <h2 className="font-semibold">Pagamentos recentes</h2>
          <div className="mt-4 divide-y divide-neutral-100 dark:divide-neutral-900">
            {recentPayments.map((payment) => (
              <div key={payment.id} className="py-3 flex items-center justify-between gap-4">
                <div className="min-w-0">
                  <p className="font-medium truncate">{payment.user.name ?? payment.user.email ?? "Usuário"}</p>
                  <p className="text-xs text-neutral-500">
                    {payment.kind} · {payment.segment} · {formatDate(payment.paidAt ?? payment.createdAt)}
                  </p>
                </div>
                <div className="text-right shrink-0">
                  <p className="font-semibold">{formatCurrency(payment.amount)}</p>
                  <span
                    className={`inline-flex mt-1 rounded-full border px-2 py-0.5 text-xs ${
                      paymentStatusClasses[payment.status] ?? paymentStatusClasses.pending
                    }`}
                  >
                    {payment.status}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="rounded-lg border border-neutral-200 dark:border-neutral-800 p-5 bg-white dark:bg-neutral-950">
          <h2 className="font-semibold">Prioridade das análises</h2>
          <div className="mt-4 space-y-3">
            {analysisStatusGroups.map((group) => (
              <div key={group.applicationStatus} className="flex items-center justify-between text-sm">
                <span>{group.applicationStatus}</span>
                <span className="font-semibold">{group._count._all}</span>
              </div>
            ))}
          </div>
        </div>

        <div className="lg:col-span-2 rounded-lg border border-neutral-200 dark:border-neutral-800 p-5 bg-white dark:bg-neutral-950">
          <h2 className="font-semibold">Candidaturas atualizadas</h2>
          <div className="mt-4 grid grid-cols-1 md:grid-cols-2 gap-3">
            {recentApplications.map((application) => (
              <div key={application.id} className="rounded-md border border-neutral-200 dark:border-neutral-800 p-3">
                <div className="flex items-start justify-between gap-3">
                  <div className="min-w-0">
                    <p className="font-medium truncate">{application.jobTitle}</p>
                    <p className="text-xs text-neutral-500 truncate">{application.company || "Sem empresa"}</p>
                  </div>
                  <span className="rounded-full bg-neutral-100 dark:bg-neutral-900 px-2 py-0.5 text-xs text-neutral-600 dark:text-neutral-300">
                    {application.status}
                  </span>
                </div>
                <p className="mt-3 text-xs text-neutral-500 truncate">
                  {application.user.name ?? application.user.email ?? "Usuário"} · {formatDate(application.updatedAt)}
                </p>
                {application.fitScore !== null && (
                  <p className="mt-1 text-xs font-semibold text-emerald-600 dark:text-emerald-400">
                    {application.fitScore}% de aderência
                  </p>
                )}
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="rounded-lg border border-neutral-200 dark:border-neutral-800 p-5 bg-white dark:bg-neutral-950">
          <h2 className="font-semibold">Modelo de IA das análises</h2>
          <p className="mt-1 text-sm text-neutral-500">
            Escolha qual modelo da Groq é usado para gerar as análises de currículo.
          </p>
          <div className="mt-5">
            <AdminGroqModel />
          </div>
        </div>
      </section>

      <section className="grid grid-cols-1 gap-6">
        <div className="rounded-lg border border-neutral-200 dark:border-neutral-800 p-5 bg-white dark:bg-neutral-950">
          <h2 className="font-semibold">Cupons de influenciadores</h2>
          <p className="mt-1 text-sm text-neutral-500">
            Cada influenciador recebe um código próprio para rastrear as vendas geradas.
          </p>
          <div className="mt-5">
            <AdminCouponManager />
          </div>
        </div>
      </section>

      <section className="grid grid-cols-1 lg:grid-cols-[minmax(0,1fr)_420px] gap-6">
        <div className="rounded-lg border border-neutral-200 dark:border-neutral-800 p-5 bg-white dark:bg-neutral-950">
          <h2 className="font-semibold">Controle de acesso por usuário</h2>
          <p className="mt-1 text-sm text-neutral-500">
            Busque por e-mail para conceder crédito de análise, liberar diagnóstico específico ou conceder assinatura.
          </p>
          <div className="mt-5">
            <AdminUserLookup />
          </div>
        </div>

        <div className="rounded-lg border border-neutral-200 dark:border-neutral-800 p-5 bg-white dark:bg-neutral-950">
          <h2 className="font-semibold">Atalhos de operação</h2>
          <div className="mt-4 grid gap-2">
            <Link className="rounded-md border border-neutral-200 dark:border-neutral-800 px-3 py-2 text-sm hover:bg-neutral-50 dark:hover:bg-neutral-900" href="/admin/suporte">
              Responder suporte{openSupportTickets > 0 ? ` (${openSupportTickets})` : ""}
            </Link>
            <Link className="rounded-md border border-neutral-200 dark:border-neutral-800 px-3 py-2 text-sm hover:bg-neutral-50 dark:hover:bg-neutral-900" href="/feed">
              Ver feed de vagas
            </Link>
            <Link className="rounded-md border border-neutral-200 dark:border-neutral-800 px-3 py-2 text-sm hover:bg-neutral-50 dark:hover:bg-neutral-900" href="/applications">
              Abrir candidaturas
            </Link>
            <Link className="rounded-md border border-neutral-200 dark:border-neutral-800 px-3 py-2 text-sm hover:bg-neutral-50 dark:hover:bg-neutral-900" href="/tools">
              Conferir ferramentas
            </Link>
            <Link className="rounded-md border border-neutral-200 dark:border-neutral-800 px-3 py-2 text-sm hover:bg-neutral-50 dark:hover:bg-neutral-900" href="/settings">
              Ajustes da conta
            </Link>
          </div>
          <p className="mt-5 text-xs text-neutral-500">
            O acesso a esta página continua restrito aos e-mails definidos em ADMIN_EMAILS.
          </p>
        </div>
      </section>
    </main>
  );
}
