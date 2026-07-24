"use client";

import { useState, useMemo } from "react";
import Link from "next/link";
import {
  BarChart3,
  Users,
  Briefcase,
  MessageSquare,
  Ticket,
  Headphones,
  Search,
  TrendingUp,
  DollarSign,
  UserCheck,
  FileText,
  Activity,
  Zap,
  Download,
  AlertTriangle,
} from "lucide-react";
import { AdminUserLookup } from "@/components/admin-user-lookup";
import { AdminGroqModel } from "@/components/admin-groq-model";
import { AdminCouponManager } from "@/components/admin-coupon-manager";
import { AdminExternalSources } from "@/components/admin-external-sources";
import { AdminOpportunityReports } from "@/components/admin-opportunity-reports";
import { AdminWhatsappConnection } from "@/components/admin-whatsapp-connection";
import { AdminWhatsappMarketingCampaign } from "@/components/admin-whatsapp-marketing-campaign";
import {
  SUPPORT_CATEGORY_LABELS,
  SUPPORT_STATUS_ADMIN_LABELS,
  normalizeSupportCategory,
  normalizeSupportStatus,
  supportStatusBadgeClass,
} from "@/lib/support";

type AdminDashboardProps = {
  stats: {
    totalUsers: number;
    users24h: number;
    totalAnalyses: number;
    analyses24h: number;
    totalResumes: number;
    totalJobs: number;
    activeJobs: number;
    totalApplications: number;
    activeSubscriptions: number;
    revenueTotal: number;
    revenue24h: number;
    paidCount: number;
    paid24hCount: number;
    conversionRate: number;
    jobCoverage: number;
    subscriptions24h: number;
    subscriptions7d: number;
    visits24h: number;
    visitToSubscription: string;
    pageViews30d: number;
    pageViews24h: number;
    sessions30dCount: number;
    openSupportTickets: number;
    activePublicOpportunities: number;
    opportunityClicks30d: number;
    openOpportunityReports: number;
    activeJobAlerts: number;
  };
  funnel24h: Array<{ name: string; _count: { _all: number } }>;
  channelSubscriptions30d: Array<{ source: string; medium: string; campaign: string; _count: { _all: number } }>;
  topCampaigns: Array<{ campaign: string; source: string; medium: string; _count: { _all: number } }>;
  topLandingPages: Array<{ path: string; _count: { _all: number } }>;
  topOpportunityCities: Array<{ state: string; city: string; _count: { _all: number } }>;
  opportunityCampaigns: Array<{ campaign: string; _count: { _all: number } }>;
  applicationGroups: Array<{ status: string; _count: { _all: number } }>;
  analysisStatusGroups: Array<{ applicationStatus: string; _count: { _all: number } }>;
  recentUsers: Array<{
    id: string;
    name: string | null;
    email: string | null;
    careerSegment: string | null;
    createdAt: Date;
    subscription: { status: string; currentPeriodEnd: Date | null } | null;
    _count: { resumes: number; applications: number; payments: number };
  }>;
  recentAnalyses: Array<{
    id: string;
    jobTitle: string;
    overallScore: number;
    applicationStatus: string;
    createdAt: Date;
    resumeStructured: string;
    resume: { fileName: string; user: { name: string | null; email: string | null } | null };
  }>;
  recentPayments: Array<{
    id: string;
    kind: string;
    status: string;
    amount: number;
    segment: string;
    createdAt: Date;
    paidAt: Date | null;
    user: { name: string | null; email: string | null };
  }>;
  recentApplications: Array<{
    id: string;
    company: string | null;
    jobTitle: string;
    status: string;
    fitScore: number | null;
    updatedAt: Date;
    user: { name: string | null; email: string | null };
  }>;
  recentSupportTickets: Array<{
    id: string;
    subject: string;
    category: string;
    status: string;
    updatedAt: Date;
    user: { name: string | null; email: string | null };
    messages: Array<{ body: string; fromAdmin: boolean; createdAt: Date }>;
  }>;
};

const paymentStatusClasses: Record<string, string> = {
  paid: "bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-950/40 dark:text-emerald-300 dark:border-emerald-900",
  pending: "bg-amber-50 text-amber-700 border-amber-200 dark:bg-amber-950/40 dark:text-amber-300 dark:border-amber-900",
  expired: "bg-neutral-50 text-neutral-600 border-neutral-200 dark:bg-neutral-900 dark:text-neutral-300 dark:border-neutral-800",
  cancelled: "bg-red-50 text-red-700 border-red-200 dark:bg-red-950/40 dark:text-red-300 dark:border-red-900",
  refunded: "bg-blue-50 text-blue-700 border-blue-200 dark:bg-blue-950/40 dark:text-blue-300 dark:border-blue-900",
};

type TabItem = {
  id: "metrics" | "jobs" | "marketing" | "coupons" | "support" | "users";
  label: string;
  icon: React.ComponentType<{ className?: string }>;
  count?: number;
  badge?: string;
};

function formatDate(date: Date | string | null | undefined) {
  if (!date) return "-";
  const d = typeof date === "string" ? new Date(date) : date;
  return new Intl.DateTimeFormat("pt-BR", {
    timeZone: "America/Sao_Paulo",
    day: "2-digit",
    month: "2-digit",
    year: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
  }).format(d);
}

function formatCurrency(cents: number) {
  return new Intl.NumberFormat("pt-BR", {
    style: "currency",
    currency: "BRL",
  }).format(cents / 100);
}

function StatCard({
  label,
  value,
  helper,
  icon: Icon,
  color = "blue",
}: {
  label: string;
  value: string | number;
  helper: string;
  icon?: React.ComponentType<{ className?: string }>;
  color?: "blue" | "indigo" | "emerald" | "amber" | "purple" | "rose";
}) {
  const colorClasses = {
    blue: "bg-blue-500/10 text-blue-600 dark:text-blue-400 border-blue-500/20",
    indigo: "bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 border-indigo-500/20",
    emerald: "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20",
    amber: "bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/20",
    purple: "bg-purple-500/10 text-purple-600 dark:text-purple-400 border-purple-500/20",
    rose: "bg-rose-500/10 text-rose-600 dark:text-rose-400 border-rose-500/20",
  };

  return (
    <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-5 shadow-xs space-y-2 hover:border-slate-300 dark:hover:border-slate-700 transition-all">
      <div className="flex items-center justify-between">
        <p className="text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400">
          {label}
        </p>
        {Icon && (
          <div className={`w-8 h-8 rounded-lg flex items-center justify-center border ${colorClasses[color]}`}>
            <Icon className="w-4 h-4" />
          </div>
        )}
      </div>
      <p className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white">{value}</p>
      <p className="text-xs text-slate-500 dark:text-slate-400">{helper}</p>
    </div>
  );
}

export function AdminDashboardTabs({
  stats,
  funnel24h,
  channelSubscriptions30d,
  topCampaigns,
  topLandingPages,
  topOpportunityCities,
  opportunityCampaigns,
  recentUsers,
  recentAnalyses,
  recentPayments,
  recentSupportTickets,
}: AdminDashboardProps) {
  const [activeTab, setActiveTab] = useState<"metrics" | "jobs" | "marketing" | "coupons" | "support" | "users">(
    "metrics"
  );

  // Live filter states for tables
  const [analysisSearch, setAnalysisSearch] = useState("");
  const [userSearch, setUserSearch] = useState("");
  const [paymentSearch, setPaymentSearch] = useState("");
  const [supportSearch, setSupportSearch] = useState("");

  const filteredAnalyses = useMemo(() => {
    if (!analysisSearch.trim()) return recentAnalyses;
    const q = analysisSearch.toLowerCase();
    return recentAnalyses.filter((item) => {
      const name = item.resume.user?.name?.toLowerCase() ?? "";
      const email = item.resume.user?.email?.toLowerCase() ?? "";
      const job = item.jobTitle.toLowerCase();
      const file = item.resume.fileName.toLowerCase();
      return name.includes(q) || email.includes(q) || job.includes(q) || file.includes(q);
    });
  }, [recentAnalyses, analysisSearch]);

  const filteredUsers = useMemo(() => {
    if (!userSearch.trim()) return recentUsers;
    const q = userSearch.toLowerCase();
    return recentUsers.filter((u) => {
      const name = u.name?.toLowerCase() ?? "";
      const email = u.email?.toLowerCase() ?? "";
      const seg = u.careerSegment?.toLowerCase() ?? "";
      return name.includes(q) || email.includes(q) || seg.includes(q);
    });
  }, [recentUsers, userSearch]);

  const filteredPayments = useMemo(() => {
    if (!paymentSearch.trim()) return recentPayments;
    const q = paymentSearch.toLowerCase();
    return recentPayments.filter((p) => {
      const name = p.user.name?.toLowerCase() ?? "";
      const email = p.user.email?.toLowerCase() ?? "";
      const kind = p.kind.toLowerCase();
      const status = p.status.toLowerCase();
      return name.includes(q) || email.includes(q) || kind.includes(q) || status.includes(q);
    });
  }, [recentPayments, paymentSearch]);

  const filteredTickets = useMemo(() => {
    if (!supportSearch.trim()) return recentSupportTickets;
    const q = supportSearch.toLowerCase();
    return recentSupportTickets.filter((t) => {
      const subj = t.subject.toLowerCase();
      const name = t.user.name?.toLowerCase() ?? "";
      const email = t.user.email?.toLowerCase() ?? "";
      return subj.includes(q) || name.includes(q) || email.includes(q);
    });
  }, [recentSupportTickets, supportSearch]);

  function exportUsersCSV() {
    if (filteredUsers.length === 0) return;
    const headers = ["Nome", "Email", "Segmento", "Data Cadastro", "Curriculos", "Assinatura"];
    const rows = filteredUsers.map((u) => [
      `"${(u.name || "Sem nome").replace(/"/g, '""')}"`,
      `"${(u.email || "").replace(/"/g, '""')}"`,
      `"${(u.careerSegment || "sem segmento").replace(/"/g, '""')}"`,
      `"${formatDate(u.createdAt)}"`,
      u._count.resumes,
      `"${u.subscription?.status === "active" ? "Assinante" : "Gratuito"}"`,
    ].join(","));

    const csvContent = "data:text/csv;charset=utf-8,\uFEFF" + [headers.join(","), ...rows].join("\n");
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `usuarios_recentes_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  }

  function exportPaymentsCSV() {
    if (filteredPayments.length === 0) return;
    const headers = ["Usuario", "Email", "Tipo", "Segmento", "Valor (R$)", "Status", "Data"];
    const rows = filteredPayments.map((p) => [
      `"${(p.user.name || "Usuário").replace(/"/g, '""')}"`,
      `"${(p.user.email || "").replace(/"/g, '""')}"`,
      `"${p.kind}"`,
      `"${p.segment}"`,
      (p.amount / 100).toFixed(2),
      `"${p.status}"`,
      `"${formatDate(p.paidAt ?? p.createdAt)}"`,
    ].join(","));

    const csvContent = "data:text/csv;charset=utf-8,\uFEFF" + [headers.join(","), ...rows].join("\n");
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `pagamentos_recentes_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  }

  const tabs: TabItem[] = [
    { id: "metrics", label: "Métricas & Telemetria", icon: BarChart3 },
    { id: "coupons", label: "Cupons & Influenciadoras", icon: Ticket, badge: "Cadastrados" },
    { id: "jobs", label: "Vagas & Oportunidades", icon: Briefcase },
    { id: "marketing", label: "WhatsApp & Marketing", icon: MessageSquare },
    { id: "support", label: "Chamados de Suporte", icon: Headphones, count: stats.openSupportTickets },
    { id: "users", label: "Usuários & Acessos", icon: Users },
  ];

  return (
    <div className="space-y-8">
      {/* Banner de Alertas e Notificações no Topo */}
      {(stats.openSupportTickets > 0 || stats.openOpportunityReports > 0) && (
        <div className="rounded-2xl border border-amber-200 bg-amber-50/90 p-4 dark:border-amber-900/60 dark:bg-amber-950/40 flex flex-wrap items-center justify-between gap-3 text-sm shadow-2xs">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-amber-500/10 border border-amber-500/20 flex items-center justify-center text-amber-600 dark:text-amber-400 shrink-0">
              <AlertTriangle className="w-4 h-4" />
            </div>
            <p className="font-medium text-amber-900 dark:text-amber-200">
              <strong className="font-bold">Atenção Operacional:</strong> Você possui{" "}
              {stats.openSupportTickets > 0 && `${stats.openSupportTickets} chamado(s) de suporte pendente(s)`}
              {stats.openSupportTickets > 0 && stats.openOpportunityReports > 0 && " e "}
              {stats.openOpportunityReports > 0 && `${stats.openOpportunityReports} denúncia(s) de vaga para revisar`}
              .
            </p>
          </div>
          <div className="flex items-center gap-2">
            {stats.openSupportTickets > 0 && (
              <button
                type="button"
                onClick={() => setActiveTab("support")}
                className="px-3.5 py-1.5 text-xs font-semibold rounded-lg bg-amber-600 hover:bg-amber-700 text-white transition-colors cursor-pointer shadow-xs"
              >
                Ver Chamados ({stats.openSupportTickets})
              </button>
            )}
            {stats.openOpportunityReports > 0 && (
              <button
                type="button"
                onClick={() => setActiveTab("jobs")}
                className="px-3.5 py-1.5 text-xs font-semibold rounded-lg bg-amber-600 hover:bg-amber-700 text-white transition-colors cursor-pointer shadow-xs"
              >
                Ver Denúncias ({stats.openOpportunityReports})
              </button>
            )}
          </div>
        </div>
      )}
      {/* Abas de Navegação */}
      <div className="border-b border-slate-200 dark:border-slate-800 overflow-x-auto scrollbar-none">
        <nav className="flex space-x-2 sm:space-x-4 min-w-max pb-px">
          {tabs.map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as typeof activeTab)}
                className={`flex items-center gap-2 px-4 py-3 text-sm font-semibold border-b-2 transition-all cursor-pointer ${
                  isActive
                    ? "border-blue-600 text-blue-600 dark:border-blue-500 dark:text-blue-400"
                    : "border-transparent text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white hover:border-slate-300 dark:hover:border-slate-700"
                }`}
              >
                <Icon className="w-4 h-4" />
                <span>{tab.label}</span>
                {tab.count !== undefined && tab.count > 0 && (
                  <span className="ml-1 px-2 py-0.5 text-xs font-bold rounded-full bg-rose-500 text-white">
                    {tab.count}
                  </span>
                )}
                {tab.badge && (
                  <span className="ml-1 px-2 py-0.5 text-[10px] uppercase font-extrabold rounded-md bg-purple-100 text-purple-700 dark:bg-purple-950/60 dark:text-purple-300">
                    {tab.badge}
                  </span>
                )}
              </button>
            );
          })}
        </nav>
      </div>

      {/* CONTEÚDO DA ABA: MÉTRICAS & TELEMETRIA */}
      {activeTab === "metrics" && (
        <div className="space-y-8 animate-in fade-in duration-200">
          <section className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
            <StatCard label="Receita total" value={formatCurrency(stats.revenueTotal)} helper={`${stats.paidCount} pagamentos confirmados`} icon={DollarSign} color="emerald" />
            <StatCard label="Receita 24h" value={formatCurrency(stats.revenue24h)} helper={`${stats.paid24hCount} vendas hoje`} icon={TrendingUp} color="emerald" />
            <StatCard label="Assinantes ativos" value={stats.activeSubscriptions} helper={`${stats.conversionRate}% da base de usuários`} icon={UserCheck} color="purple" />
            <StatCard label="Total de Usuários" value={stats.totalUsers} helper={`+${stats.users24h} registrados hoje`} icon={Users} color="blue" />
            <StatCard label="Análises geradas" value={stats.totalAnalyses} helper={`+${stats.analyses24h} nas últimas 24h`} icon={Activity} color="indigo" />
            <StatCard label="Currículos salvos" value={stats.totalResumes} helper="Total processados no banco" icon={FileText} color="amber" />
            <StatCard label="Feed de Vagas" value={stats.activeJobs} helper={`${stats.jobCoverage}% ativas no sistema`} icon={Briefcase} color="rose" />
            <StatCard label="Candidaturas" value={stats.totalApplications} helper="Pipeline ativo de candidatos" icon={Zap} color="blue" />
          </section>

          <section className="rounded-2xl border border-blue-200 bg-blue-50/60 p-6 dark:border-blue-900 dark:bg-blue-950/20">
            <div>
              <h2 className="text-lg font-bold text-slate-900 dark:text-white">Meta Diária de Crescimento</h2>
              <p className="mt-1 text-sm text-slate-600 dark:text-slate-400">
                Ritmo das últimas 24 horas e média móvel de 7 dias.
              </p>
            </div>
            <div className="mt-5 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
              <StatCard label="Assinaturas" value={`${stats.subscriptions24h} / 5`} helper="Confirmações oficiais hoje" color="purple" />
              <StatCard label="Visitas qualificadas" value={`${stats.visits24h} / 1.000`} helper="Sessões válidas registradas" color="blue" />
              <StatCard label="Conversão" value={`${stats.visitToSubscription}%`} helper="Visita qualificada → assinatura" color="emerald" />
              <StatCard label="Média de 7 dias" value={(stats.subscriptions7d / 7).toFixed(1)} helper={`${stats.subscriptions7d} assinaturas no período`} color="indigo" />
            </div>

            <div className="mt-6 grid gap-6 lg:grid-cols-2">
              <div className="bg-white dark:bg-slate-900 p-4 rounded-xl border border-slate-200 dark:border-slate-800">
                <h3 className="text-sm font-semibold text-slate-900 dark:text-white mb-3">Funil nas últimas 24h</h3>
                <div className="space-y-2 text-sm">
                  {funnel24h.map((item) => (
                    <div key={item.name} className="flex justify-between items-center py-1.5 border-b border-slate-100 dark:border-slate-800 last:border-0">
                      <span className="text-slate-600 dark:text-slate-400 font-mono text-xs">{item.name}</span>
                      <strong className="text-slate-900 dark:text-white">{item._count._all}</strong>
                    </div>
                  ))}
                </div>
              </div>
              <div className="bg-white dark:bg-slate-900 p-4 rounded-xl border border-slate-200 dark:border-slate-800">
                <h3 className="text-sm font-semibold text-slate-900 dark:text-white mb-3">Assinaturas por Origem · 30 dias</h3>
                <div className="space-y-2 text-sm">
                  {channelSubscriptions30d.length === 0 && (
                    <p className="text-slate-500">Nenhuma assinatura atribuída ainda.</p>
                  )}
                  {channelSubscriptions30d.map((item) => (
                    <div key={`${item.source}:${item.medium}:${item.campaign}`} className="flex justify-between items-center py-1.5 border-b border-slate-100 dark:border-slate-800 last:border-0">
                      <span className="truncate text-slate-600 dark:text-slate-400">
                        {item.source || "direto"} / {item.medium || "-"}
                        {item.campaign ? ` · ${item.campaign}` : ""}
                      </span>
                      <strong className="text-slate-900 dark:text-white">{item._count._all}</strong>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </section>

          <section className="rounded-2xl border border-slate-200 bg-white p-6 dark:border-slate-800 dark:bg-slate-900 space-y-4">
            <div>
              <h2 className="text-lg font-bold text-slate-900 dark:text-white">Tráfego e Campanhas</h2>
              <p className="text-sm text-slate-500 dark:text-slate-400">Desempenho dos últimos 30 dias de tráfego web.</p>
            </div>
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
              <StatCard label="Páginas Vistas" value={stats.pageViews30d} helper={`+${stats.pageViews24h} nas últimas 24h`} />
              <StatCard label="Sessões Únicas" value={stats.sessions30dCount} helper="Visitantes únicos no período" />
              <StatCard label="Profundidade Média" value={stats.sessions30dCount ? (stats.pageViews30d / stats.sessions30dCount).toFixed(1) : "0"} helper="Páginas visitadas por sessão" />
            </div>

            <div className="grid grid-cols-1 gap-6 lg:grid-cols-2 pt-2">
              <div className="border border-slate-100 dark:border-slate-800 rounded-xl p-4">
                <h3 className="text-sm font-semibold text-slate-900 dark:text-white mb-3">Campanhas UTM</h3>
                <div className="space-y-2 text-sm">
                  {topCampaigns.length === 0 && <p className="text-slate-500">Nenhuma campanha identificada.</p>}
                  {topCampaigns.map((item) => (
                    <div key={`${item.campaign}-${item.source}-${item.medium}`} className="flex justify-between items-center py-1 border-b border-slate-100 dark:border-slate-800 last:border-0">
                      <span className="truncate text-slate-700 dark:text-slate-300 font-medium">
                        {item.campaign} <span className="text-slate-400 font-normal">· {item.source || "direto"} / {item.medium || "-"}</span>
                      </span>
                      <strong className="text-slate-900 dark:text-white">{item._count._all}</strong>
                    </div>
                  ))}
                </div>
              </div>
              <div className="border border-slate-100 dark:border-slate-800 rounded-xl p-4">
                <h3 className="text-sm font-semibold text-slate-900 dark:text-white mb-3">Páginas mais Acessadas</h3>
                <div className="space-y-2 text-sm">
                  {topLandingPages.map((item) => (
                    <div key={item.path} className="flex justify-between items-center py-1 border-b border-slate-100 dark:border-slate-800 last:border-0">
                      <span className="truncate font-mono text-xs text-slate-600 dark:text-slate-400">{item.path}</span>
                      <strong className="text-slate-900 dark:text-white">{item._count._all}</strong>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </section>

          {/* Tabela de Atividade Recente com Filtro */}
          <section className="rounded-2xl border border-slate-200 bg-white p-6 dark:border-slate-800 dark:bg-slate-900 space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <h2 className="text-lg font-bold text-slate-900 dark:text-white">Atividade Recente de Análises</h2>
                <p className="text-sm text-slate-500">Últimos relatórios gerados por candidatos.</p>
              </div>
              <div className="relative w-full sm:w-72">
                <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                <input
                  type="text"
                  placeholder="Buscar candidato, vaga ou arquivo..."
                  value={analysisSearch}
                  onChange={(e) => setAnalysisSearch(e.target.value)}
                  className="w-full rounded-lg border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 pl-9 pr-3 py-2 text-sm focus:outline-hidden focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="text-left text-xs uppercase tracking-wide text-slate-500 border-b border-slate-200 dark:border-slate-800">
                  <tr>
                    <th className="py-2.5 pr-4 font-semibold">Usuário</th>
                    <th className="py-2.5 pr-4 font-semibold">Vaga & Arquivo</th>
                    <th className="py-2.5 pr-4 font-semibold">Score</th>
                    <th className="py-2.5 pr-4 font-semibold">Status Vaga</th>
                    <th className="py-2.5 font-semibold">Data</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                  {filteredAnalyses.map((analysis) => {
                    const contactInfo = (() => {
                      try {
                        const structured = JSON.parse(analysis.resumeStructured || "{}");
                        return {
                          name: (structured?.contact?.name as string | undefined)?.trim() || "",
                          email: (structured?.contact?.email as string | undefined)?.trim() || "",
                        };
                      } catch {
                        return { name: "", email: "" };
                      }
                    })();

                    const cleanFileName = (fileName: string) => {
                      let name = fileName.replace(/\.[^/.]+$/, "");
                      name = name.replace(/^(curriculo|currículo|cv|resume|perfil)\s*(de|do|da)?\s*/i, "");
                      name = name.replace(/[-_]+/g, " ");
                      return name
                        .split(" ")
                        .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
                        .join(" ")
                        .trim();
                    };

                    const displayName =
                      analysis.resume.user?.name || contactInfo.name || cleanFileName(analysis.resume.fileName) || "Sem nome";
                    const displayEmail = analysis.resume.user?.email || contactInfo.email || "-";
                    return (
                      <tr key={analysis.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/40">
                        <td className="py-3 pr-4">
                          <p className="font-semibold text-slate-900 dark:text-white">{displayName}</p>
                          <p className="text-xs text-slate-500">{displayEmail}</p>
                        </td>
                        <td className="py-3 pr-4 max-w-[280px]">
                          <Link href={`/report/${analysis.id}`} className="font-medium text-blue-600 dark:text-blue-400 hover:underline">
                            {analysis.jobTitle}
                          </Link>
                          <p className="text-xs text-slate-500 truncate">{analysis.resume.fileName}</p>
                        </td>
                        <td className="py-3 pr-4">
                          <span className="inline-flex items-center px-2 py-0.5 rounded-md bg-blue-50 text-blue-700 dark:bg-blue-950/60 dark:text-blue-300 font-bold text-xs">
                            {analysis.overallScore}%
                          </span>
                        </td>
                        <td className="py-3 pr-4 text-slate-600 dark:text-slate-400">{analysis.applicationStatus}</td>
                        <td className="py-3 text-slate-500 whitespace-nowrap text-xs">{formatDate(analysis.createdAt)}</td>
                      </tr>
                    );
                  })}
                  {filteredAnalyses.length === 0 && (
                    <tr>
                      <td colSpan={5} className="py-6 text-center text-slate-500">
                        Nenhuma análise encontrada.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </section>
        </div>
      )}

      {/* CONTEÚDO DA ABA: CUPONS & INFLUENCIADORES */}
      {activeTab === "coupons" && (
        <div className="space-y-6 animate-in fade-in duration-200">
          <section className="rounded-2xl border border-slate-200 bg-white p-6 dark:border-slate-800 dark:bg-slate-900">
            <div>
              <h2 className="text-lg font-bold text-slate-900 dark:text-white">Gerenciamento de Cupons & Influenciadoras</h2>
              <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
                Cadastre novos cupons, visualize comissões e confira quem se cadastrou por cada código de influenciadora.
              </p>
            </div>
            <div className="mt-6">
              <AdminCouponManager />
            </div>
          </section>
        </div>
      )}

      {/* CONTEÚDO DA ABA: VAGAS & OPORTUNIDADES */}
      {activeTab === "jobs" && (
        <div className="space-y-8 animate-in fade-in duration-200">
          <section className="grid gap-4 sm:grid-cols-4">
            <StatCard label="Oportunidades Ativas" value={stats.activePublicOpportunities} helper="SINEs e portais parceiros" color="blue" />
            <StatCard label="Cliques em Vagas" value={stats.opportunityClicks30d} helper="Últimos 30 dias de acessos" color="emerald" />
            <StatCard label="Alertas de Vaga" value={stats.activeJobAlerts} helper="Usuários recebendo avisos" color="purple" />
            <StatCard label="Denúncias Abertas" value={stats.openOpportunityReports} helper="Vagas que requerem revisão" color="rose" />
          </section>

          <section className="grid gap-6 md:grid-cols-2">
            <div className="rounded-2xl border border-slate-200 bg-white p-6 dark:border-slate-800 dark:bg-slate-900 space-y-3">
              <h3 className="text-base font-bold text-slate-900 dark:text-white">Cidades com Mais Oportunidades</h3>
              <div className="space-y-2 text-sm">
                {topOpportunityCities.map((item) => (
                  <div key={`${item.state}:${item.city}`} className="flex justify-between items-center py-2 border-b border-slate-100 dark:border-slate-800 last:border-0">
                    <span className="font-medium text-slate-700 dark:text-slate-300">
                      {item.city || "Local não informado"}{item.state ? `, ${item.state}` : ""}
                    </span>
                    <strong className="text-slate-900 dark:text-white">{item._count._all}</strong>
                  </div>
                ))}
              </div>
            </div>

            <div className="rounded-2xl border border-slate-200 bg-white p-6 dark:border-slate-800 dark:bg-slate-900 space-y-3">
              <h3 className="text-base font-bold text-slate-900 dark:text-white">Campanhas com Cliques</h3>
              <div className="space-y-2 text-sm">
                {opportunityCampaigns.length === 0 && <p className="text-slate-500">Nenhum clique registrado com campanha.</p>}
                {opportunityCampaigns.map((item) => (
                  <div key={item.campaign} className="flex justify-between items-center py-2 border-b border-slate-100 dark:border-slate-800 last:border-0">
                    <span className="font-mono text-xs text-slate-600 dark:text-slate-400">{item.campaign}</span>
                    <strong className="text-slate-900 dark:text-white">{item._count._all}</strong>
                  </div>
                ))}
              </div>
            </div>
          </section>

          <section className="rounded-2xl border border-slate-200 bg-white p-6 dark:border-slate-800 dark:bg-slate-900 space-y-6">
            <div>
              <h2 className="text-lg font-bold text-slate-900 dark:text-white">Atualização de Fontes de Vagas (MEC / SINE)</h2>
              <p className="text-sm text-slate-500">Sincronize portais externos e o Aprenda Mais MEC.</p>
            </div>
            <AdminExternalSources />
          </section>

          <section className="rounded-2xl border border-slate-200 bg-white p-6 dark:border-slate-800 dark:bg-slate-900 space-y-6">
            <div>
              <h2 className="text-lg font-bold text-slate-900 dark:text-white">Denúncias e Revisão de Vagas</h2>
              <p className="text-sm text-slate-500">Alertas de links quebrados ou conteúdos impróprios.</p>
            </div>
            <AdminOpportunityReports />
          </section>
        </div>
      )}

      {/* CONTEÚDO DA ABA: WHATSAPP & MARKETING */}
      {activeTab === "marketing" && (
        <div className="space-y-8 animate-in fade-in duration-200">
          <section className="rounded-2xl border border-slate-200 bg-white p-6 dark:border-slate-800 dark:bg-slate-900 space-y-6">
            <div>
              <h2 className="text-lg font-bold text-slate-900 dark:text-white">Conexão WhatsApp</h2>
              <p className="text-sm text-slate-500">Pareamento do número de marketing para mensagens automáticas.</p>
            </div>
            <AdminWhatsappConnection />
          </section>

          <section className="rounded-2xl border border-slate-200 bg-white p-6 dark:border-slate-800 dark:bg-slate-900 space-y-6">
            <div>
              <h2 className="text-lg font-bold text-slate-900 dark:text-white">Disparo de Campanhas de Conversão</h2>
              <p className="text-sm text-slate-500">
                Envie toques da régua de conversão para leads e usuários que ainda não assinaram.
              </p>
            </div>
            <AdminWhatsappMarketingCampaign />
          </section>
        </div>
      )}

      {/* CONTEÚDO DA ABA: CHAMADOS DE SUPORTE */}
      {activeTab === "support" && (
        <div className="space-y-8 animate-in fade-in duration-200">
          <section className="rounded-2xl border border-slate-200 bg-white p-6 dark:border-slate-800 dark:bg-slate-900 space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <h2 className="text-lg font-bold text-slate-900 dark:text-white">Central de Atendimento ao Cliente</h2>
                <p className="text-sm text-slate-500">Chamados em aberto e solicitações recentes.</p>
              </div>
              <div className="flex items-center gap-3">
                <div className="relative w-full sm:w-64">
                  <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                  <input
                    type="text"
                    placeholder="Buscar assunto ou cliente..."
                    value={supportSearch}
                    onChange={(e) => setSupportSearch(e.target.value)}
                    className="w-full rounded-lg border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 pl-9 pr-3 py-2 text-sm focus:outline-hidden focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <Link
                  href="/admin/suporte"
                  className="rounded-lg bg-blue-600 text-white font-medium px-4 py-2 text-sm hover:bg-blue-700 transition-colors shrink-0"
                >
                  Abrir painel completo
                </Link>
              </div>
            </div>

            {filteredTickets.length === 0 ? (
              <p className="text-sm text-slate-500">Nenhum chamado encontrado.</p>
            ) : (
              <div className="divide-y divide-slate-100 dark:divide-slate-800">
                {filteredTickets.map((ticket) => {
                  const status = normalizeSupportStatus(ticket.status);
                  const lastMessage = ticket.messages[0];
                  return (
                    <Link
                      key={ticket.id}
                      href={`/admin/suporte/${ticket.id}`}
                      className="block py-4 first:pt-0 last:pb-0 hover:bg-slate-50 dark:hover:bg-slate-800/40 px-2 rounded-lg transition-colors"
                    >
                      <div className="flex items-start justify-between gap-3">
                        <div className="min-w-0">
                          <p className="truncate text-sm font-bold text-slate-900 dark:text-white">{ticket.subject}</p>
                          <p className="mt-1 truncate text-xs text-slate-500">
                            {ticket.user.name ?? ticket.user.email ?? "Usuário"} · {SUPPORT_CATEGORY_LABELS[normalizeSupportCategory(ticket.category)]} · {formatDate(ticket.updatedAt)}
                          </p>
                        </div>
                        <span className={`shrink-0 rounded-full px-2.5 py-0.5 text-[11px] font-semibold ${supportStatusBadgeClass(status)}`}>
                          {SUPPORT_STATUS_ADMIN_LABELS[status]}
                        </span>
                      </div>
                      {lastMessage && (
                        <p className="mt-2 line-clamp-2 text-xs text-slate-600 dark:text-slate-400">
                          {lastMessage.fromAdmin ? "Suporte: " : "Usuário: "}{lastMessage.body}
                        </p>
                      )}
                    </Link>
                  );
                })}
              </div>
            )}
          </section>
        </div>
      )}

      {/* CONTEÚDO DA ABA: USUÁRIOS & ACESSOS */}
      {activeTab === "users" && (
        <div className="space-y-8 animate-in fade-in duration-200">
          <section className="grid grid-cols-1 lg:grid-cols-[minmax(0,1fr)_400px] gap-6">
            <div className="rounded-2xl border border-slate-200 bg-white p-6 dark:border-slate-800 dark:bg-slate-900 space-y-4">
              <h2 className="text-lg font-bold text-slate-900 dark:text-white">Controle de Acesso & Concessão</h2>
              <p className="text-sm text-slate-500">
                Busque por e-mail para conceder créditos de análise ou liberar planos manualmente.
              </p>
              <div className="pt-2">
                <AdminUserLookup />
              </div>
            </div>

            <div className="rounded-2xl border border-slate-200 bg-white p-6 dark:border-slate-800 dark:bg-slate-900 space-y-4">
              <h2 className="text-lg font-bold text-slate-900 dark:text-white">Configuração do Modelo de IA</h2>
              <p className="text-sm text-slate-500">Defina o modelo Groq ativo para o motor de análise.</p>
              <div className="pt-2">
                <AdminGroqModel />
              </div>
            </div>
          </section>

          {/* Listas de Usuários Novos e Pagamentos */}
          <section className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div className="rounded-2xl border border-slate-200 bg-white p-6 dark:border-slate-800 dark:bg-slate-900 space-y-4">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <h2 className="text-base font-bold text-slate-900 dark:text-white">Usuários Recentes</h2>
                <div className="flex items-center gap-2">
                  <div className="relative w-40 sm:w-48">
                    <Search className="w-3.5 h-3.5 absolute left-2.5 top-1/2 -translate-y-1/2 text-slate-400" />
                    <input
                      type="text"
                      placeholder="Filtrar..."
                      value={userSearch}
                      onChange={(e) => setUserSearch(e.target.value)}
                      className="w-full rounded-md border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 pl-8 pr-2 py-1 text-xs"
                    />
                  </div>
                  <button
                    type="button"
                    onClick={exportUsersCSV}
                    title="Exportar CSV de Usuários"
                    className="p-1.5 rounded-md border border-slate-200 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-800 text-slate-600 dark:text-slate-400 cursor-pointer"
                  >
                    <Download className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
              <div className="divide-y divide-slate-100 dark:divide-slate-800">
                {filteredUsers.map((user) => (
                  <div key={user.id} className="py-3 flex items-center justify-between gap-4">
                    <div className="min-w-0">
                      <p className="font-semibold text-slate-900 dark:text-white truncate">{user.name ?? "Sem nome"}</p>
                      <p className="text-xs text-slate-500 truncate">{user.email ?? "-"}</p>
                      <p className="text-xs text-slate-400">
                        {user.careerSegment ?? "sem segmento"} · {formatDate(user.createdAt)}
                      </p>
                    </div>
                    <div className="text-right text-xs text-slate-500 shrink-0">
                      <p>{user._count.resumes} currículo(s)</p>
                      <p>{user.subscription?.status === "active" ? "Assinante" : `${user._count.payments} pag.`}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="rounded-2xl border border-slate-200 bg-white p-6 dark:border-slate-800 dark:bg-slate-900 space-y-4">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <h2 className="text-base font-bold text-slate-900 dark:text-white">Pagamentos Recentes</h2>
                <div className="flex items-center gap-2">
                  <div className="relative w-40 sm:w-48">
                    <Search className="w-3.5 h-3.5 absolute left-2.5 top-1/2 -translate-y-1/2 text-slate-400" />
                    <input
                      type="text"
                      placeholder="Filtrar..."
                      value={paymentSearch}
                      onChange={(e) => setPaymentSearch(e.target.value)}
                      className="w-full rounded-md border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 pl-8 pr-2 py-1 text-xs"
                    />
                  </div>
                  <button
                    type="button"
                    onClick={exportPaymentsCSV}
                    title="Exportar CSV de Pagamentos"
                    className="p-1.5 rounded-md border border-slate-200 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-800 text-slate-600 dark:text-slate-400 cursor-pointer"
                  >
                    <Download className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
              <div className="divide-y divide-slate-100 dark:divide-slate-800">
                {filteredPayments.map((payment) => (
                  <div key={payment.id} className="py-3 flex items-center justify-between gap-4">
                    <div className="min-w-0">
                      <p className="font-semibold text-slate-900 dark:text-white truncate">{payment.user.name ?? payment.user.email ?? "Usuário"}</p>
                      <p className="text-xs text-slate-500">
                        {payment.kind} · {payment.segment} · {formatDate(payment.paidAt ?? payment.createdAt)}
                      </p>
                    </div>
                    <div className="text-right shrink-0">
                      <p className="font-bold text-slate-900 dark:text-white">{formatCurrency(payment.amount)}</p>
                      <span className={`inline-flex mt-1 rounded-full border px-2 py-0.5 text-xs ${paymentStatusClasses[payment.status] ?? paymentStatusClasses.pending}`}>
                        {payment.status}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </section>
        </div>
      )}
    </div>
  );
}
