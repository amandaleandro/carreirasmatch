import posthog from "posthog-js";

/**
 * Inicializa o PostHog uma única vez no browser. Sem configuração, produção
 * permanece no-op; desenvolvimento falha com uma mensagem acionável.
 *
 * Roda em paralelo ao Plausible (src/components/analytics.tsx): Plausible
 * cobre métricas agregadas sem cookies, PostHog cobre funil/eventos por
 * usuário. `track()` em src/lib/analytics.ts despacha para os dois.
 */
export function initPostHog() {
  const key = process.env.NEXT_PUBLIC_POSTHOG_PROJECT_TOKEN;
  const host = process.env.NEXT_PUBLIC_POSTHOG_HOST;

  if (!key) {
    if (process.env.NODE_ENV !== "production") {
      throw new Error(
        "NEXT_PUBLIC_POSTHOG_PROJECT_TOKEN variable required by PostHog is missing or un-configured, this causes events to be silently missed. This error stops appearing once NEXT_PUBLIC_POSTHOG_PROJECT_TOKEN is configured",
      );
    }
    return;
  }

  if (!host) {
    if (process.env.NODE_ENV !== "production") {
      throw new Error(
        "NEXT_PUBLIC_POSTHOG_HOST variable required by PostHog is missing or un-configured, this causes events to be silently missed. This error stops appearing once NEXT_PUBLIC_POSTHOG_HOST is configured",
      );
    }
    return;
  }

  posthog.init(key, {
    api_host: host,
    person_profiles: "identified_only",
    capture_pageview: true,
    capture_exceptions: true,
  });

  window.posthog = posthog;
}
