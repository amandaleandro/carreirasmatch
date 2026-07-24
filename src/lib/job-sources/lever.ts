import { FetchedJob } from "./types";
import { isBrazilRelevantLocation } from "./location-filter";
import { formatCompanyName } from "@/lib/feed-tags";
import { stripHtmlFromText } from "@/lib/job-snippet";

const POSTINGS_API_URL = "https://api.lever.co/v0/postings/{company}";
const MAX_JOB_TEXT_LENGTH = 12000;
const DEFAULT_COMPANIES = [
  "ciandt",
  "flashapp",
  "unico",
  "bv",
  "neon",
  "loadsmart",
  "wildlife",
  "pipefy",
  "ebanx",
  "olist",
];

type LeverPosting = {
  id: string;
  text: string;
  descriptionPlain?: string;
  hostedUrl: string;
  categories?: { location?: string };
};

function htmlToPlainText(html: string): string {
  return stripHtmlFromText(html).slice(0, MAX_JOB_TEXT_LENGTH);
}

// Lever (ATS) expõe um feed público de vagas por empresa
// (https://github.com/lever/postings-api), sem necessidade de chave. Mesmo
// padrão de lista de empresas via env usado para Gupy/Sólides/Greenhouse.
export function isLeverConfigured(): boolean {
  return getLeverCompanies().length > 0;
}

export function getLeverCompanies(): string[] {
  const raw = process.env.LEVER_COMPANIES;
  if (!raw) return DEFAULT_COMPANIES;

  return raw
    .split(",")
    .map((company) => company.trim())
    .filter(Boolean);
}

async function fetchCompanyPostings(company: string): Promise<FetchedJob[]> {
  const url = new URL(POSTINGS_API_URL.replace("{company}", company));
  url.searchParams.set("mode", "json");

  const response = await fetch(url.toString(), { signal: AbortSignal.timeout(10000) });
  if (!response.ok) {
    throw new Error(`Lever API (${company}) retornou erro ${response.status}`);
  }

  const postings: LeverPosting[] = await response.json();

  return postings
    .filter((posting) => posting.text && posting.hostedUrl && posting.descriptionPlain)
    .filter((posting) => isBrazilRelevantLocation(posting.categories?.location))
    .map((posting) => ({
      url: posting.hostedUrl,
      jobTitle: posting.text,
      jobText: htmlToPlainText(posting.descriptionPlain!),
      source: "lever",
      company: formatCompanyName(company),
      location: posting.categories?.location,
    }));
}

export async function fetchLeverJobs(
  companies: string[] = getLeverCompanies(),
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
