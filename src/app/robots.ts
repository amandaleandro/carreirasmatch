import type { MetadataRoute } from "next";

const BASE_URL = (process.env.APP_URL ?? "https://carreirasmatch.com.br").replace(/\/$/, "");

/**
 * Libera o conteúdo público (landing, ferramentas, blog) e bloqueia áreas
 * logadas, endpoints de API e páginas de conta que não devem ser indexadas.
 */
export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: "*",
      allow: "/",
      disallow: [
        "/api/",
        "/admin",
        "/dashboard",
        "/settings",
        "/report",
        "/resume",
        "/history",
        "/applications",
        "/interviews",
        "/action-plan",
        "/profile",
        "/feed",
        "/redefinir-senha",
        "/esqueci-senha",
      ],
    },
    sitemap: `${BASE_URL}/sitemap.xml`,
    host: BASE_URL,
  };
}
