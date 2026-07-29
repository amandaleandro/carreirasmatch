import { initSentry } from "@/lib/sentry-init";
import { initPostHog } from "@/lib/posthog-init";
import { initFormbricks } from "@/lib/formbricks-init";

// Inicializa o monitoramento de erros no browser (no-op sem NEXT_PUBLIC_SENTRY_DSN).
initSentry("client");

// Inicializa o PostHog no browser (configuração pública via ambiente).
initPostHog();

// Inicializa o Formbricks (pesquisas in-app) no browser.
initFormbricks();
