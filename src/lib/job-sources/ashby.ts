import { FetchedJob } from "./types";
import { isBrazilRelevantLocation } from "./location-filter";
import { formatCompanyName } from "@/lib/feed-tags";
import { stripHtmlFromText } from "@/lib/job-snippet";

const ASHBY_BOARD_API_URL = "https://api.ashbyhq.com/posting-api/job-board/{company}";
const MAX_JOB_TEXT_LENGTH = 12000;
const DEFAULT_COMPANIES = [
  "supabase",
  "vercel",
  "linear",
  "ramp",
  "deel",
  "notion",
  "retool",
  "openai",
  "postman",
  "sentry",
];

type AshbyPosting = {
  id: string;
  title: string;
  location?: string;
  secondaryLocations?: { location?: string }[];
  isRemote?: boolean;
  descriptionHtml?: string;
  descriptionPlain?: string;
  jobUrl: string;
};

type AshbyResponse = {
  jobs: AshbyPosting[];
};

export function isAshbyConfigured(): boolean {
  return getAshbyCompanies().length > 0;
}

export function getAshbyCompanies(): string[] {
  const raw = process.env.ASHBY_COMPANIES;
  if (!raw) return DEFAULT_COMPANIES;

  return raw
    .split(",")
    .map((company) => company.trim())
    .filter(Boolean);
}

async function fetchCompanyPostings(company: string): Promise<FetchedJob[]> {
  const url = ASHBY_BOARD_API_URL.replace("{company}", company);
  const response = await fetch(url, { signal: AbortSignal.timeout(10000) });
  if (!response.ok) {
    return [];
  }

  const body: AshbyResponse = await response.json();
  if (!body.jobs || !Array.isArray(body.jobs)) return [];

  const results: FetchedJob[] = [];
  for (const job of body.jobs) {
    if (!job.title || !job.jobUrl) continue;

    const locString = [
      job.location,
      ...(job.secondaryLocations?.map((l) => l.location) ?? []),
      job.isRemote ? "Remote" : "",
    ]
      .filter(Boolean)
      .join(" | ");

    if (!isBrazilRelevantLocation(locString)) continue;

    const rawContent = job.descriptionPlain || job.descriptionHtml || "";
    const jobText = stripHtmlFromText(rawContent).slice(0, MAX_JOB_TEXT_LENGTH);

    results.push({
      url: job.jobUrl,
      jobTitle: job.title,
      jobText: jobText || job.title,
      source: "ashby",
      company: formatCompanyName(company),
      location: locString || undefined,
    });
  }

  return results;
}

export async function fetchAshbyJobs(
  companies: string[] = getAshbyCompanies(),
  keywords?: string[]
): Promise<FetchedJob[]> {
  if (companies.length === 0) return [];

  const perCompany = await Promise.allSettled(companies.map(fetchCompanyPostings));

  const jobsByUrl = new Map<string, FetchedJob>();
  for (const result of perCompany) {
    if (result.status === "fulfilled") {
      for (const job of result.value) {
        if (!jobsByUrl.has(job.url)) jobsByUrl.set(job.url, job);
      }
    }
  }

  const lowerKeywords = keywords?.map((keyword) => keyword.toLowerCase());
  return [...jobsByUrl.values()].filter((job) => {
    if (!lowerKeywords || lowerKeywords.length === 0) return true;
    const haystack = `${job.jobTitle} ${job.jobText}`.toLowerCase();
    return lowerKeywords.some((keyword) => haystack.includes(keyword));
  });
}
