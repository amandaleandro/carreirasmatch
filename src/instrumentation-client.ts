import { initSentry } from "@/lib/sentry-init";

// Inicializa o monitoramento de erros no browser (no-op sem NEXT_PUBLIC_SENTRY_DSN).
initSentry("client");
