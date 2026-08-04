import * as cheerio from "cheerio";
import { PDFParse } from "pdf-parse";
import { matchAreaSlug } from "@/lib/vocation-areas";
import { ScrapedSubject, ScrapedUniversityCourse, UniversityScraper } from "./types";

const USER_AGENT = "Mozilla/5.0 (compatible; CarreirasMatchUniversityBot/1.0)";

type FacomCourseConfig = {
  universityName: string;
  city: string;
  state: string;
  website: string;
  courseTitle: string;
  gradePageUrl: string;
  area?: string;
};

function clean(value: string) {
  return value.replace(/\u00a0/g, " ").replace(/\s+/g, " ").trim();
}

const PDF_TABLE_LABELS = /^(?:te[oó]rica|pr[aá]tica|total|per[ií]odo|curr[ií]culo|faculdade|universidade|forma[cç][aã]o|optativa|est[aá]gio|trabalho de conclus[aã]o|carga hor[aá]ria)$/i;

export function parseFacomPdfSubjects(text: string): ScrapedSubject[] {
  const lines = text
    .replace(/[\u0000-\u0009\u000b\u000c\u000e-\u001f]/g, " ")
    .split(/\r?\n/)
    .map(clean)
    .filter(Boolean);
  const subjects: ScrapedSubject[] = [];
  let semester: number | undefined;

  for (let index = 0; index < lines.length; index += 1) {
    const period = lines[index].match(/^(\d+)º\s*Per[ií]odo$/i);
    if (period) {
      semester = Number(period[1]);
      continue;
    }

    // Os PDFs da FACOM alternam código, nome e carga horária. O nome pode
    // ocupar mais de uma linha e por isso é acumulado até a próxima carga.
    if (!/^[A-Z]{2,}\s*\d{3,}$/.test(lines[index])) continue;
    const nameParts: string[] = [];
    for (let cursor = index + 1; cursor < Math.min(index + 5, lines.length); cursor += 1) {
      const line = lines[cursor];
      if (/^\d+\s*-\s*\d+\s*-\s*\d+$/.test(line)) break;
      if (/^[A-Z]{2,}\s*\d{3,}$/.test(line) || /^\d+º\s*Per[ií]odo$/i.test(line)) break;
      if (!/^\d+(?:\.\d+)?$/.test(line) && !/^\d+\s*h$/i.test(line)) nameParts.push(line);
    }
    const name = clean(nameParts.join(" "));
    if (name && !/^(?:optativa|estágio|total|pré-requisito)/i.test(name)) {
      subjects.push({ name, semester });
    }
  }

  // Alguns fluxos curriculares (especialmente BSI) são tabelas desenhadas no
  // PDF e a extração perde os códigos. Neles, o nome vem logo após uma linha
  // de carga horária. Mantemos esse fallback sem tentar transformar cabeçalhos
  // ou totais em disciplinas.
  if (subjects.length === 0) {
    for (let index = 1; index < lines.length; index += 1) {
      if (!/^\d+\s+\d+\s+\d+$/.test(lines[index - 1])) continue;
      const nameParts: string[] = [];
      for (let cursor = index; cursor < Math.min(index + 4, lines.length); cursor += 1) {
        const line = lines[cursor];
        if (/^\d+\s+\d+\s+\d+$/.test(line) || /^\d+º\s*Per[ií]odo$/i.test(line)) break;
        if (/^\d+(?:\.\d+)?$/.test(line) || PDF_TABLE_LABELS.test(line)) continue;
        nameParts.push(line);
      }
      const name = clean(nameParts.join(" "));
      if (name.length >= 4 && /[A-Za-zÀ-ÿ]/.test(name)) subjects.push({ name, semester });
    }
  }

  const seen = new Set<string>();
  return subjects.filter((subject) => {
    const key = `${subject.name.toLocaleLowerCase("pt-BR")}::${subject.semester ?? ""}`;
    if (seen.has(key)) return false;
    seen.add(key);
    return true;
  });
}

async function fetchPdfLinks(pageUrl: string): Promise<string[]> {
  const response = await fetch(pageUrl, {
    headers: { "User-Agent": USER_AGENT, Accept: "text/html" },
    signal: AbortSignal.timeout(30_000),
  });
  if (!response.ok) throw new Error(`HTTP ${response.status} para ${pageUrl}`);
  const html = await response.text();
  const $ = cheerio.load(html);
  return $("a[href]")
    .map((_, element) => new URL($(element).attr("href")!, pageUrl).toString())
    .get()
    .filter((url) => /\.pdf(?:$|\?)/i.test(url));
}

export function createFacomCourseScraper(config: FacomCourseConfig): UniversityScraper {
  return {
    universityName: config.universityName,
    city: config.city,
    state: config.state,
    website: config.website,
    async scrape(): Promise<ScrapedUniversityCourse[]> {
      const pdfUrls = await fetchPdfLinks(config.gradePageUrl);
      const pdfUrl = pdfUrls[0];
      if (!pdfUrl) return [];

      const response = await fetch(pdfUrl, {
        headers: { "User-Agent": USER_AGENT, Accept: "application/pdf" },
        signal: AbortSignal.timeout(30_000),
      });
      if (!response.ok) throw new Error(`HTTP ${response.status} para ${pdfUrl}`);

      const parser = new PDFParse({ data: Buffer.from(await response.arrayBuffer()) });
      try {
        const result = await parser.getText();
        const subjects = parseFacomPdfSubjects(result.text);
        if (subjects.length === 0) return [];
        return [{
          title: config.courseTitle,
          url: pdfUrl,
          area: config.area ?? matchAreaSlug(config.courseTitle) ?? "geral",
          modality: "presencial",
          subjects,
        }];
      } finally {
        await parser.destroy();
      }
    },
  };
}
