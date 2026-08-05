import * as cheerio from "cheerio";
import { PDFParse } from "pdf-parse";
import { matchAreaSlug } from "@/lib/vocation-areas";
import { prisma } from "@/lib/prisma";
import { parseFacomPdfSubjects } from "./facom";
import { ScrapedUniversityCourse, UniversityScraper } from "./types";

const USER_AGENT = "Mozilla/5.0 (compatible; CarreirasMatchUniversityBot/1.0)";
const REQUEST_TIMEOUT_MS = 30_000;
// O catálogo oficial tem dezenas de cursos (a UFU informa 67 bacharelados e
// 26 licenciaturas). O limite anterior de 8 deixava a carga sempre incompleta.
const MAX_COURSES_PER_RUN = 50;
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
  // A primeira página do Drupal também é publicada sem parâmetro (equivalente
  // a page=0); as páginas seguintes usam page=1, page=2 etc.
  for (let page = 0; page <= 20; page += 1) {
    const pageUrl = `${CATALOG_URL}${page}`;
    const html = await getHtml(pageUrl);
    const $ = cheerio.load(html);
    let foundOnPage = 0;
    $(".node--type--curso a[href]").each((_, element) => {
      const href = absoluteUrl($(element).attr("href") ?? "", pageUrl);
      const label = $(element).text().replace(/\s+/g, " ").trim();
      if (!href || !label) return;
      let hostname = "";
      try {
        hostname = new URL(href).hostname.toLowerCase();
      } catch {
        return;
      }
      if (hostname !== "ufu.br" && !hostname.endsWith(".ufu.br")) return;
      if (href.includes("/graduacao?page=") || href === "https://ufu.br/graduacao") return;
      // O nome do curso pode ser qualquer área (por exemplo, Artes Visuais),
      // portanto não podemos depender de uma lista de palavras-chave. Os
      // links institucionais principais ficam no domínio raiz ou em poucos
      // subdomínios conhecidos e não devem entrar como cursos.
      if (/^(www|prograd|propp|proae|proexc|reitoria|prefe|bibliotecas|portalselecao)\.ufu\.br$/i.test(hostname)) return;
      if (!courses.has(href)) {
        courses.set(href, { title: label, pageUrl: href });
        foundOnPage += 1;
      }
    });
    if (foundOnPage === 0 && page > 0) break;
  }
  return Array.from(courses.values());
}

async function findGradePdf(coursePage: UfuCoursePage): Promise<{ url: string; title: string; kind: "pdf" | "html" } | null> {
  const html = await getHtml(coursePage.pageUrl);
  const $ = cheerio.load(html);
  const title = $("h1").first().text().replace(/\s+/g, " ").trim() || coursePage.title;
  const gradePattern = /grade|matriz|curr[ií]cul|fluxo|projeto.?pedag|estrutura.?curricular/i;
  const candidates = $("a[href]")
    .map((_, element) => ({
      url: absoluteUrl($(element).attr("href") ?? "", coursePage.pageUrl),
      label: $(element).text().replace(/\s+/g, " ").trim(),
    }))
    .get()
    .filter((link) => link.url && (/\.pdf(?:$|\?)/i.test(link.url) || gradePattern.test(`${link.url} ${link.label}`)))
    .sort((a, b) => {
      const score = (value: { url: string; label: string }) =>
        (/\.pdf(?:$|\?)/i.test(value.url) ? 4 : 0) + (gradePattern.test(`${value.url} ${value.label}`) ? 8 : 0);
      return score(b) - score(a);
    });

  async function isAvailablePdf(url: string) {
    try {
      const response = await fetch(url, {
        method: "HEAD",
        headers: { "User-Agent": USER_AGENT },
        signal: AbortSignal.timeout(REQUEST_TIMEOUT_MS),
      });
      return response.ok;
    } catch {
      return false;
    }
  }

  let curriculumPage: string | null = null;

  for (const candidate of candidates) {
    if (/\.pdf(?:$|\?)/i.test(candidate.url)) {
      if (await isAvailablePdf(candidate.url)) return { url: candidate.url, title, kind: "pdf" };
      continue;
    }
    curriculumPage ??= candidate.url;
    try {
      const gradeHtml = await getHtml(candidate.url);
      const grade$ = cheerio.load(gradeHtml);
      const pdfs = grade$("a[href]")
        .map((_, element) => absoluteUrl(grade$(element).attr("href") ?? "", candidate.url))
        .get()
        .filter((url) => /\.pdf(?:$|\?)/i.test(url));
      for (const pdf of pdfs) {
        if (await isAvailablePdf(pdf)) return { url: pdf, title, kind: "pdf" };
      }
    } catch (error) {
      console.warn(`[ufu-scraper] Não foi possível abrir a página de grade ${candidate.url}:`, error);
    }
  }
  return curriculumPage ? { url: curriculumPage, title, kind: "html" } : null;
}

async function readHtmlSubjects(url: string) {
  const html = await getHtml(url);
  const $ = cheerio.load(html);
  const subjects: { name: string; semester?: number }[] = [];
  $("table tr").each((_, row) => {
    const cells = $(row).find("th, td").map((__, cell) => $(cell).text().replace(/\s+/g, " ").trim()).get().filter(Boolean);
    const name = cells.find((cell) => cell.length >= 5 && !/^(disciplina|componente|código|carga|per[ií]odo|total)$/i.test(cell));
    if (name && /[A-Za-zÀ-ÿ]{4,}/.test(name) && !/^\d+(?:\.\d+)?$/.test(name)) subjects.push({ name: name.replace(/^[A-Z]{2,}\d{3,}\s*[-–:]\s*/i, "") });
  });
  return subjects;
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
      const existing = await prisma.universityCourse.findMany({ select: { url: true, lastSeenAt: true } });
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
          if (!grade) {
            result.push({ title: course.title, url: course.pageUrl, area: matchAreaSlug(course.title) ?? "geral", modality: "presencial", subjects: [] });
            continue;
          }
          const subjects = grade.kind === "pdf" ? await readPdf(grade.url) : await readHtmlSubjects(grade.url);
          if (subjects.length === 0) {
            console.warn(`[ufu-scraper] Grade sem disciplinas extraíveis; mantendo o curso ${grade.title}`);
          }
          result.push({ title: grade.title, url: grade.url, area: matchAreaSlug(grade.title) ?? "geral", modality: "presencial", subjects });
        } catch (error) {
          console.error(`[ufu-scraper] Erro ao raspar ${course.pageUrl}:`, error);
          result.push({ title: course.title, url: course.pageUrl, area: matchAreaSlug(course.title) ?? "geral", modality: "presencial", subjects: [] });
        }
      }
      return result;
    },
  };
}
