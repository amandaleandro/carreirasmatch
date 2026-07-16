import type { MetadataRoute } from "next";
import { FREE_TOOL_PATHS } from "@/lib/tools-catalog";

const BASE_URL = (process.env.APP_URL ?? "https://carreirasmatch.com.br").replace(/\/$/, "");

/**
 * Libera o conteúdo público (landing, ferramentas, blog) e bloqueia áreas
 * logadas, endpoints de API e páginas de conta que não devem ser indexadas.
 *
 * O Mediapartners-Google (rastreador do AdSense) recebe uma regra própria: ele
 * precisa ler as páginas onde há anúncio para escolher anúncios relevantes, e
 * regras de `*` não valem para ele quando existe um bloco específico. A lista
 * cobre só onde há anúncio de fato (blog e guias) — as vagas ficam de fora
 * porque não exibem anúncio, ver src/lib/adsense.ts.
 */
export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: "Mediapartners-Google",
        allow: ["/blog", ...FREE_TOOL_PATHS],
        disallow: "/",
      },
      {
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
    ],
    sitemap: `${BASE_URL}/sitemap.xml`,
    host: BASE_URL,
  };
}
