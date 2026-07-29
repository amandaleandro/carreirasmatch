import formbricks from "@formbricks/js";

/**
 * Inicializa o Formbricks (cloud) uma única vez no browser, no mesmo padrão do
 * PostHog (src/lib/posthog-init.ts): sem env configurada, produção fica no-op
 * e desenvolvimento avisa com um erro acionável.
 *
 * Formbricks dispara pesquisas in-app (ex: "o que impediu você de terminar a
 * análise?") segmentadas por página/evento, configuradas no painel cloud —
 * não precisa de código extra aqui além do init.
 */
export function initFormbricks() {
  const environmentId = process.env.NEXT_PUBLIC_FORMBRICKS_ENVIRONMENT_ID;
  const appUrl = process.env.NEXT_PUBLIC_FORMBRICKS_APP_URL ?? "https://app.formbricks.com";

  if (!environmentId) {
    if (process.env.NODE_ENV !== "production") {
      throw new Error(
        "NEXT_PUBLIC_FORMBRICKS_ENVIRONMENT_ID variable required by Formbricks is missing or un-configured, this causes surveys to be silently disabled. This error stops appearing once NEXT_PUBLIC_FORMBRICKS_ENVIRONMENT_ID is configured",
      );
    }
    return;
  }

  function start() {
    void formbricks.setup({
      environmentId: environmentId!,
      appUrl,
    });
  }

  // Mesmo motivo do PostHog: adiar para depois do load evita corrida com o
  // script "theme-initializer" (beforeInteractive) do layout.tsx.
  if (document.readyState === "complete") {
    start();
  } else {
    window.addEventListener("load", start, { once: true });
  }
}
