import * as cheerio from "cheerio";
import { ScrapedSubject, ScrapedUniversityCourse, UniversityScraper } from "./types";

const USER_AGENT = "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.0.0 Safari/537.36";

async function fetchPage(url: string) {
  const res = await fetch(url, {
    headers: {
      "User-Agent": USER_AGENT,
      Accept: "text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8",
      "Accept-Language": "pt-BR,pt;q=0.9",
    },
    signal: AbortSignal.timeout(20_000),
  });
  if (!res.ok) throw new Error(`HTTP ${res.status} para ${url}`);
  return res.text();
}

/**
 * SIGAA (usado por dezenas de universidades federais) publica a matriz curricular
 * em dois formatos de HTML, dependendo da instalação/versão:
 *
 * Formato A ("link/public/curso/curriculo/<id>", permalink direto): cada
 * período tem uma linha `tr.tituloRelatorio` ("1º Período") seguida de linhas
 * `tr.componentes` no formato "CÓDIGO - NOME DA DISCIPLINA - 64h".
 *
 * Formato B (acessado clicando em "Visualizar Estrutura Curricular" a partir
 * de `curso/curriculo.jsf` ou `curriculo_curso.jsf`): cada período é uma
 * `table.subFormulario` com `<caption>` "1º Nível" e linhas de disciplina no
 * mesmo formato "CÓDIGO - NOME - 64h", sem classe `componentes` (usa
 * `linhaPar`/`linhaImpar`, ou nenhuma).
 */
const SUBJECT_PATTERN = /^([A-Z0-9]+)\s*-\s*(.+?)\s*-\s*\d+h$/;

export function parseSigaaCurriculum(html: string): ScrapedSubject[] {
  const $ = cheerio.load(html);
  const subjects: ScrapedSubject[] = [];

  // Formato A
  let currentSemester: number | undefined;
  $("tr.tituloRelatorio, tr.componentes").each((_, row) => {
    const $row = $(row);
    if ($row.hasClass("tituloRelatorio")) {
      const periodMatch = $row.text().match(/(\d+)º?\s*Per[ií]odo/i);
      currentSemester = periodMatch ? Number(periodMatch[1]) : undefined;
      return;
    }
    const cellText = $row.find("td").first().text().replace(/\s+/g, " ").trim();
    const subjectMatch = cellText.match(SUBJECT_PATTERN);
    const name = subjectMatch ? subjectMatch[2].trim() : cellText;
    if (name) {
      subjects.push({ name, semester: currentSemester });
    }
  });

  // Formato B
  $("table.subFormulario").each((_, table) => {
    const $table = $(table);
    const periodMatch = $table.find("caption").first().text().match(/(\d+)º?\s*N[ií]vel/i);
    const semester = periodMatch ? Number(periodMatch[1]) : undefined;
    $table.find("tbody > tr").each((_, row) => {
      const cellText = $(row).find("td").first().text().replace(/\s+/g, " ").trim();
      const subjectMatch = cellText.match(SUBJECT_PATTERN);
      if (subjectMatch) {
        subjects.push({ name: subjectMatch[2].trim(), semester });
      }
    });
  });

  return subjects;
}

export interface SigaaCourseConfig {
  universityName: string;
  city: string;
  state: string;
  website: string;
  courseTitle: string;
  area: string;
  subarea?: string;
  modality?: string;
  curriculumUrl: string;
}

export function createSigaaCourseScraper(config: SigaaCourseConfig): UniversityScraper {
  return {
    universityName: config.universityName,
    city: config.city,
    state: config.state,
    website: config.website,
    async scrape(): Promise<ScrapedUniversityCourse[]> {
      const html = await fetchPage(config.curriculumUrl);
      const subjects = parseSigaaCurriculum(html);
      if (subjects.length === 0) return [];
      return [
        {
          title: config.courseTitle,
          url: config.curriculumUrl,
          area: config.area,
          subarea: config.subarea ?? "",
          modality: config.modality ?? "presencial",
          subjects,
        },
      ];
    },
  };
}
