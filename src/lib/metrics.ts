import {
  Registry,
  collectDefaultMetrics,
  Counter,
  Histogram,
} from "prom-client";

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
