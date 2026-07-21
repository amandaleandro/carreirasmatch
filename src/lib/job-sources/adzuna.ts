import * as cheerio from "cheerio";
import { FetchedJob } from "./types";

const ADZUNA_COUNTRY = "br";
const MAX_JOB_TEXT_LENGTH = 12000;
const RESULTS_PER_PAGE = 50;
const MAX_PAGES = 3;

type AdzunaJob = {
  id: string;
  title: string;
  description: string;
  redirect_url: string;
  location?: { display_name?: string };
};

type AdzunaResponse = {
  results: AdzunaJob[];
};

function htmlToPlainText(html: string): string {
  return cheerio
    .load(html)
    .text()
    .replace(/\s+/g, " ")
    .trim()
    .slice(0, MAX_JOB_TEXT_LENGTH);
}

export function isAdzunaConfigured(): boolean {
  return Boolean(process.env.ADZUNA_APP_ID && process.env.ADZUNA_APP_KEY);
}

export async function fetchAdzunaJobs(searchTerm?: string, location?: string): Promise<FetchedJob[]> {
  const appId = process.env.ADZUNA_APP_ID;
  const appKey = process.env.ADZUNA_APP_KEY;
  if (!appId || !appKey) return [];

  const allJobs: AdzunaJob[] = [];

  for (let page = 1; page <= MAX_PAGES; page++) {
    const url = new URL(`https://api.adzuna.com/v1/api/jobs/${ADZUNA_COUNTRY}/search/${page}`);
    url.searchParams.set("app_id", appId);
    url.searchParams.set("app_key", appKey);
    url.searchParams.set("results_per_page", String(RESULTS_PER_PAGE));
    url.searchParams.set("content-type", "application/json");
    if (searchTerm) url.searchParams.set("what", searchTerm);
    if (location) url.searchParams.set("where", location);

    const response = await fetch(url.toString(), { signal: AbortSignal.timeout(10000) });
    if (!response.ok) {
      throw new Error(`Adzuna API retornou erro ${response.status}`);
    }

    const body: AdzunaResponse = await response.json();
    if (body.results.length === 0) break;
    allJobs.push(...body.results);
  }

  return allJobs
    .filter((job) => job.id && job.title && job.description && job.redirect_url)
    .map((job) => ({
      url: job.redirect_url,
      jobTitle: job.title,
      jobText: htmlToPlainText(job.description),
      source: "adzuna",
      location: job.location?.display_name,
    }));
}
