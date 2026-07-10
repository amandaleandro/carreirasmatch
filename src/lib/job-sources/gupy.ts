import * as cheerio from "cheerio";
import { fetchJobFromUrl } from "@/lib/scrape-job";
import { FetchedJob } from "./types";

const FEED_URL = "https://job-boards.api.gupy.io/production/job-board-content";
const MAX_JOBS_PER_COMPANY = 20;
const DETAIL_CONCURRENCY = 5;
const USER_AGENT =
  "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36";

// Gupy não tem busca agregada pública. Cada empresa expõe um feed de vagas
// (voltado para indexação no Google for Jobs, referenciado no robots.txt de
// {empresa}.gupy.io) que lista as URLs das vagas abertas daquela empresa.
export function isGupyConfigured(): boolean {
  return getGupyCompanies().length > 0;
}

export function getGupyCompanies(): string[] {
  return (process.env.GUPY_COMPANIES ?? "")
    .split(",")
    .map((company) => company.trim())
    .filter(Boolean);
}

async function fetchCompanyJobUrls(subdomain: string): Promise<string[]> {
  const url = new URL(FEED_URL);
  url.searchParams.set("jobBoardName", "google");
  url.searchParams.set("subdomain", subdomain);

  const response = await fetch(url.toString(), {
    headers: { "User-Agent": USER_AGENT },
    signal: AbortSignal.timeout(10000),
  });
  if (!response.ok) {
    throw new Error(`feed de vagas da Gupy (${subdomain}) retornou erro ${response.status}`);
  }

  const xml = await response.text();
  const $ = cheerio.load(xml, { xmlMode: true });
  const urls: string[] = [];
  $("url > loc").each((_, el) => {
    const loc = $(el).text().trim();
    if (loc) urls.push(loc);
  });

  return urls.slice(0, MAX_JOBS_PER_COMPANY);
}

async function mapWithConcurrency<T, R>(
  items: T[],
  limit: number,
  fn: (item: T) => Promise<R>
): Promise<R[]> {
  const results: R[] = [];
  for (let i = 0; i < items.length; i += limit) {
    const batch = items.slice(i, i + limit);
    results.push(...(await Promise.all(batch.map(fn))));
  }
  return results;
}

export async function fetchGupyJobs(
  companies: string[] = getGupyCompanies()
): Promise<FetchedJob[]> {
  if (companies.length === 0) return [];

  const perCompany = await Promise.allSettled(companies.map(fetchCompanyJobUrls));
  const jobUrls = new Set<string>();
  for (const result of perCompany) {
    if (result.status === "fulfilled") {
      for (const url of result.value) jobUrls.add(url);
    }
  }

  const jobs = await mapWithConcurrency([...jobUrls], DETAIL_CONCURRENCY, async (url) => {
    const result = await fetchJobFromUrl(url);
    if ("error" in result) return null;
    const job: FetchedJob = {
      url,
      jobTitle: result.jobTitle,
      jobText: result.jobText,
      source: "gupy",
    };
    return job;
  });

  return jobs.filter((job): job is FetchedJob => job !== null);
}
