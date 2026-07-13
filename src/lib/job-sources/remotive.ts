import * as cheerio from "cheerio";
import { FetchedJob } from "./types";
import { isBrazilRelevantLocation } from "./location-filter";

const REMOTIVE_API_URL = "https://remotive.com/api/remote-jobs";
const MAX_JOB_TEXT_LENGTH = 12000;
const RESULTS_LIMIT = 100;

type RemotiveJob = {
  id?: number;
  url?: string;
  title?: string;
  company_name?: string;
  candidate_required_location?: string;
  description?: string;
  tags?: string[];
};

type RemotiveResponse = {
  jobs: RemotiveJob[];
};

function htmlToPlainText(html: string): string {
  return cheerio.load(html).text().replace(/\s+/g, " ").trim().slice(0, MAX_JOB_TEXT_LENGTH);
}

export async function fetchRemotiveJobs(keywords?: string[]): Promise<FetchedJob[]> {
  const url = new URL(REMOTIVE_API_URL);
  url.searchParams.set("limit", String(RESULTS_LIMIT));

  const response = await fetch(url.toString(), { signal: AbortSignal.timeout(10000) });
  if (!response.ok) {
    throw new Error(`Remotive API retornou erro ${response.status}`);
  }

  const body: RemotiveResponse = await response.json();
  const lowerKeywords = keywords?.map((keyword) => keyword.toLowerCase());

  return body.jobs
    .filter((job) => job.id && job.url && job.title && job.description)
    .filter((job) => isBrazilRelevantLocation(job.candidate_required_location) || job.candidate_required_location === "Worldwide")
    .filter((job) => {
      if (!lowerKeywords || lowerKeywords.length === 0) return true;
      const haystack = `${job.title} ${job.description} ${(job.tags ?? []).join(" ")}`.toLowerCase();
      return lowerKeywords.some((keyword) => haystack.includes(keyword));
    })
    .map((job) => ({
      url: job.url!,
      jobTitle: job.company_name ? `${job.title!} - ${job.company_name}` : job.title!,
      jobText: htmlToPlainText(job.description!),
      source: "remotive",
      location: job.candidate_required_location || "Remoto",
    }));
}
