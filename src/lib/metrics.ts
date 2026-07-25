import {
  Registry,
  collectDefaultMetrics,
  Counter,
  Gauge,
  Histogram,
} from "prom-client";
import { prisma } from "@/lib/prisma";

// Registry único e compartilhado. Guardado no globalThis para sobreviver ao
// hot-reload do dev e a múltiplas importações do módulo (evita erro de métrica
// duplicada "has already been registered").
const globalForMetrics = globalThis as unknown as {
  __promRegistry?: Registry;
};

function buildRegistry(): Registry {
  const registry = new Registry();
  registry.setDefaultLabels({ app: "carreiras-match" });
  // Métricas de processo Node: heap, event loop lag, GC, CPU, handles abertos.
  collectDefaultMetrics({ register: registry });
  return registry;
}

export const registry: Registry =
  globalForMetrics.__promRegistry ??
  (globalForMetrics.__promRegistry = buildRegistry());

// Helper para criar métricas idempotentes: se já existir uma com o mesmo nome
// (por causa de hot-reload), reutiliza em vez de estourar.
function getOrCreate<T>(name: string, factory: () => T): T {
  const existing = registry.getSingleMetric(name);
  if (existing) return existing as T;
  return factory();
}

// --- Métricas de negócio ---

export const analysisTotal = getOrCreate(
  "carreiras_analysis_total",
  () =>
    new Counter({
      name: "carreiras_analysis_total",
      help: "Total de análises de currículo processadas",
      labelNames: ["career_track", "logged_in", "outcome"] as const,
      registers: [registry],
    })
);

export const analysisDuration = getOrCreate(
  "carreiras_analysis_duration_seconds",
  () =>
    new Histogram({
      name: "carreiras_analysis_duration_seconds",
      help: "Duração da análise de currículo (chamada de IA + persistência)",
      labelNames: ["career_track", "outcome"] as const,
      buckets: [0.5, 1, 2, 5, 10, 20, 40, 60],
      registers: [registry],
    })
);

export const aiProviderCalls = getOrCreate(
  "carreiras_ai_provider_calls_total",
  () =>
    new Counter({
      name: "carreiras_ai_provider_calls_total",
      help: "Chamadas a provedores de IA por resultado",
      labelNames: ["provider", "model", "operation", "outcome"] as const,
      registers: [registry],
    })
);

export const aiTokensTotal = getOrCreate(
  "carreiras_ai_tokens_total",
  () =>
    new Counter({
      name: "carreiras_ai_tokens_total",
      help: "Tokens consumidos por provedor, modelo e direção",
      labelNames: ["provider", "model", "operation", "direction"] as const,
      registers: [registry],
    })
);

export const aiEstimatedCostUsd = getOrCreate(
  "carreiras_ai_estimated_cost_usd_total",
  () =>
    new Counter({
      name: "carreiras_ai_estimated_cost_usd_total",
      help: "Custo estimado em USD para modelos com preço conhecido",
      labelNames: ["provider", "model", "operation"] as const,
      registers: [registry],
    })
);

export const aiCacheEvents = getOrCreate(
  "carreiras_ai_cache_events_total",
  () =>
    new Counter({
      name: "carreiras_ai_cache_events_total",
      help: "Eventos do cache de IA",
      labelNames: ["operation", "result"] as const,
      registers: [registry],
    })
);

export const aiProviderDuration = getOrCreate(
  "carreiras_ai_provider_duration_seconds",
  () =>
    new Histogram({
      name: "carreiras_ai_provider_duration_seconds",
      help: "Latência das tentativas por provedor, modelo e resultado",
      labelNames: ["provider", "model", "operation", "outcome"] as const,
      buckets: [0.25, 0.5, 1, 2, 5, 10, 20, 40, 60],
      registers: [registry],
    })
);

export const freeAnalysisLimitHit = getOrCreate(
  "carreiras_free_analysis_limit_hit_total",
  () =>
    new Counter({
      name: "carreiras_free_analysis_limit_hit_total",
      help: "Vezes que um usuário sem assinatura bateu no limite de análises grátis (diário ou mensal)",
      labelNames: ["reason"] as const,
      registers: [registry],
    })
);

export const freeToolTrial = getOrCreate(
  "carreiras_free_tool_trial_total",
  () =>
    new Counter({
      name: "carreiras_free_tool_trial_total",
      help: "Resultado de tentativas de uso das ferramentas accountFree (1 uso grátis por ferramenta)",
      labelNames: ["tool", "outcome"] as const,
      registers: [registry],
    })
);

export const paymentEvents = getOrCreate(
  "carreiras_payment_events_total",
  () =>
    new Counter({
      name: "carreiras_payment_events_total",
      help: "Eventos de pagamento/assinatura por tipo e status",
      labelNames: ["kind", "status"] as const,
      registers: [registry],
    })
);

// --- Snapshots agregados de negócio e PostgreSQL ---

export const businessTotals = getOrCreate(
  "carreiras_business_total",
  () =>
    new Gauge({
      name: "carreiras_business_total",
      help: "Totais atuais agregados por entidade de negócio",
      labelNames: ["entity"] as const,
      registers: [registry],
    })
);

export const businessCreated = getOrCreate(
  "carreiras_business_created",
  () =>
    new Gauge({
      name: "carreiras_business_created",
      help: "Registros criados em uma janela móvel por entidade",
      labelNames: ["entity", "period"] as const,
      registers: [registry],
    })
);

export const businessBreakdown = getOrCreate(
  "carreiras_business_breakdown",
  () =>
    new Gauge({
      name: "carreiras_business_breakdown",
      help: "Distribuições atuais de métricas de negócio por categoria",
      labelNames: ["metric", "value"] as const,
      registers: [registry],
    })
);

export const businessRevenueCents = getOrCreate(
  "carreiras_business_revenue_cents",
  () =>
    new Gauge({
      name: "carreiras_business_revenue_cents",
      help: "Receita confirmada em centavos por canal e período",
      labelNames: ["channel", "period"] as const,
      registers: [registry],
    })
);

export const businessFlow = getOrCreate(
  "carreiras_business_flow",
  () =>
    new Gauge({
      name: "carreiras_business_flow",
      help: "Volumes agregados dos fluxos de negócio por canal e período",
      labelNames: ["metric", "channel", "period"] as const,
      registers: [registry],
    })
);

export const funnelEvents = getOrCreate(
  "carreiras_funnel_events",
  () =>
    new Gauge({
      name: "carreiras_funnel_events",
      help: "Eventos de funil de conversão (FunnelEvent) por nome e janela móvel",
      labelNames: ["name", "period"] as const,
      registers: [registry],
    })
);

export const accessSummary = getOrCreate(
  "carreiras_access_summary",
  () =>
    new Gauge({
      name: "carreiras_access_summary",
      help: "Indicadores agregados de acesso por período",
      labelNames: ["metric", "period"] as const,
      registers: [registry],
    })
);

export const accessBreakdown = getOrCreate(
  "carreiras_access_breakdown",
  () =>
    new Gauge({
      name: "carreiras_access_breakdown",
      help: "Principais dimensões agregadas de tráfego nos últimos 30 dias",
      labelNames: ["dimension", "value"] as const,
      registers: [registry],
    })
);

export const postgresStats = getOrCreate(
  "carreiras_postgres_stat",
  () =>
    new Gauge({
      name: "carreiras_postgres_stat",
      help: "Estatísticas operacionais agregadas do PostgreSQL",
      labelNames: ["metric"] as const,
      registers: [registry],
    })
);

// --- Métricas de Observabilidade Massiva ---

export const httpRequestsTotal = getOrCreate(
  "carreiras_http_requests_total",
  () =>
    new Counter({
      name: "carreiras_http_requests_total",
      help: "Total de requisições HTTP processadas por rota, método e status code",
      labelNames: ["route", "method", "status_code"] as const,
      registers: [registry],
    })
);

export const httpRequestDurationSeconds = getOrCreate(
  "carreiras_http_request_duration_seconds",
  () =>
    new Histogram({
      name: "carreiras_http_request_duration_seconds",
      help: "Latência das requisições HTTP por rota, método e status code",
      labelNames: ["route", "method", "status_code"] as const,
      buckets: [0.01, 0.05, 0.1, 0.25, 0.5, 1, 2.5, 5, 10],
      registers: [registry],
    })
);

export const reanalysisEventsTotal = getOrCreate(
  "carreiras_reanalysis_events_total",
  () =>
    new Counter({
      name: "carreiras_reanalysis_events_total",
      help: "Total de reanálises pós-edição de currículo efetuadas",
      labelNames: ["outcome", "score_improved"] as const,
      registers: [registry],
    })
);

export const securityRateLimitHits = getOrCreate(
  "carreiras_security_rate_limit_hits_total",
  () =>
    new Counter({
      name: "carreiras_security_rate_limit_hits_total",
      help: "Bloqueios de rate-limit e segurança acionados",
      labelNames: ["route", "reason"] as const,
      registers: [registry],
    })
);

export const segmentedActiveUsers = getOrCreate(
  "carreiras_segmented_active_users",
  () =>
    new Gauge({
      name: "carreiras_segmented_active_users",
      help: "Usuários ativos agregados por segmento de carreira",
      labelNames: ["segment"] as const,
      registers: [registry],
    })
);

export const sourceSyncSecondsSinceSuccess = getOrCreate(
  "carreiras_source_sync_seconds_since_success",
  () =>
    new Gauge({
      name: "carreiras_source_sync_seconds_since_success",
      help: "Segundos desde a última coleta bem-sucedida de cada fonte externa (radares, feeds, cursos)",
      labelNames: ["key"] as const,
      registers: [registry],
    })
);

export const sourceSyncError = getOrCreate(
  "carreiras_source_sync_error",
  () =>
    new Gauge({
      name: "carreiras_source_sync_error",
      help: "1 se a última tentativa de coleta da fonte terminou em erro, 0 caso contrário",
      labelNames: ["key"] as const,
      registers: [registry],
    })
);

export const businessSnapshotSuccess = getOrCreate(
  "carreiras_business_snapshot_success",
  () =>
    new Gauge({
      name: "carreiras_business_snapshot_success",
      help: "1 se a última coleta agregada de negócio funcionou, 0 se falhou",
      registers: [registry],
    })
);

export const businessSnapshotDuration = getOrCreate(
  "carreiras_business_snapshot_duration_seconds",
  () =>
    new Histogram({
      name: "carreiras_business_snapshot_duration_seconds",
      help: "Duração da coleta agregada de métricas de negócio",
      buckets: [0.01, 0.025, 0.05, 0.1, 0.25, 0.5, 1, 2, 5],
      registers: [registry],
    })
);

let businessSnapshotExpiresAt = 0;
let businessSnapshotInFlight: Promise<void> | null = null;
const BUSINESS_SNAPSHOT_TTL_MS = 60_000;

type GroupCount = { status: string; _count: { _all: number } };
type DatabaseStatsRow = { database_bytes: bigint; connections: bigint };

async function collectBusinessSnapshot(now: Date): Promise<void> {
  const periods = [
    { label: "24h", start: new Date(now.getTime() - 24 * 60 * 60 * 1000) },
    { label: "7d", start: new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000) },
    { label: "30d", start: new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000) },
  ] as const;

  const [
    users,
    leads,
    resumes,
    analyses,
    applications,
    companies,
    companyScreenings,
    talentContacts,
    freelanceProjects,
    freelanceProposals,
    freelanceContracts,
    posts,
    radarItems,
    jobAlertsSent,
    sourceSyncs,
    subscriptionGroups,
    applicationGroups,
    paymentGroups,
    companyPaymentGroups,
    freeToolUsageGroups,
    databaseRows,
    periodSnapshots,
    topPaths,
    topSources,
    topMediums,
    topReferrers,
  ] = await Promise.all([
    prisma.user.count(),
    prisma.lead.count(),
    prisma.resume.count(),
    prisma.analysis.count(),
    prisma.application.count(),
    prisma.company.count(),
    prisma.companyJob.count(),
    prisma.talentContactRequest.count(),
    prisma.freelanceProject.count(),
    prisma.freelanceProposal.count(),
    prisma.freelanceContract.count(),
    prisma.post.count(),
    prisma.radarItem.count({ where: { active: true } }),
    prisma.emailLog.count({ where: { type: "job_alert" } }),
    prisma.sourceSync.findMany(),
    prisma.subscription.groupBy({ by: ["status"], _count: { _all: true } }),
    prisma.application.groupBy({ by: ["status"], _count: { _all: true } }),
    prisma.payment.groupBy({
      by: ["status"],
      _count: { _all: true },
      _sum: { amount: true },
    }),
    prisma.companyPayment.groupBy({
      by: ["status"],
      _count: { _all: true },
      _sum: { amount: true },
    }),
    prisma.freeToolUsage.groupBy({ by: ["tool"], _count: { _all: true } }),
    prisma.$queryRaw<DatabaseStatsRow[]>`
      SELECT
        pg_database_size(current_database())::bigint AS database_bytes,
        (
          SELECT COUNT(*)::bigint
          FROM pg_stat_activity
          WHERE datname = current_database()
        ) AS connections
    `,
    Promise.all(
      periods.map(async ({ label, start }) => ({
        label,
        users: await prisma.user.count({ where: { createdAt: { gte: start } } }),
        leads: await prisma.lead.count({ where: { createdAt: { gte: start } } }),
        resumes: await prisma.resume.count({ where: { createdAt: { gte: start } } }),
        analyses: await prisma.analysis.count({ where: { createdAt: { gte: start } } }),
        applications: await prisma.application.count({ where: { createdAt: { gte: start } } }),
        companies: await prisma.company.count({ where: { createdAt: { gte: start } } }),
        pageViews: await prisma.pageView.count({ where: { createdAt: { gte: start } } }),
        freelanceProjects: await prisma.freelanceProject.count({ where: { createdAt: { gte: start } } }),
        freelanceProposals: await prisma.freelanceProposal.count({ where: { createdAt: { gte: start } } }),
        freelanceContracts: await prisma.freelanceContract.count({ where: { createdAt: { gte: start } } }),
        posts: await prisma.post.count({ where: { publishedAt: { gte: start } } }),
        jobAlertsSent: await prisma.emailLog.count({ where: { type: "job_alert", createdAt: { gte: start } } }),
        uniqueSessions: (
          await prisma.pageView.groupBy({
            by: ["sessionId"],
            where: { createdAt: { gte: start } },
          })
        ).length,
        paidRevenue: await prisma.payment.aggregate({
          where: { status: "paid", paidAt: { gte: start } },
          _sum: { amount: true },
        }),
        companyRevenue: await prisma.companyPayment.aggregate({
          where: { status: "paid", paidAt: { gte: start } },
          _sum: { amount: true },
        }),
        candidatePaymentAttempts: await prisma.payment.count({
          where: { createdAt: { gte: start } },
        }),
        candidatePaymentsPaid: await prisma.payment.count({
          where: { status: "paid", paidAt: { gte: start } },
        }),
        companyPaymentAttempts: await prisma.companyPayment.count({
          where: { createdAt: { gte: start } },
        }),
        companyPaymentsPaid: await prisma.companyPayment.count({
          where: { status: "paid", paidAt: { gte: start } },
        }),
        funnelEventGroups: await prisma.funnelEvent.groupBy({
          by: ["name"],
          where: { createdAt: { gte: start } },
          _count: { _all: true },
        }),
      }))
    ),
    prisma.pageView.groupBy({
      by: ["path"],
      where: { createdAt: { gte: periods[2].start } },
      _count: { _all: true },
      orderBy: { _count: { path: "desc" } },
      take: 10,
    }),
    prisma.pageView.groupBy({
      by: ["source"],
      where: { createdAt: { gte: periods[2].start } },
      _count: { _all: true },
      orderBy: { _count: { source: "desc" } },
      take: 10,
    }),
    prisma.pageView.groupBy({
      by: ["medium"],
      where: { createdAt: { gte: periods[2].start } },
      _count: { _all: true },
      orderBy: { _count: { medium: "desc" } },
      take: 10,
    }),
    prisma.pageView.groupBy({
      by: ["referrerHost"],
      where: {
        createdAt: { gte: periods[2].start },
        referrerHost: {
          notIn: ["carreirasmatch.com.br", "www.carreirasmatch.com.br", "localhost", "127.0.0.1", ""],
        },
      },
      _count: { _all: true },
      orderBy: { _count: { referrerHost: "desc" } },
      take: 10,
    }),
  ]);

  businessTotals.reset();
  for (const [entity, value] of Object.entries({
    users,
    leads,
    resumes,
    analyses,
    applications,
    companies,
    company_screenings: companyScreenings,
    talent_contacts: talentContacts,
    freelance_projects: freelanceProjects,
    freelance_proposals: freelanceProposals,
    freelance_contracts: freelanceContracts,
    posts,
    radar_items_active: radarItems,
    job_alerts_sent: jobAlertsSent,
  })) {
    businessTotals.set({ entity }, value);
  }

  businessCreated.reset();
  businessRevenueCents.reset();
  businessFlow.reset();
  accessSummary.reset();
  funnelEvents.reset();
  for (const snapshot of periodSnapshots) {
    for (const [entity, value] of Object.entries({
      users: snapshot.users,
      leads: snapshot.leads,
      resumes: snapshot.resumes,
      analyses: snapshot.analyses,
      applications: snapshot.applications,
      companies: snapshot.companies,
      page_views: snapshot.pageViews,
      freelance_projects: snapshot.freelanceProjects,
      freelance_proposals: snapshot.freelanceProposals,
      freelance_contracts: snapshot.freelanceContracts,
      posts: snapshot.posts,
      job_alerts_sent: snapshot.jobAlertsSent,
    })) {
      businessCreated.set({ entity, period: snapshot.label }, value);
    }
    businessRevenueCents.set(
      { channel: "candidate", period: snapshot.label },
      snapshot.paidRevenue._sum.amount ?? 0
    );
    businessRevenueCents.set(
      { channel: "company", period: snapshot.label },
      snapshot.companyRevenue._sum.amount ?? 0
    );
    businessFlow.set(
      { metric: "payment_attempts", channel: "candidate", period: snapshot.label },
      snapshot.candidatePaymentAttempts
    );
    businessFlow.set(
      { metric: "payments_paid", channel: "candidate", period: snapshot.label },
      snapshot.candidatePaymentsPaid
    );
    businessFlow.set(
      { metric: "payment_attempts", channel: "company", period: snapshot.label },
      snapshot.companyPaymentAttempts
    );
    businessFlow.set(
      { metric: "payments_paid", channel: "company", period: snapshot.label },
      snapshot.companyPaymentsPaid
    );
    accessSummary.set(
      { metric: "unique_sessions", period: snapshot.label },
      snapshot.uniqueSessions
    );
    for (const group of snapshot.funnelEventGroups) {
      funnelEvents.set({ name: group.name, period: snapshot.label }, group._count._all);
    }
  }

  accessBreakdown.reset();
  for (const item of topPaths) {
    accessBreakdown.set(
      { dimension: "path", value: item.path },
      item._count._all
    );
  }
  for (const item of topSources) {
    accessBreakdown.set(
      { dimension: "source", value: item.source || "(direto)" },
      item._count._all
    );
  }
  for (const item of topMediums) {
    accessBreakdown.set(
      { dimension: "medium", value: item.medium || "(não informado)" },
      item._count._all
    );
  }
  for (const item of topReferrers) {
    accessBreakdown.set(
      { dimension: "referrer", value: item.referrerHost || "(direto)" },
      item._count._all
    );
  }

  for (const sync of sourceSyncs) {
    sourceSyncSecondsSinceSuccess.set(
      { key: sync.key },
      sync.lastSuccessAt ? (now.getTime() - sync.lastSuccessAt.getTime()) / 1000 : -1
    );
    sourceSyncError.set({ key: sync.key }, sync.lastError ? 1 : 0);
  }

  businessBreakdown.reset();
  for (const group of subscriptionGroups as GroupCount[]) {
    businessBreakdown.set(
      { metric: "subscription_status", value: group.status },
      group._count._all
    );
  }
  for (const group of applicationGroups as GroupCount[]) {
    businessBreakdown.set(
      { metric: "application_status", value: group.status },
      group._count._all
    );
  }
  for (const group of paymentGroups) {
    businessBreakdown.set(
      { metric: "payment_status", value: group.status },
      group._count._all
    );
  }
  for (const group of companyPaymentGroups) {
    businessBreakdown.set(
      { metric: "company_payment_status", value: group.status },
      group._count._all
    );
  }
  for (const group of freeToolUsageGroups) {
    businessBreakdown.set(
      { metric: "free_tool_usage", value: group.tool },
      group._count._all
    );
  }

  const database = databaseRows[0];
  if (database) {
    postgresStats.set({ metric: "database_bytes" }, Number(database.database_bytes));
    postgresStats.set({ metric: "connections" }, Number(database.connections));
  }
}

export async function refreshBusinessMetrics(): Promise<void> {
  const now = Date.now();
  if (businessSnapshotExpiresAt > now) return;
  if (businessSnapshotInFlight) return businessSnapshotInFlight;

  businessSnapshotInFlight = (async () => {
    const stopTimer = businessSnapshotDuration.startTimer();
    try {
      await collectBusinessSnapshot(new Date());
      businessSnapshotSuccess.set(1);
      businessSnapshotExpiresAt = Date.now() + BUSINESS_SNAPSHOT_TTL_MS;
    } catch (error) {
      businessSnapshotSuccess.set(0);
      console.error("[metrics] falha ao coletar snapshot de negócio:", error);
    } finally {
      stopTimer();
      businessSnapshotInFlight = null;
    }
  })();

  return businessSnapshotInFlight;
}
