/**
 * Camada de analytics provider-agnóstica. Hoje envia para o Plausible (se
 * configurado via NEXT_PUBLIC_PLAUSIBLE_DOMAIN), mas `track()` é um no-op seguro
 * quando nenhum provedor está carregado, então pode ser chamado em qualquer
 * lugar sem quebrar nada.
 *
 * Os nomes de evento em ANALYTICS_EVENTS mapeiam o funil do produto:
 * visitante → análise grátis → teaser do diagnóstico → desbloqueio/assinatura.
 */

export const ANALYTICS_EVENTS = {
  ANALYSIS_STARTED: "analysis_started",
  ANALYSIS_COMPLETED: "analysis_completed",
  DIAGNOSTIC_TEASER_VIEWED: "diagnostic_teaser_viewed",
  UNLOCK_CLICKED: "unlock_clicked",
  CHECKOUT_STARTED: "checkout_started",
  PAYMENT_CONFIRMED: "payment_confirmed",
  SUBSCRIPTION_STARTED: "subscription_started",
  SIGNUP_COMPLETED: "signup_completed",
  LEAD_CAPTURED: "lead_captured",
  TOOL_USED: "tool_used",
  CHECKOUT_FAILED: "checkout_failed",
  PIX_GENERATED: "pix_generated",
  SUBSCRIPTION_CONFIRMED: "subscription_confirmed",
} as const;

export type AnalyticsEvent = (typeof ANALYTICS_EVENTS)[keyof typeof ANALYTICS_EVENTS];

type PlausibleFn = (event: string, options?: { props?: Record<string, string | number | boolean> }) => void;

declare global {
  interface Window {
    plausible?: PlausibleFn;
  }
}

/** Registra um evento de funil. Seguro chamar no servidor ou sem provedor, vira no-op. */
export function track(event: AnalyticsEvent, props?: Record<string, string | number | boolean>) {
  if (typeof window === "undefined") return;
  try {
    window.plausible?.(event, props ? { props } : undefined);
    const body = JSON.stringify({
      name: event,
      path: window.location.pathname,
      properties: props ?? {},
      ...getStoredAttribution(),
    });
    if (navigator.sendBeacon) {
      navigator.sendBeacon("/api/analytics/event", new Blob([body], { type: "application/json" }));
    } else {
      void fetch("/api/analytics/event", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body,
        keepalive: true,
      });
    }
  } catch {
    // Nunca deixar analytics quebrar a UI.
  }
}

export type StoredAttribution = {
  sessionId: string;
  source: string;
  medium: string;
  campaign: string;
  content: string;
};

export function getStoredAttribution(): StoredAttribution {
  if (typeof window === "undefined") {
    return { sessionId: "", source: "", medium: "", campaign: "", content: "" };
  }
  try {
    const value = JSON.parse(localStorage.getItem("cm_attribution") ?? "{}") as Partial<StoredAttribution>;
    return {
      sessionId: value.sessionId ?? "",
      source: value.source ?? "",
      medium: value.medium ?? "",
      campaign: value.campaign ?? "",
      content: value.content ?? "",
    };
  } catch {
    return { sessionId: "", source: "", medium: "", campaign: "", content: "" };
  }
}
