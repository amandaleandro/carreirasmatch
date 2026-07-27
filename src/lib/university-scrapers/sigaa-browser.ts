import { chromium } from "playwright-extra";
import type { Browser } from "playwright";
import { parseSigaaCurriculum } from "./sigaa";
import { ScrapedUniversityCourse, UniversityScraper } from "./types";

const NAVIGATION_TIMEOUT_MS = 25_000;

let sharedBrowser: Browser | null = null;

async function getSharedBrowser(): Promise<Browser> {
  if (!sharedBrowser) {
    sharedBrowser = await chromium.launch({
      executablePath: process.env.CHROMIUM_EXECUTABLE_PATH,
      args: ["--no-sandbox"],
    });
  }
  return sharedBrowser;
}

export async function closeSharedBrowser(): Promise<void> {
  if (sharedBrowser) {
    await sharedBrowser.close();
    sharedBrowser = null;
  }
}

export interface SigaaBrowserCourseConfig {
  universityName: string;
  city: string;
  state: string;
  website: string;
  courseTitle: string;
  area: string;
  subarea?: string;
  modality?: string;
  domain: string;
  courseId: string;
}

/**
 * A maioria das matrizes curriculares do SIGAA não tem link direto: a página
 * `curso/curriculo.jsf?id=<courseId>` só lista as versões da matriz, e é
 * preciso clicar no ícone "Visualizar Detalhes da Matriz Curricular" (um
 * postback JSF) pra ver a tabela de disciplinas de fato.
 */
export function createSigaaBrowserCourseScraper(config: SigaaBrowserCourseConfig): UniversityScraper {
  return {
    universityName: config.universityName,
    city: config.city,
    state: config.state,
    website: config.website,
    async scrape(): Promise<ScrapedUniversityCourse[]> {
      const browser = await getSharedBrowser();
      // Contexto novo por curso: o SIGAA amarra a navegação ao jsessionid do
      // cookie, e reaproveitar a mesma aba/contexto entre cursos do mesmo
      // domínio deixava a sessão de um curso vazar pro próximo.
      const context = await browser.newContext();
      const page = await context.newPage();
      try {
        const url = `https://${config.domain}/sigaa/public/curso/curriculo.jsf?lc=pt_BR&id=${config.courseId}`;
        await page.goto(url, { waitUntil: "domcontentloaded", timeout: NAVIGATION_TIMEOUT_MS });
        // Cursos antigos têm várias versões de matriz listadas na página; a
        // mais recente (a vigente) é sempre a última da lista.
        const viewLinks = page.locator('a:has(img[src*="view.gif"])');
        const viewLink = viewLinks.nth((await viewLinks.count()) - 1);
        await viewLink.scrollIntoViewIfNeeded();
        await viewLink.click({ timeout: NAVIGATION_TIMEOUT_MS, force: true });
        await page.waitForLoadState("networkidle").catch(() => {});

        const html = await page.content();
        const subjects = parseSigaaCurriculum(html);
        if (subjects.length === 0) return [];

        return [
          {
            title: config.courseTitle,
            url,
            area: config.area,
            subarea: config.subarea ?? "",
            modality: config.modality ?? "presencial",
            subjects,
          },
        ];
      } finally {
        await context.close();
      }
    },
  };
}
