import * as cheerio from "cheerio";
import { FetchedJob } from "./types";

const VACANCY_API_URL = "https://apigw.solides.com.br/jobs/v3/home/vacancy";
const CAREER_PAGE_URL = "https://{slug}.vagas.solides.com.br/vaga/{id}";
const MAX_JOB_TEXT_LENGTH = 12000;
const PAGE_SIZE = 50;
const MAX_PAGES_PER_COMPANY = 5;

type SolidesVacancy = {
  id: number;
  title: string;
  description: string;
  city?: string;
  state?: string;
  homeOffice?: boolean;
};

type SolidesVacancyResponse = {
  success: boolean;
  data: {
    totalPages: number;
    data: SolidesVacancy[];
  };
};

function htmlToPlainText(html: string): string {
  return cheerio.load(html).text().replace(/\s+/g, " ").trim().slice(0, MAX_JOB_TEXT_LENGTH);
}

// Sólides (ATS/HR SaaS) não tem busca agregada pública. Cada empresa cliente
// tem uma página de carreira em {slug}.vagas.solides.com.br, que carrega as
// vagas via essa API pública (achada inspecionando as requisições da página).
export function isSolidesConfigured(): boolean {
  return getSolidesCompanies().length > 0;
}

export function getSolidesCompanies(): string[] {
  return (process.env.SOLIDES_COMPANIES ?? "")
    .split(",")
    .map((company) => company.trim())
    .filter(Boolean);
}

async function fetchCompanyVacancies(slug: string): Promise<FetchedJob[]> {
  const jobs: FetchedJob[] = [];

  for (let page = 1; page <= MAX_PAGES_PER_COMPANY; page++) {
    const url = new URL(VACANCY_API_URL);
    url.searchParams.set("take", String(PAGE_SIZE));
    url.searchParams.set("slug", slug);
    url.searchParams.set("title", "");
    url.searchParams.set("locations", "");
    url.searchParams.set("page", String(page));

    const response = await fetch(url.toString(), { signal: AbortSignal.timeout(10000) });
    if (!response.ok) {
      throw new Error(`Sólides API (${slug}) retornou erro ${response.status}`);
    }

    const body: SolidesVacancyResponse = await response.json();
    if (!body.success) break;

    for (const vacancy of body.data.data) {
      if (!vacancy.title || !vacancy.description) continue;
      const location = vacancy.homeOffice
        ? "Remoto"
        : [vacancy.city, vacancy.state].filter(Boolean).join(", ") || undefined;

      jobs.push({
        url: CAREER_PAGE_URL.replace("{slug}", slug).replace("{id}", String(vacancy.id)),
        jobTitle: vacancy.title,
        jobText: htmlToPlainText(vacancy.description),
        source: "solides",
        location,
      });
    }

    if (page >= body.data.totalPages) break;
  }

  return jobs;
}

export async function fetchSolidesJobs(
  companies: string[] = getSolidesCompanies()
): Promise<FetchedJob[]> {
  if (companies.length === 0) return [];

  const perCompany = await Promise.allSettled(companies.map(fetchCompanyVacancies));

  const jobsByUrl = new Map<string, FetchedJob>();
  for (const result of perCompany) {
    if (result.status === "fulfilled") {
      for (const job of result.value) {
        if (!jobsByUrl.has(job.url)) jobsByUrl.set(job.url, job);
      }
    }
  }

  return [...jobsByUrl.values()];
}
