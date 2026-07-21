import * as cheerio from "cheerio";
import { FetchedJob, JobSearchTerms } from "./types";

const SEARCH_URL = "https://www.linkedin.com/jobs-guest/jobs/api/seeMoreJobPostings/search";
const DETAIL_URL = "https://www.linkedin.com/jobs-guest/jobs/api/jobPosting";
const MAX_JOB_TEXT_LENGTH = 12000;
// A API "seeMore" do LinkedIn devolve ~10 cards por chamada, então paginamos em
// passos de 10 (o código antigo pulava resultados ao avançar de 25 em 25).
const RESULTS_PER_PAGE = 10;
const MAX_PAGES = 6;
const MAX_DETAIL_FETCHES = 40;
const DETAIL_CONCURRENCY = 5;
// geoId público do Brasil no LinkedIn - mais estável que só a string "Brasil".
const BRAZIL_GEO_ID = "106057199";
const USER_AGENT =
  "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36";

type LinkedInCandidate = { url: string; jobTitle: string; location?: string };

// Página de busca "guest" do LinkedIn: não exige login, mas é uma API interna
// não documentada e sujeita a bloqueio/mudança de layout sem aviso.
async function fetchSearchPage(
  keywords: string,
  location: string,
  start: number
): Promise<LinkedInCandidate[]> {
  const url = new URL(SEARCH_URL);
  if (keywords) url.searchParams.set("keywords", keywords);
  url.searchParams.set("location", location);
  url.searchParams.set("geoId", BRAZIL_GEO_ID);
  url.searchParams.set("start", String(start));

  const response = await fetch(url.toString(), {
    headers: { "User-Agent": USER_AGENT },
    signal: AbortSignal.timeout(10000),
  });
  if (!response.ok) {
    throw new Error(`LinkedIn retornou erro ${response.status}`);
  }

  const html = await response.text();
  const $ = cheerio.load(html);
  const candidates: LinkedInCandidate[] = [];

  $("li div.base-card").each((_, el) => {
    const card = $(el);
    const href = card.find("a.base-card__full-link").attr("href");
    const jobTitle = card.find("h3.base-search-card__title").text().trim();
    const location = card.find(".job-search-card__location").text().trim();
    if (!href || !jobTitle) return;
    candidates.push({ url: href.split("?")[0], jobTitle, location: location || undefined });
  });

  return candidates;
}

function extractJobId(url: string): string | null {
  const match = url.match(/-(\d+)$/);
  return match ? match[1] : null;
}

async function fetchDescription(jobId: string): Promise<string | null> {
  const response = await fetch(`${DETAIL_URL}/${jobId}`, {
    headers: { "User-Agent": USER_AGENT },
    signal: AbortSignal.timeout(10000),
  });
  if (!response.ok) return null;

  const html = await response.text();
  const $ = cheerio.load(html);
  const text = $(".description__text").first().text().replace(/\s+/g, " ").trim();
  return text ? text.slice(0, MAX_JOB_TEXT_LENGTH) : null;
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

export async function fetchLinkedInJobs(searchTerms?: JobSearchTerms, location = "Brasil"): Promise<FetchedJob[]> {
  const keywords = searchTerms?.titlePt || searchTerms?.titleEn || "";

  const candidatesByUrl = new Map<string, LinkedInCandidate>();
  for (let page = 0; page < MAX_PAGES; page++) {
    const pageCandidates = await fetchSearchPage(keywords, location, page * RESULTS_PER_PAGE);
    if (pageCandidates.length === 0) break;
    for (const candidate of pageCandidates) {
      if (!candidatesByUrl.has(candidate.url)) candidatesByUrl.set(candidate.url, candidate);
    }
  }

  const candidates = [...candidatesByUrl.values()].slice(0, MAX_DETAIL_FETCHES);

  const jobs = await mapWithConcurrency(candidates, DETAIL_CONCURRENCY, async (candidate) => {
    const jobId = extractJobId(candidate.url);
    if (!jobId) return null;
    const description = await fetchDescription(jobId);
    if (!description) return null;
    const job: FetchedJob = {
      url: candidate.url,
      jobTitle: candidate.jobTitle,
      jobText: description,
      source: "linkedin",
      location: candidate.location,
    };
    return job;
  });

  return jobs.filter((job): job is FetchedJob => job !== null);
}
