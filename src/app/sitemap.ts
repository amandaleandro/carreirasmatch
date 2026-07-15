import type { MetadataRoute } from "next";
import { prisma } from "@/lib/prisma";
import { PUBLIC_JOB_CATEGORIES } from "@/lib/public-job-categories";
import { FREE_TOOL_PATHS } from "@/lib/tools-catalog";

const BASE_URL = (process.env.APP_URL ?? "https://carreirasmatch.com.br").replace(/\/$/, "");

// Ferramentas realmente públicas (as demais /tools/* exigem assinatura por
// design, não entram no sitemap para não apontar a crawler para páginas que
// redirecionam ao login/upgrade). vocation-test é liberado em auth.config.ts;
// os guias abertos vêm da flag `free` do catálogo.
const PUBLIC_TOOL_PATHS = [
  "/tools/vocation-test",
  "/tools/vocation-test/discover",
  "/tools/vocation-test/college",
  ...FREE_TOOL_PATHS,
];

/**
 * Sitemap para os crawlers. Cobre só as páginas públicas/indexáveis, landing,
 * institucional, ferramentas gratuitas e posts do blog. Áreas logadas e
 * ferramentas por assinatura ficam de fora de propósito (ver app/robots.ts).
 */
export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const now = new Date();

  const staticRoutes: MetadataRoute.Sitemap = [
    { url: `${BASE_URL}/`, lastModified: now, changeFrequency: "weekly", priority: 1 },
    { url: `${BASE_URL}/comece`, lastModified: now, changeFrequency: "weekly", priority: 0.9 },
    { url: `${BASE_URL}/curriculo-gratis`, lastModified: now, changeFrequency: "monthly", priority: 0.9 },
    { url: `${BASE_URL}/vagas-de-hoje`, lastModified: now, changeFrequency: "daily", priority: 0.9 },
    { url: `${BASE_URL}/analise`, lastModified: now, changeFrequency: "monthly", priority: 0.8 },
    { url: `${BASE_URL}/assinar`, lastModified: now, changeFrequency: "monthly", priority: 0.7 },
    { url: `${BASE_URL}/blog`, lastModified: now, changeFrequency: "daily", priority: 0.8 },
    { url: `${BASE_URL}/sobre`, lastModified: now, changeFrequency: "yearly", priority: 0.4 },
    { url: `${BASE_URL}/ajuda`, lastModified: now, changeFrequency: "monthly", priority: 0.4 },
    { url: `${BASE_URL}/contato`, lastModified: now, changeFrequency: "yearly", priority: 0.3 },
    { url: `${BASE_URL}/termos`, lastModified: now, changeFrequency: "yearly", priority: 0.2 },
    { url: `${BASE_URL}/privacidade`, lastModified: now, changeFrequency: "yearly", priority: 0.2 },
    { url: `${BASE_URL}/login`, lastModified: now, changeFrequency: "yearly", priority: 0.2 },
    { url: `${BASE_URL}/register`, lastModified: now, changeFrequency: "yearly", priority: 0.3 },
  ];

  const toolRoutes: MetadataRoute.Sitemap = PUBLIC_TOOL_PATHS.map((path) => ({
    url: `${BASE_URL}${path}`,
    lastModified: now,
    changeFrequency: "monthly",
    priority: 0.7,
  }));

  const publicJobRoutes: MetadataRoute.Sitemap = PUBLIC_JOB_CATEGORIES.map((category) => ({
    url: `${BASE_URL}/vagas/${category.slug}`,
    lastModified: now,
    changeFrequency: "daily",
    priority: category.slug === "sem-experiencia" ? 0.9 : 0.8,
  }));

  let postRoutes: MetadataRoute.Sitemap = [];
  try {
    const posts = await prisma.post.findMany({
      select: { slug: true, publishedAt: true },
      orderBy: { publishedAt: "desc" },
      take: 5000,
    });
    postRoutes = posts.map((post) => ({
      url: `${BASE_URL}/blog/${post.slug}`,
      lastModified: post.publishedAt,
      changeFrequency: "monthly",
      priority: 0.6,
    }));
  } catch {
    // Se o banco não estiver acessível no build, o sitemap ainda sai com o resto.
    postRoutes = [];
  }

  return [...staticRoutes, ...toolRoutes, ...publicJobRoutes, ...postRoutes];
}
