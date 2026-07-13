import * as cheerio from "cheerio";
import { FetchedJob } from "./types";

const ARBEITNOW_API_URL = "https://www.arbeitnow.com/api/job-board-api";
const MAX_JOB_TEXT_LENGTH = 12000;
const MAX_PAGES = 10;
const REQUEST_DELAY_MS = 300;
const MAX_RETRIES = 2;

type ArbeitnowJob = {
  slug: string;
  title: string;
  description: string;
  url: string;
  location?: string;
  remote?: boolean;
};

type ArbeitnowResponse = {
  data: ArbeitnowJob[];
  links: { next: string | null };
};

function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

async function fetchWithRetry(url: string): Promise<Response> {
  let lastError: unknown;
  for (let attempt = 0; attempt <= MAX_RETRIES; attempt++) {
    if (attempt > 0) await sleep(1000 * attempt);
    try {
      const response = await fetch(url, { signal: AbortSignal.timeout(10000) });
      if (response.status === 429) {
        lastError = new Error(`Arbeitnow API retornou erro ${response.status}`);
        continue;
      }
      return response;
    } catch (error) {
      lastError = error;
    }
  }
  throw lastError instanceof Error ? lastError : new Error("Falha ao acessar o Arbeitnow.");
}

function htmlToPlainText(html: string): string {
  return cheerio
    .load(html)
    .text()
    .replace(/\s+/g, " ")
    .trim()
    .slice(0, MAX_JOB_TEXT_LENGTH);
}

// A API do Arbeitnow ignora o parâmetro "search", retorna sempre o mesmo feed.
// Por isso buscamos tudo e filtramos por palavra-chave no cliente.
export async function fetchArbeitnowJobs(keywords?: string[]): Promise<FetchedJob[]> {
  const allJobs: ArbeitnowJob[] = [];
  let nextUrl: string | null = ARBEITNOW_API_URL;
  let page = 0;

  while (nextUrl && page < MAX_PAGES) {
    if (page > 0) await sleep(REQUEST_DELAY_MS);

    const response = await fetchWithRetry(nextUrl);
    if (!response.ok) {
      throw new Error(`Arbeitnow API retornou erro ${response.status}`);
    }

    const body: ArbeitnowResponse = await response.json();
    allJobs.push(...body.data);
    nextUrl = body.links?.next ?? null;
    page += 1;
  }

  const lowerKeywords = keywords?.map((keyword) => keyword.toLowerCase());

  return allJobs
    .filter((job) => {
      if (!lowerKeywords || lowerKeywords.length === 0) return true;
      const haystack = `${job.title} ${job.description}`.toLowerCase();
      return lowerKeywords.some((keyword) => haystack.includes(keyword));
    })
    .map((job) => ({
      url: job.url,
      jobTitle: job.title,
      jobText: htmlToPlainText(job.description),
      source: "arbeitnow",
      location: job.remote ? "Remoto" : job.location,
    }));
}
