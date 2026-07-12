import * as cheerio from "cheerio";
import { FetchedJob } from "./types";

const JOBICY_API_URL = "https://jobicy.com/api/v2/remote-jobs";
const MAX_JOB_TEXT_LENGTH = 12000;
const RESULTS_COUNT = 50;

type JobicyJob = {
  id?: number;
  url?: string;
  jobTitle?: string;
  jobDescription?: string;
  jobGeo?: string;
};

type JobicyResponse = {
  jobs: JobicyJob[];
};

function htmlToPlainText(html: string): string {
  return cheerio.load(html).text().replace(/\s+/g, " ").trim().slice(0, MAX_JOB_TEXT_LENGTH);
}

export async function fetchJobicyJobs(keywords?: string[]): Promise<FetchedJob[]> {
  const url = new URL(JOBICY_API_URL);
  url.searchParams.set("count", String(RESULTS_COUNT));

  const response = await fetch(url.toString(), { signal: AbortSignal.timeout(10000) });
  if (!response.ok) {
    throw new Error(`Jobicy API retornou erro ${response.status}`);
  }

  const body: JobicyResponse = await response.json();
  const lowerKeywords = keywords?.map((keyword) => keyword.toLowerCase());

  return body.jobs
    .filter((job) => job.id && job.jobTitle && job.jobDescription && job.url)
    .filter((job) => {
      if (!lowerKeywords || lowerKeywords.length === 0) return true;
      const haystack = `${job.jobTitle} ${job.jobDescription}`.toLowerCase();
      return lowerKeywords.some((keyword) => haystack.includes(keyword));
    })
    .map((job) => ({
      url: job.url!,
      jobTitle: job.jobTitle!,
      jobText: htmlToPlainText(job.jobDescription!),
      source: "jobicy",
      location: job.jobGeo?.trim() || "Remoto",
    }));
}
