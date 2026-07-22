import type { MetadataRoute } from "next";

const BASE_URL = (process.env.APP_URL ?? "https://carreirasmatch.com.br").replace(/\/$/, "");

/**
 * Libera o conteúdo público (landing, ferramentas, blog) e bloqueia áreas
 * logadas, endpoints de API e páginas de conta que não devem ser indexadas.
 *
 * As mesmas páginas liberadas para indexação valem para o Mediapartners-Google
 * (rastreador do AdSense): mesmo anúncio só rodando em blog/guias hoje (ver
 * src/lib/adsense.ts), a revisão de conta do AdSense avalia o site como um
 * todo, não só as páginas com unidade de anúncio - então ele precisa enxergar
 * home, sobre, contato, termos e privacidade também.
 */
const DISALLOW = [
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
];

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: "Mediapartners-Google",
        allow: "/",
        disallow: DISALLOW,
      },
      {
        userAgent: "*",
        allow: "/",
        disallow: DISALLOW,
      },
    ],
    sitemap: `${BASE_URL}/sitemap.xml`,
    host: BASE_URL,
  };
}
