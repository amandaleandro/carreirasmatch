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
  LANDING_CTA_CLICKED: "landing_cta_clicked",
  RESUME_UPLOADED: "resume_uploaded",
  ANALYSIS_STARTED: "analysis_started",
  ANALYSIS_COMPLETED: "analysis_completed",
  ANALYSIS_FAILED: "analysis_failed",
  ANALYSIS_REANALYZED: "analysis_reanalyzed",
  DIAGNOSTIC_TEASER_VIEWED: "diagnostic_teaser_viewed",
  PAYWALL_DWELL_TIME: "paywall_dwell_time",
  PAYWALL_PREVIEW_CLICKED: "paywall_preview_clicked",
  UNLOCK_CLICKED: "unlock_clicked",
  CHECKOUT_STARTED: "checkout_started",
  CHECKOUT_DISMISSED: "checkout_dismissed",
  PAYMENT_METHOD_SELECTED: "payment_method_selected",
  PAYMENT_CONFIRMED: "payment_confirmed",
  SUBSCRIPTION_STARTED: "subscription_started",
  SIGNUP_COMPLETED: "signup_completed",
  ONBOARDING_COMPLETED: "onboarding_completed",
  LEAD_CAPTURED: "lead_captured",
  TOOL_USED: "tool_used",
  CHECKOUT_FAILED: "checkout_failed",
  PIX_GENERATED: "pix_generated",
  SUBSCRIPTION_CONFIRMED: "subscription_confirmed",
  INTERVIEW_SIMULATOR_STARTED: "interview_simulator_started",
  INTERVIEW_PRACTICED: "interview_practiced",
  BEHAVIORAL_TEST_COMPLETED: "behavioral_test_completed",
  RESUME_SAVED: "resume_saved",
  APPLICATION_CREATED: "application_created",
  RESULT_VIEWED: "result_viewed",
  CARD_SHARED: "card_shared",
  JOB_ALERT_CREATED: "job_alert_created",
  JOB_ALERT_DELETED: "job_alert_deleted",
  PARTNER_SUBMISSION_SENT: "partner_submission_sent",
  COMPANY_JOB_CREATED: "company_job_created",
  FREELANCE_PROPOSAL_SUBMITTED: "freelance_proposal_submitted",
  LANDING_VIEWED: "landing_viewed",
  JOB_DESCRIPTION_ADDED: "job_description_added",
  SCORE_VIEWED: "score_viewed",
  RECOMMENDATION_CLICKED: "recommendation_clicked",
  SHARE_CARD_GENERATED: "share_card_generated",
  REFERRAL_LINK_OPENED: "referral_link_opened",
  SECOND_ANALYSIS_STARTED: "second_analysis_started",
  SURVEY_RESPONDED: "survey_responded",
  // Métricas de impacto: o usuário avançou de fato na carreira, não só usou o
  // produto. É a "métrica norte" do Plano Mestre 2026 — sem isso não dá pra medir
  // se a plataforma está cumprindo a promessa, só o quanto é usada.
  INTERVIEW_REPORTED: "interview_reported",
  JOB_REPORTED: "job_reported",
  INTERNSHIP_REPORTED: "internship_reported",
  PROMOTION_REPORTED: "promotion_reported",
} as const;

export type AnalyticsEvent = (typeof ANALYTICS_EVENTS)[keyof typeof ANALYTICS_EVENTS];

type PlausibleFn = (event: string, options?: { props?: Record<string, string | number | boolean> }) => void;
type FbqFn = (type: string, eventName: string, params?: Record<string, unknown>) => void;
type LintrkFn = (action: string, data: { conversion_id?: number | string }) => void;
type GtagFn = (command: string, targetId: string, params?: Record<string, unknown>) => void;

type PostHogFn = {
  capture: (event: string, props?: Record<string, unknown>) => void;
  identify: (distinctId: string, properties?: Record<string, unknown>) => void;
  reset: () => void;
};

declare global {
  interface Window {
    plausible?: PlausibleFn;
    fbq?: FbqFn;
    lintrk?: LintrkFn;
    gtag?: GtagFn;
    posthog?: PostHogFn;
  }
}

/** Limpa a identidade persistida ao encerrar a sessão, preservando o próximo visitante como anônimo. */
export function resetPostHog() {
  if (typeof window === "undefined") return;
  window.posthog?.reset();
}

/** Registra um evento de funil. Seguro chamar no servidor ou sem provedor, vira no-op. */
export function track(event: AnalyticsEvent, props?: Record<string, string | number | boolean>) {
  if (typeof window === "undefined") return;
  try {
    // 1. Plausible Analytics
    window.plausible?.(event, props ? { props } : undefined);

    // 2. Meta Pixel (Facebook & Instagram Ads)
    if (typeof window.fbq === "function") {
      switch (event) {
        case ANALYTICS_EVENTS.SIGNUP_COMPLETED:
          window.fbq("track", "CompleteRegistration");
          break;
        case ANALYTICS_EVENTS.ANALYSIS_STARTED:
          window.fbq("track", "Lead", { content_name: "analysis" });
          break;
        case ANALYTICS_EVENTS.CHECKOUT_STARTED:
          window.fbq("track", "InitiateCheckout");
          break;
        case ANALYTICS_EVENTS.PAYMENT_CONFIRMED:
        case ANALYTICS_EVENTS.SUBSCRIPTION_CONFIRMED:
          window.fbq("track", "Purchase", {
            currency: "BRL",
            value: typeof props?.value === "number" ? props.value : 0,
          });
          break;
        default:
          window.fbq("trackCustom", event, props ?? {});
          break;
      }
    }

    // 3. LinkedIn Insight Tag
    if (typeof window.lintrk === "function") {
      window.lintrk("track", { conversion_id: event });
    }

    // 4. Google Ads / GA4
    if (typeof window.gtag === "function") {
      window.gtag("event", event, props ?? {});
    }

    // 5. PostHog (funil/eventos por usuário, roda em paralelo ao Plausible)
    window.posthog?.capture(event, props);

    // 6. Backend Event Logging
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
