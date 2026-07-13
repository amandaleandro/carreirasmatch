import * as Sentry from "@sentry/nextjs";

/**
 * Inicializa o Sentry apenas quando um DSN está configurado. Sem DSN (dev ou
 * ambiente sem monitoramento), tudo vira no-op, nenhum evento é enviado.
 *
 * Não usamos o plugin de build do Sentry (withSentryConfig) de propósito, para
 * não alterar o pipeline de build de produção deste Next customizado. Isso
 * significa: captura de erros em runtime funciona; upload automático de
 * source maps não (stack traces vêm minificadas até configurarem isso depois).
 */
export function initSentry(runtime: "server" | "client") {
  const dsn =
    runtime === "client"
      ? process.env.NEXT_PUBLIC_SENTRY_DSN
      : process.env.SENTRY_DSN ?? process.env.NEXT_PUBLIC_SENTRY_DSN;

  if (!dsn) return;

  Sentry.init({
    dsn,
    environment: process.env.NODE_ENV,
    tracesSampleRate: Number(process.env.SENTRY_TRACES_SAMPLE_RATE ?? 0),
    enabled: process.env.NODE_ENV === "production",
  });
}
