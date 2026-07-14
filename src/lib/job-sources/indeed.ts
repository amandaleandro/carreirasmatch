import { chromium } from "playwright-extra";
import StealthPlugin from "puppeteer-extra-plugin-stealth";
import { FetchedJob } from "./types";

chromium.use(StealthPlugin());

const SEARCH_URL = "https://br.indeed.com/jobs";
const MAX_JOB_TEXT_LENGTH = 12000;
const MAX_PAGES = 3;
const RESULTS_PER_PAGE = 15;
const MAX_DETAIL_FETCHES = 20;
const NAVIGATION_TIMEOUT_MS = 20000;
const CLICK_TIMEOUT_MS = 6000;
const REQUEST_DELAY_MS = 1000;
// UA de um Chrome desktop comum, sem o sufixo "HeadlessChrome" que o Chromium
// headless expõe por padrão e que o bot-detection do Indeed usa para bloquear.
const USER_AGENT =
  "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/131.0.0.0 Safari/537.36";

export function isIndeedConfigured(): boolean {
  return process.env.INDEED_JOBS_ENABLED !== "false";
}

function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

// O Indeed bloqueia requisições HTTP simples (fetch/curl) pela impressão
// digital da conexão TLS/HTTP, bloqueia o Chromium "cru" do Playwright pelos
// sinais de automação que ele expõe (navigator.webdriver, CDP, plugins/WebGL
// ausentes etc.), e também bloqueia navegação direta a uma URL de vaga
// (/viewjob?jk=...) fora do fluxo normal de busca. Por isso: usamos
// playwright-extra + puppeteer-extra-plugin-stealth (patches conhecidos de
// fingerprint) sobre um Chromium real, e abrimos cada vaga clicando no card
// de resultado (como um usuário faria) em vez de navegar direto pra URL.
export async function fetchIndeedJobs(searchTerm?: string): Promise<FetchedJob[]> {
  const browser = await chromium.launch({
    executablePath: process.env.CHROMIUM_EXECUTABLE_PATH,
    // Sem isso o Chromium falha ao iniciar quando o container roda como usuário
    // não-root (nosso Dockerfile usa USER nextjs).
    args: ["--no-sandbox", "--disable-blink-features=AutomationControlled"],
  });

  try {
    const context = await browser.newContext({
      userAgent: USER_AGENT,
      viewport: { width: 1366, height: 768 },
      locale: "pt-BR",
      extraHTTPHeaders: {
        "Accept-Language": "pt-BR,pt;q=0.9,en-US;q=0.8,en;q=0.7",
        "sec-ch-ua": '"Chromium";v="131", "Not_A Brand";v="24", "Google Chrome";v="131"',
        "sec-ch-ua-mobile": "?0",
        "sec-ch-ua-platform": '"Windows"',
      },
    });

    const jobs: FetchedJob[] = [];
    const seenJobIds = new Set<string>();
    const searchPage = await context.newPage();
    // Pequena pausa antes da primeira navegação: um humano não bate na URL
    // no instante zero em que o browser abre.
    await sleep(300 + Math.floor(Math.random() * 700));

    for (let pageIndex = 0; pageIndex < MAX_PAGES && jobs.length < MAX_DETAIL_FETCHES; pageIndex++) {
      if (pageIndex > 0) await sleep(REQUEST_DELAY_MS);

      const url = new URL(SEARCH_URL);
      if (searchTerm) url.searchParams.set("q", searchTerm);
      url.searchParams.set("l", "Brasil");
      if (pageIndex > 0) url.searchParams.set("start", String(pageIndex * RESULTS_PER_PAGE));

      try {
        const response = await searchPage.goto(url.toString(), {
          waitUntil: "domcontentloaded",
          timeout: NAVIGATION_TIMEOUT_MS,
        });
        if (!response || !response.ok()) {
          throw new Error(`Indeed retornou erro ${response?.status() ?? "desconhecido"}`);
        }
        await searchPage.waitForSelector("a[data-jk]", { timeout: NAVIGATION_TIMEOUT_MS });
      } catch (error) {
        if (pageIndex === 0) throw error;
        break;
      }

      const cards = await searchPage.$$eval("a[data-jk]", (els) =>
        els.map((el) => ({
          jobId: el.getAttribute("data-jk") ?? "",
          jobTitle: el.querySelector("span[title]")?.textContent?.trim() ?? el.textContent?.trim() ?? "",
        }))
      );
      if (cards.length === 0) break;

      for (const card of cards) {
        if (!card.jobId || !card.jobTitle || seenJobIds.has(card.jobId)) continue;
        if (jobs.length >= MAX_DETAIL_FETCHES) break;
        seenJobIds.add(card.jobId);

        await sleep(REQUEST_DELAY_MS);
        try {
          await searchPage.click(`a[data-jk="${card.jobId}"]`, { timeout: CLICK_TIMEOUT_MS });
          await searchPage.waitForSelector("#jobDescriptionText", { timeout: CLICK_TIMEOUT_MS });
          const jobText = await searchPage.$eval("#jobDescriptionText", (el) => el.textContent ?? "");
          const cleanedText = jobText.replace(/\s+/g, " ").trim().slice(0, MAX_JOB_TEXT_LENGTH);
          if (!cleanedText) continue;
          const location = await searchPage
            .$eval('[data-testid="jobsearch-JobInfoHeader-companyLocation"]', (el) => el.textContent?.trim())
            .catch(() => undefined);

          jobs.push({
            url: `${SEARCH_URL}?vjk=${card.jobId}`,
            jobTitle: card.jobTitle,
            jobText: cleanedText,
            source: "indeed",
            location,
          });
        } catch {
          continue;
        }
      }
    }

    return jobs;
  } finally {
    await browser.close();
  }
}
