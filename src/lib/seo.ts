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
      "O copiloto da sua carreira inteira: escolha de profissão, estudos para concurso e vestibular, estágio, primeiro emprego, recolocação, transição de carreira e trabalho freelancer, tudo com apoio de inteligência artificial.",
  };
}

/** SoftwareApplication: descreve o produto para buscadores e LLMs (ex.: ChatGPT Search). */
export function softwareApplicationJsonLd() {
  return {
    "@context": "https://schema.org",
    "@type": "SoftwareApplication",
    name: SITE_NAME,
    applicationCategory: "BusinessApplication",
    operatingSystem: "Web",
    url: BASE_URL,
    description:
      "Copiloto de carreira que acompanha cada etapa: teste vocacional, radar de concurso e vestibular, comparação de currículo com vaga real, candidatura automática, marketplace freelancer e preparação para entrevista.",
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

/** FAQPage: elegível a rich result de perguntas no Google. */
export function faqJsonLd(items: { question: string; answer: string }[]) {
  return {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: items.map((item) => ({
      "@type": "Question",
      name: item.question,
      acceptedAnswer: { "@type": "Answer", text: item.answer },
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
    image: absoluteUrl(`${params.path}/opengraph-image`),
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
