import type { Page } from "playwright";
import { getSharedBrowser } from "./sigaa-browser";
import { parseSigaaCurriculum } from "./sigaa";
import { matchAreaSlug } from "@/lib/vocation-areas";
import { prisma } from "@/lib/prisma";
import { ScrapedUniversityCourse, UniversityScraper } from "./types";

const NAVIGATION_TIMEOUT_MS = 25_000;

// O cron de sync roda 3x/dia com orçamento de 5 minutos pra TODAS as fontes externas
// (vagas, cursos, cidades, universidades...), não só universidades. Buscar as grades de
// centenas de cursos de uma instituição inteira numa única execução estouraria esse
// orçamento e derrubaria os outros syncs que rodam em paralelo. Em vez disso, cada
// instituição avança alguns cursos novos/desatualizados por execução — ao longo de
// poucos dias (3 execuções/dia), o catálogo inteiro acaba sendo coberto.
const MAX_COURSES_PER_RUN = 2;
const STALE_AFTER_MS = 45 * 24 * 60 * 60 * 1000;

async function dismissCookieBanner(page: Page) {
  const banner = page.getByText("Ciente", { exact: true });
  if (await banner.count().catch(() => 0)) {
    await banner.first().click({ timeout: 3000 }).catch(() => {});
  }
}

type DiscoveredCourse = { id: string; title: string; city: string; modality: string };

/**
 * A busca de cursos do SIGAA (`curso/lista.jsf`) é um formulário: submetido em
 * branco, lista TODOS os cursos de graduação da instituição, com um link
 * `portal.jsf?id=<id>` por curso — o mesmo id usado em `curso/curriculo.jsf?id=`.
 */
async function discoverCourses(page: Page, domain: string): Promise<DiscoveredCourse[]> {
  const url = `https://${domain}/sigaa/public/curso/lista.jsf?nivel=G&aba=p-graduacao`;
  await page.goto(url, { waitUntil: "domcontentloaded", timeout: NAVIGATION_TIMEOUT_MS });
  await dismissCookieBanner(page);

  const submit = page.locator('input[type="submit"], button[type="submit"]').first();
  if (await submit.count()) {
    await Promise.all([
      page.waitForLoadState("networkidle", { timeout: NAVIGATION_TIMEOUT_MS }).catch(() => {}),
      submit.click(),
    ]);
  }
  await page.waitForTimeout(1500);

  return page.evaluate(() => {
    const normalize = (value: string) => value.normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLowerCase();
    // Algumas instituições (ex: UFRN) oferecem o mesmo título de curso em mais de um
    // grau (Bacharelado x Licenciatura) — anexa ao título quando encontrado, tanto
    // pra diferenciar pro usuário quanto pra evitar título/slug duplicado.
    const DEGREE_TYPES = ["BACHARELADO", "LICENCIATURA", "TECNÓLOGO", "TECNOLOGIA"];
    const results: { id: string; title: string; city: string; modality: string }[] = [];
    document.querySelectorAll('a[href*="portal.jsf?id="]').forEach((a) => {
      const href = a.getAttribute("href") || "";
      const idMatch = href.match(/id=(\d+)/);
      if (!idMatch) return;
      const row = a.closest("tr");
      if (!row) return;
      const cells = Array.from(row.querySelectorAll("td")).map((td) =>
        (td as HTMLElement).innerText.replace(/\s+/g, " ").trim()
      );
      const rawTitle = cells[0];
      if (!rawTitle) return;
      const city = cells[1] || "";
      const modality = cells.find((c) => {
        const normalized = normalize(c);
        return ["presencial", "a distancia", "semipresencial", "ead"].includes(normalized);
      }) || "Presencial";
      const degreeType = cells.find((c) => DEGREE_TYPES.includes(c.toUpperCase()));
      const title = degreeType ? `${rawTitle} (${degreeType[0]}${degreeType.slice(1).toLowerCase()})` : rawTitle;
      results.push({ id: idMatch[1], title, city, modality });
    });
    return results;
  });
}

async function fetchCourseSubjects(page: Page, url: string) {
  await page.goto(url, { waitUntil: "domcontentloaded", timeout: NAVIGATION_TIMEOUT_MS });
  await dismissCookieBanner(page);

  const viewLinks = page.locator([
    'a:has(img[src*="view.gif"])',
    'a:has(img[src*="visualizar"])',
    'a[title*="Visualizar"]',
    'a[title*="Detalhes"]',
    'a[href*="estrutura"]',
    'a[href*="curriculo"]',
  ].join(", "));
  const count = await viewLinks.count();
  if (count > 0) {
    const viewLink = viewLinks.nth(count - 1);
    await viewLink.scrollIntoViewIfNeeded();
    await viewLink.click({ timeout: NAVIGATION_TIMEOUT_MS, force: true });
    await page.waitForLoadState("networkidle").catch(() => {});
  }

  const html = await page.content();
  return parseSigaaCurriculum(html);
}

export interface SigaaInstitutionConfig {
  universityName: string;
  city: string;
  state: string;
  website: string;
  /** Domínio do SIGAA da instituição, ex: "sigaa.ufrn.br". */
  domain: string;
}

/**
 * Ao contrário de `createSigaaCourseScraper`/`createSigaaBrowserCourseScraper` (um
 * curso cadastrado manualmente por vez, com URL/id encontrados à mão), este scraper
 * descobre sozinho todos os cursos de graduação presenciais da instituição e avança
 * a busca das grades curriculares aos poucos, execução após execução.
 */
export function createSigaaInstitutionScraper(config: SigaaInstitutionConfig): UniversityScraper {
  return {
    universityName: config.universityName,
    city: config.city,
    state: config.state,
    website: config.website,
    async scrape(): Promise<ScrapedUniversityCourse[]> {
      const browser = await getSharedBrowser();
      const listPage = await browser.newPage();
      let discovered: DiscoveredCourse[];
      try {
        discovered = await discoverCourses(listPage, config.domain);
      } finally {
        await listPage.close();
      }
      if (discovered.length === 0) return [];

      const urlPrefix = `https://${config.domain}/sigaa/public/curso/curriculo.jsf?lc=pt_BR&id=`;
      const existing = await prisma.universityCourse.findMany({
        where: { url: { startsWith: urlPrefix } },
        select: { url: true, lastSeenAt: true },
      });
      const lastSeenByUrl = new Map(existing.map((c) => [c.url, c.lastSeenAt.getTime()]));
      const now = Date.now();

      const pending = discovered
        .filter((c) => !/a\s*dist[aâ]ncia|ead|semipresencial/i.test(c.modality))
        .map((c) => ({ ...c, url: `${urlPrefix}${c.id}` }))
        .filter((c) => {
          const lastSeen = lastSeenByUrl.get(c.url);
          return !lastSeen || now - lastSeen > STALE_AFTER_MS;
        })
        .slice(0, MAX_COURSES_PER_RUN);

      const results: ScrapedUniversityCourse[] = [];
      for (const course of pending) {
        const context = await browser.newContext();
        const page = await context.newPage();
        try {
          const subjects = await fetchCourseSubjects(page, course.url);
          if (subjects.length > 0) {
            results.push({
              title: course.title,
              url: course.url,
              area: matchAreaSlug(course.title) ?? "geral",
              modality: "presencial",
              subjects,
            });
          }
        } catch (error) {
          console.error(`[sigaa-institution] Erro ao buscar grade de "${course.title}" (${config.universityName}):`, error);
        } finally {
          await context.close();
        }
      }
      return results;
    },
  };
}
