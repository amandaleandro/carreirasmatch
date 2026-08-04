import * as cheerio from "cheerio";
import { PDFParse } from "pdf-parse";
import { matchAreaSlug } from "@/lib/vocation-areas";
import { prisma } from "@/lib/prisma";
import { parseFacomPdfSubjects } from "./facom";
import { ScrapedUniversityCourse, UniversityScraper } from "./types";

const USER_AGENT = "Mozilla/5.0 (compatible; CarreirasMatchUniversityBot/1.0)";
const REQUEST_TIMEOUT_MS = 30_000;
const MAX_COURSES_PER_RUN = 8;
const STALE_AFTER_MS = 45 * 24 * 60 * 60 * 1000;
const CATALOG_URL = "https://ufu.br/graduacao?page=";

async function getHtml(url: string) {
  const response = await fetch(url, {
    headers: { "User-Agent": USER_AGENT, Accept: "text/html,application/xhtml+xml" },
    signal: AbortSignal.timeout(REQUEST_TIMEOUT_MS),
  });
  if (!response.ok) throw new Error(`HTTP ${response.status} para ${url}`);
  return response.text();
}

function absoluteUrl(value: string, base: string) {
  try {
    return new URL(value, base).toString();
  } catch {
    return "";
  }
}

type UfuCoursePage = { title: string; pageUrl: string };

async function discoverUfuCourses(): Promise<UfuCoursePage[]> {
  const courses = new Map<string, UfuCoursePage>();
  // O catálogo tem paginação e pode crescer; paramos quando uma página não
  // trouxer novos links de graduação.
  for (let page = 0; page < 20; page += 1) {
    const pageUrl = `${CATALOG_URL}${page}`;
    const html = await getHtml(pageUrl);
    const $ = cheerio.load(html);
    let foundOnPage = 0;
    $("a[href]").each((_, element) => {
      const href = absoluteUrl($(element).attr("href") ?? "", pageUrl);
      const label = $(element).text().replace(/\s+/g, " ").trim();
      if (!href || !/\.ufu\.br\/|^https:\/\/ufu\.br\//i.test(href)) return;
      if (!label || /^(p[aá]gina|pr[oó]xima|[úu]ltima|avan[cç]ar|voltar)$/i.test(label)) return;
      if (href.includes("/graduacao?page=") || href === "https://ufu.br/graduacao") return;
      // O catálogo oficial mistura links de cursos e links institucionais;
      // cursos sempre apontam para uma unidade acadêmica ou para o portal do curso.
      if (!/ufu\.br\/(?:graduacao|www\.)/i.test(href) && !/\.(?:fagen|facom|famed|facic|famat|famev|faued|fadir|faced|iciag|incis|ifilo|ileel|ime|ief|feelt|fagmu|faps|facip)\.ufu\.br/i.test(href)) return;
      if (!/gradua[cç][aã]o|bacharelado|licenciatura|administra[cç][aã]o|medicina|enfermagem|ci[eê]ncia|engenharia|direito|cont[aá]beis|comput[aá]ção/i.test(`${label} ${href}`)) return;
      if (!courses.has(href)) {
        courses.set(href, { title: label, pageUrl: href });
        foundOnPage += 1;
      }
    });
    if (foundOnPage === 0 && page > 0) break;
  }
  return Array.from(courses.values());
}

async function findGradePdf(coursePage: UfuCoursePage): Promise<{ url: string; title: string } | null> {
  const html = await getHtml(coursePage.pageUrl);
  const $ = cheerio.load(html);
  const title = $("h1").first().text().replace(/\s+/g, " ").trim() || coursePage.title;
  const candidates = $("a[href]")
    .map((_, element) => ({
      url: absoluteUrl($(element).attr("href") ?? "", coursePage.pageUrl),
      label: $(element).text().replace(/\s+/g, " ").trim(),
    }))
    .get()
    .filter((link) => link.url && (/\.pdf(?:$|\?)/i.test(link.url) || /grade|curr[ií]cul|fluxo/i.test(link.url)))
    .sort((a, b) => {
      const score = (value: { url: string; label: string }) =>
        (/\.pdf(?:$|\?)/i.test(value.url) ? 4 : 0) + (/grade|curr[ií]cul|fluxo/i.test(`${value.url} ${value.label}`) ? 8 : 0);
      return score(b) - score(a);
    });

  for (const candidate of candidates) {
    if (/\.pdf(?:$|\?)/i.test(candidate.url)) return { url: candidate.url, title };
    try {
      const gradeHtml = await getHtml(candidate.url);
      const grade$ = cheerio.load(gradeHtml);
      const pdf = grade$("a[href]")
        .map((_, element) => absoluteUrl(grade$(element).attr("href") ?? "", candidate.url))
        .get()
        .find((url) => /\.pdf(?:$|\?)/i.test(url));
      if (pdf) return { url: pdf, title };
    } catch (error) {
      console.warn(`[ufu-scraper] Não foi possível abrir a página de grade ${candidate.url}:`, error);
    }
  }
  return null;
}

async function readPdf(url: string) {
  const response = await fetch(url, {
    headers: { "User-Agent": USER_AGENT, Accept: "application/pdf" },
    signal: AbortSignal.timeout(REQUEST_TIMEOUT_MS),
  });
  if (!response.ok) throw new Error(`HTTP ${response.status} para ${url}`);
  const parser = new PDFParse({ data: Buffer.from(await response.arrayBuffer()) });
  try {
    return parseFacomPdfSubjects((await parser.getText()).text);
  } finally {
    await parser.destroy();
  }
}

export function createUfuCatalogScraper(): UniversityScraper {
  return {
    universityName: "Universidade Federal de Uberlândia",
    city: "Uberlândia",
    state: "MG",
    website: "https://ufu.br",
    source: "ufu:catalog",
    async scrape(): Promise<ScrapedUniversityCourse[]> {
      const discovered = await discoverUfuCourses();
      const existing = await prisma.universityCourse.findMany({
        select: { url: true, lastSeenAt: true },
      });
      const lastSeenByUrl = new Map(existing.map((course) => [course.url, course.lastSeenAt.getTime()]));
      const now = Date.now();
      const pending = discovered
        .filter((course) => {
          const lastSeen = lastSeenByUrl.get(course.pageUrl);
          return !lastSeen || now - lastSeen > STALE_AFTER_MS;
        })
        .slice(0, MAX_COURSES_PER_RUN);
      const result: ScrapedUniversityCourse[] = [];

      for (const course of pending) {
        try {
          const grade = await findGradePdf(course);
          if (!grade) continue;
          const subjects = await readPdf(grade.url);
          if (subjects.length === 0) continue;
          result.push({
            title: grade.title,
            url: grade.url,
            area: matchAreaSlug(grade.title) ?? "geral",
            modality: "presencial",
            subjects,
          });
        } catch (error) {
          console.error(`[ufu-scraper] Erro ao raspar ${course.pageUrl}:`, error);
        }
      }
      return result;
    },
  };
}
