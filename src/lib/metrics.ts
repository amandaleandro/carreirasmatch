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
      labelNames: ["provider", "outcome"] as const,
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
