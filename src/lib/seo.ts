/**
 * Ponto único de verdade para SEO. A URL base segue o mesmo padrão de
 * robots.ts/sitemap.ts (env APP_URL com fallback para o domínio de prod).
 */
export const SITE_NAME = "CarreirasMatch";

export const BASE_URL = (process.env.APP_URL ?? "https://carreirasmatch.com.br").replace(/\/$/, "");

/** Transforma um caminho relativo ("/blog/x") em URL absoluta para dados estruturados. */
export function absoluteUrl(path = "/"): string {
  return `${BASE_URL}${path.startsWith("/") ? path : `/${path}`}`;
}

/**
 * Dados estruturados da organização (Google Rich Results). Vai uma única vez no
 * layout raiz, então vale para todas as páginas do site.
 */
export function organizationJsonLd() {
  return {
    "@context": "https://schema.org",
    "@type": "Organization",
    name: SITE_NAME,
    url: BASE_URL,
    logo: absoluteUrl("/logos/icon-light.png"),
    description:
      "Copiloto de carreira que compara currículo e vaga, mostra as lacunas que mais importam e transforma o diagnóstico em ações.",
  };
}

/** WebSite + SearchAction, ajuda o Google a exibir a sitelinks search box. */
export function webSiteJsonLd() {
  return {
    "@context": "https://schema.org",
    "@type": "WebSite",
    name: SITE_NAME,
    url: BASE_URL,
  };
}

/** BreadcrumbList a partir de pares [nome, caminho]. */
export function breadcrumbJsonLd(items: { name: string; path: string }[]) {
  return {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: items.map((item, index) => ({
      "@type": "ListItem",
      position: index + 1,
      name: item.name,
      item: absoluteUrl(item.path),
    })),
  };
}

/** BlogPosting para posts do blog. */
export function articleJsonLd(params: {
  title: string;
  description: string;
  path: string;
  publishedAt: Date;
  updatedAt?: Date;
}) {
  return {
    "@context": "https://schema.org",
    "@type": "BlogPosting",
    headline: params.title,
    description: params.description,
    url: absoluteUrl(params.path),
    mainEntityOfPage: absoluteUrl(params.path),
    datePublished: params.publishedAt.toISOString(),
    dateModified: (params.updatedAt ?? params.publishedAt).toISOString(),
    author: { "@type": "Organization", name: SITE_NAME, url: BASE_URL },
    publisher: {
      "@type": "Organization",
      name: SITE_NAME,
      logo: { "@type": "ImageObject", url: absoluteUrl("/logos/icon-light.png") },
    },
  };
}
