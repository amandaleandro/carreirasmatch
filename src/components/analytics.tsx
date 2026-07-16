import Script from "next/script";

/**
 * Carrega o Plausible Analytics apenas quando NEXT_PUBLIC_PLAUSIBLE_DOMAIN está
 * definido. Sem essa env var, nada é carregado (dev fica limpo e não exige
 * banner de cookies, já que o Plausible é sem cookies / privacy-first).
 *
 * `script.tagged-events.js` habilita eventos customizados via window.plausible()
 *, ver src/lib/analytics.ts.
 */
export function Analytics() {
  const domain = process.env.NEXT_PUBLIC_PLAUSIBLE_DOMAIN;
  const src = process.env.NEXT_PUBLIC_PLAUSIBLE_SRC || "https://plausible.io/js/script.tagged-events.js";

  if (!domain) return null;

  return <Script defer data-domain={domain} src={src} strategy="afterInteractive" />;
}
