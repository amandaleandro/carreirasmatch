import Link from "next/link";
import { ShieldCheck, Sparkles } from "lucide-react";
import { requireAdminPage } from "@/lib/admin";
import { prisma } from "@/lib/prisma";
import { AdminDashboardTabs } from "@/components/admin-dashboard-tabs";

export const dynamic = "force-dynamic";

function pct(part: number, total: number) {
  if (total === 0) return 0;
  return Math.round((part / total) * 100);
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
    pageViews30d,
    pageViews24h,
    sessions30d,
    topCampaigns,
    topLandingPages,
    recentSupportTickets,
    activePublicOpportunities,
    opportunityClicks30d,
    openOpportunityReports,
    activeJobAlerts,
    topOpportunityCities,
    opportunityCampaigns,
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
      take: 12,
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
      take: 15,
      select: {
        id: true,
        jobTitle: true,
        overallScore: true,
        applicationStatus: true,
        createdAt: true,
        resumeStructured: true,
        resume: { select: { fileName: true, user: { select: { name: true, email: true } } } },
      },
    }),
    prisma.payment.findMany({
      orderBy: { createdAt: "desc" },
      take: 15,
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
      take: 12,
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
    prisma.pageView.count({ where: { createdAt: { gte: new Date(now.getTime() - 30 * 86400000) } } }),
    prisma.pageView.count({ where: { createdAt: { gte: since24h } } }),
    prisma.pageView.groupBy({
      by: ["sessionId"],
      where: { createdAt: { gte: new Date(now.getTime() - 30 * 86400000) } },
    }),
    prisma.pageView.groupBy({
      by: ["campaign", "source", "medium"],
      where: { campaign: { not: "" }, createdAt: { gte: new Date(now.getTime() - 30 * 86400000) } },
      _count: { _all: true },
      orderBy: { _count: { campaign: "desc" } },
      take: 8,
    }),
    prisma.pageView.groupBy({
      by: ["path"],
      where: { createdAt: { gte: new Date(now.getTime() - 30 * 86400000) } },
      _count: { _all: true },
      orderBy: { _count: { path: "desc" } },
      take: 8,
    }),
    prisma.supportTicket.findMany({
      orderBy: { updatedAt: "desc" },
      take: 12,
      include: {
        user: { select: { name: true, email: true } },
        messages: { orderBy: { createdAt: "desc" }, take: 1 },
      },
    }),
    prisma.publicOpportunity.count({ where: { active: true } }),
    prisma.opportunityClick.count({ where: { createdAt: { gte: new Date(now.getTime() - 30 * 86400000) } } }),
    prisma.opportunityReport.count({ where: { status: "open" } }),
    prisma.jobAlert.count({ where: { active: true } }),
    prisma.publicOpportunity.groupBy({
      by: ["state", "city"],
      where: { active: true },
      _count: { _all: true },
      orderBy: { _count: { city: "desc" } },
      take: 8,
    }),
    prisma.opportunityClick.groupBy({
      by: ["campaign"],
      where: { campaign: { not: "" }, createdAt: { gte: new Date(now.getTime() - 30 * 86400000) } },
      _count: { _all: true },
      orderBy: { _count: { campaign: "desc" } },
      take: 8,
    }),
  ]);

  const revenueTotal = paidPayments._sum.amount ?? 0;
  const revenue24h = payments24h._sum.amount ?? 0;
  const conversionRate = pct(activeSubscriptions, totalUsers);
  const jobCoverage = pct(activeJobs, totalJobs);
  const paidCount = paidPayments._count;
  const paid24hCount = payments24h._count;
  const [subscriptions24h, subscriptions7d, qualifiedSessions24h, funnel24h, channelSubscriptions30d] =
    await Promise.all([
      prisma.funnelEvent.count({
        where: { name: "subscription_confirmed", createdAt: { gte: since24h } },
      }),
      prisma.funnelEvent.count({
        where: {
          name: "subscription_confirmed",
          createdAt: { gte: new Date(now.getTime() - 7 * 86400000) },
        },
      }),
      prisma.pageView.groupBy({
        by: ["sessionId"],
        where: {
          createdAt: { gte: since24h },
          NOT: [
            { path: { startsWith: "/admin" } },
            { path: { startsWith: "/api" } },
            { path: { startsWith: "/auth" } },
          ],
        },
      }),
      prisma.funnelEvent.groupBy({
        by: ["name"],
        where: { createdAt: { gte: since24h } },
        _count: { _all: true },
      }),
      prisma.funnelEvent.groupBy({
        by: ["source", "medium", "campaign"],
        where: {
          name: "subscription_confirmed",
          createdAt: { gte: new Date(now.getTime() - 30 * 86400000) },
        },
        _count: { _all: true },
        orderBy: { _count: { source: "desc" } },
        take: 8,
      }),
    ]);
  const visits24h = qualifiedSessions24h.length;
  const visitToSubscription = visits24h
    ? ((subscriptions24h / visits24h) * 100).toFixed(2)
    : "0,00";

  const stats = {
    totalUsers,
    users24h,
    totalAnalyses,
    analyses24h,
    totalResumes,
    totalJobs,
    activeJobs,
    totalApplications,
    activeSubscriptions,
    revenueTotal,
    revenue24h,
    paidCount,
    paid24hCount,
    conversionRate,
    jobCoverage,
    subscriptions24h,
    subscriptions7d,
    visits24h,
    visitToSubscription,
    pageViews30d,
    pageViews24h,
    sessions30dCount: sessions30d.length,
    openSupportTickets,
    activePublicOpportunities,
    opportunityClicks30d,
    openOpportunityReports,
    activeJobAlerts,
  };

  return (
    <main className="px-4 md:px-8 py-8 max-w-7xl mx-auto w-full space-y-8 font-sans">
      <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between pb-4 border-b border-slate-200 dark:border-slate-800">
        <div>
          <Link
            href="/dashboard"
            className="text-xs font-semibold text-slate-500 hover:text-blue-600 dark:text-slate-400 dark:hover:text-blue-400 transition-colors inline-flex items-center gap-1 mb-2"
          >
            ← Voltar ao painel principal
          </Link>
          <div className="flex items-center gap-2">
            <span className="inline-flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider rounded-full px-3 py-1 bg-purple-500/10 text-purple-700 dark:text-purple-300 border border-purple-500/20">
              <ShieldCheck className="w-3.5 h-3.5" />
              Painel Geral de Controle
            </span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-slate-900 dark:text-white mt-1">
            Administração do Sistema
          </h1>
          <p className="text-slate-600 dark:text-slate-400 mt-1 text-sm">
            Visão operacional: telemetria em tempo real, métricas de crescimento, liberação de acessos e cupons.
          </p>
        </div>

        <div className="flex items-center gap-3 shrink-0">
          <Link
            href="/admin/repasses"
            className="rounded-2xl border border-amber-500/20 bg-amber-500/10 px-4 py-3 text-xs font-semibold text-amber-700 dark:text-amber-300 hover:bg-amber-500/20 transition-colors"
          >
            Repasses freelancer
          </Link>
          <div className="rounded-2xl border border-blue-500/20 bg-blue-500/10 px-4 py-3 text-xs font-semibold text-blue-700 dark:text-blue-300 flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-blue-500" />
            <span>Telemetria ativa em tempo real</span>
          </div>
        </div>
      </div>

      <AdminDashboardTabs
        stats={stats}
        funnel24h={funnel24h}
        channelSubscriptions30d={channelSubscriptions30d}
        topCampaigns={topCampaigns}
        topLandingPages={topLandingPages}
        topOpportunityCities={topOpportunityCities}
        opportunityCampaigns={opportunityCampaigns}
        applicationGroups={applicationGroups}
        analysisStatusGroups={analysisStatusGroups}
        recentUsers={recentUsers}
        recentAnalyses={recentAnalyses}
        recentPayments={recentPayments}
        recentApplications={recentApplications}
        recentSupportTickets={recentSupportTickets}
      />
    </main>
  );
}
