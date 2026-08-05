import type { MetadataRoute } from "next";
import { prisma } from "@/lib/prisma";
import { PUBLIC_JOB_CATEGORIES } from "@/lib/public-job-categories";
import { locationSlug } from "@/lib/location-slug";
import { FREE_TOOL_PATHS } from "@/lib/tools-catalog";
import { VOCATION_AREAS } from "@/lib/vocation-areas";

const BASE_URL = (process.env.APP_URL ?? "https://carreirasmatch.com.br").replace(/\/$/, "");

// Gerado a cada requisição: no build do Docker o banco não está acessível, então
// se o sitemap fosse estático os posts e as páginas de localização (ambos vindos
// do banco) sairiam vazios e o Google nunca os descobriria. force-dynamic garante
// que a query rode em runtime, com o banco no ar.
export const dynamic = "force-dynamic";

// Ferramentas realmente públicas (as demais /tools/* exigem assinatura por
// design, não entram no sitemap para não apontar a crawler para páginas que
// redirecionam ao login/upgrade). vocation-test é liberado em auth.config.ts;
// os guias abertos vêm da flag `free` do catálogo (FREE_TOOL_PATHS); antes
// ficavam de fora do sitemap e o Google não os descobria.
const PUBLIC_TOOL_PATHS = Array.from(
  new Set([
    "/tools/vocation-test",
    "/tools/vocation-test/discover",
    ...FREE_TOOL_PATHS,
  ]),
);

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
    { url: `${BASE_URL}/estagio`, lastModified: now, changeFrequency: "weekly", priority: 0.9 },
    { url: `${BASE_URL}/jovem-aprendiz`, lastModified: now, changeFrequency: "weekly", priority: 0.9 },
    { url: `${BASE_URL}/primeiro-emprego`, lastModified: now, changeFrequency: "weekly", priority: 0.9 },
    { url: `${BASE_URL}/faculdade-ou-tecnico`, lastModified: now, changeFrequency: "weekly", priority: 0.8 },
    { url: `${BASE_URL}/concurso`, lastModified: now, changeFrequency: "weekly", priority: 0.8 },
    { url: `${BASE_URL}/oab`, lastModified: now, changeFrequency: "weekly", priority: 0.8 },
    { url: `${BASE_URL}/recolocacao`, lastModified: now, changeFrequency: "weekly", priority: 0.9 },
    { url: `${BASE_URL}/transicao`, lastModified: now, changeFrequency: "weekly", priority: 0.9 },
    { url: `${BASE_URL}/curriculo-gratis`, lastModified: now, changeFrequency: "monthly", priority: 0.9 },
    { url: `${BASE_URL}/como-fazer-curriculo`, lastModified: now, changeFrequency: "monthly", priority: 0.8 },
    { url: `${BASE_URL}/curriculo-sem-experiencia`, lastModified: now, changeFrequency: "monthly", priority: 0.8 },
    { url: `${BASE_URL}/gratuito`, lastModified: now, changeFrequency: "weekly", priority: 0.9 },
    { url: `${BASE_URL}/vagas-de-hoje`, lastModified: now, changeFrequency: "daily", priority: 0.9 },
    { url: `${BASE_URL}/vagas-publicas`, lastModified: now, changeFrequency: "daily", priority: 0.8 },
    { url: `${BASE_URL}/cursos-gratuitos`, lastModified: now, changeFrequency: "daily", priority: 0.8 },
    { url: `${BASE_URL}/mercado-de-trabalho`, lastModified: now, changeFrequency: "daily", priority: 0.7 },
    { url: `${BASE_URL}/freelancers`, lastModified: now, changeFrequency: "daily", priority: 0.9 },
    { url: `${BASE_URL}/empresas`, lastModified: now, changeFrequency: "weekly", priority: 0.9 },
    { url: `${BASE_URL}/parceiro`, lastModified: now, changeFrequency: "weekly", priority: 0.9 },
    { url: `${BASE_URL}/parceiros`, lastModified: now, changeFrequency: "monthly", priority: 0.5 },
    { url: `${BASE_URL}/projetos`, lastModified: now, changeFrequency: "daily", priority: 0.8 },
    { url: `${BASE_URL}/analise`, lastModified: now, changeFrequency: "monthly", priority: 0.8 },
    { url: `${BASE_URL}/teste-curriculo-ats`, lastModified: now, changeFrequency: "monthly", priority: 0.9 },
    { url: `${BASE_URL}/nota-do-curriculo`, lastModified: now, changeFrequency: "monthly", priority: 0.9 },
    { url: `${BASE_URL}/insights`, lastModified: now, changeFrequency: "weekly", priority: 0.7 },
    { url: `${BASE_URL}/assinar`, lastModified: now, changeFrequency: "monthly", priority: 0.7 },
    { url: `${BASE_URL}/blog`, lastModified: now, changeFrequency: "daily", priority: 0.8 },
    { url: `${BASE_URL}/sobre`, lastModified: now, changeFrequency: "yearly", priority: 0.4 },
    { url: `${BASE_URL}/ajuda`, lastModified: now, changeFrequency: "monthly", priority: 0.4 },
    { url: `${BASE_URL}/contato`, lastModified: now, changeFrequency: "yearly", priority: 0.3 },
    { url: `${BASE_URL}/termos`, lastModified: now, changeFrequency: "yearly", priority: 0.2 },
    { url: `${BASE_URL}/privacidade`, lastModified: now, changeFrequency: "yearly", priority: 0.2 },
  ];

  const toolRoutes: MetadataRoute.Sitemap = PUBLIC_TOOL_PATHS.map((path) => ({
    url: `${BASE_URL}${path}`,
    lastModified: now,
    changeFrequency: "monthly",
    priority: 0.7,
  }));

  // Landings programáticas de análise por área profissional (SEO).
  const analysisAreaRoutes: MetadataRoute.Sitemap = VOCATION_AREAS.map((area) => ({
    url: `${BASE_URL}/analise/${area.slug}`,
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
  let blogAreaRoutes: MetadataRoute.Sitemap = [];
  try {
    const posts = await prisma.post.findMany({
      where: { published: true },
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

    // Páginas pilar por área, só para áreas que já têm post publicado
    // (evita indexar página pilar vazia).
    const areaRows = await prisma.post.groupBy({
      by: ["areaSlug"],
      where: { published: true },
      _max: { publishedAt: true },
    });
    blogAreaRoutes = areaRows.map((row) => ({
      url: `${BASE_URL}/blog/area/${row.areaSlug}`,
      lastModified: row._max.publishedAt ?? now,
      changeFrequency: "weekly",
      priority: 0.7,
    }));
  } catch (error) {
    // Se o banco não estiver acessível no build, o sitemap ainda sai com o resto,
    // mas loga pra não sumir posts do Google sem ninguém perceber.
    console.error("[sitemap] falha ao buscar posts do blog", error);
    postRoutes = [];
    blogAreaRoutes = [];
  }

  let locationRoutes: MetadataRoute.Sitemap = [];
  try {
    const jobLocations = await prisma.publicOpportunity.findMany({
      where: { active: true, city: { not: "" }, state: { not: "" } },
      distinct: ["state", "city"],
      select: { state: true, city: true, updatedAt: true },
      take: 5000,
    });
    const courseLocations = await prisma.externalCourse.findMany({
      where: { active: true, free: true, city: { not: "" }, state: { not: "" } },
      distinct: ["state", "city"],
      select: { state: true, city: true, updatedAt: true },
      take: 5000,
    });
    locationRoutes = [
      ...jobLocations.flatMap((location) => {
        const path = `${location.state.toLowerCase()}/${locationSlug(location.city)}`;
        return [{ url: `${BASE_URL}/vagas-publicas/${path}`, lastModified: location.updatedAt, changeFrequency: "daily" as const, priority: 0.7 }];
      }),
      ...courseLocations.flatMap((location) => {
        const path = `${location.state.toLowerCase()}/${locationSlug(location.city)}`;
        return [{ url: `${BASE_URL}/cursos-gratuitos/${path}`, lastModified: location.updatedAt, changeFrequency: "weekly" as const, priority: 0.6 }];
      }),
    ];
  } catch (error) {
    console.error("[sitemap] falha ao buscar rotas de localização", error);
    locationRoutes = [];
  }

  return [...staticRoutes, ...toolRoutes, ...analysisAreaRoutes, ...publicJobRoutes, ...locationRoutes, ...blogAreaRoutes, ...postRoutes];
}
