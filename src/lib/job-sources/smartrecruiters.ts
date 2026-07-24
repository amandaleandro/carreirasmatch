import { FetchedJob } from "./types";
import { isBrazilRelevantLocation } from "./location-filter";
import { formatCompanyName } from "@/lib/feed-tags";

const SMARTRECRUITERS_API_URL = "https://api.smartrecruiters.com/v1/companies/{company}/postings";
const DEFAULT_COMPANIES = [
  "experian",
  "averydennison",
  "visa",
  "ubisoft",
  "bosch",
  "square",
];

type SmartRecruitersPosting = {
  id: string;
  name: string;
  location?: {
    city?: string;
    region?: string;
    country?: string;
    remote?: boolean;
    hybrid?: boolean;
    fullLocation?: string;
  };
  jobAdUrl?: string;
  refNumber?: string;
};

type SmartRecruitersResponse = {
  content?: SmartRecruitersPosting[];
};

export function isSmartRecruitersConfigured(): boolean {
  return getSmartRecruitersCompanies().length > 0;
}

export function getSmartRecruitersCompanies(): string[] {
  const raw = process.env.SMARTRECRUITERS_COMPANIES;
  if (!raw) return DEFAULT_COMPANIES;

  return raw
    .split(",")
    .map((company) => company.trim())
    .filter(Boolean);
}

async function fetchCompanyPostings(company: string): Promise<FetchedJob[]> {
  const url = SMARTRECRUITERS_API_URL.replace("{company}", company);
  const response = await fetch(url, { signal: AbortSignal.timeout(10000) });
  if (!response.ok) return [];

  const body: SmartRecruitersResponse = await response.json();
  if (!body.content || !Array.isArray(body.content)) return [];

  const results: FetchedJob[] = [];
  for (const job of body.content) {
    if (!job.name) continue;

    const locString = [
      job.location?.fullLocation || job.location?.city,
      job.location?.country,
      job.location?.remote ? "Remote" : "",
      job.location?.hybrid ? "Hibrido" : "",
    ]
      .filter(Boolean)
      .join(" | ");

    if (!isBrazilRelevantLocation(locString)) continue;

    const jobUrl = job.jobAdUrl || `https://jobs.smartrecruiters.com/${company}/${job.id}`;

    results.push({
      url: jobUrl,
      jobTitle: job.name,
      jobText: job.name,
      source: "smartrecruiters",
      company: formatCompanyName(company === "experian" ? "Serasa Experian" : company),
      location: locString || undefined,
    });
  }

  return results;
}

export async function fetchSmartRecruitersJobs(
  companies: string[] = getSmartRecruitersCompanies(),
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
