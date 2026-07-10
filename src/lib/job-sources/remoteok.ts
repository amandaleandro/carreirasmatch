import * as cheerio from "cheerio";
import { FetchedJob } from "./types";

const REMOTEOK_API_URL = "https://remoteok.com/api";
const MAX_JOB_TEXT_LENGTH = 12000;
const USER_AGENT =
  "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36";

type RemoteOkJob = {
  id?: string;
  slug?: string;
  position?: string;
  description?: string;
  url?: string;
  location?: string;
};

function htmlToPlainText(html: string): string {
  return cheerio
    .load(html)
    .text()
    .replace(/\s+/g, " ")
    .trim()
    .slice(0, MAX_JOB_TEXT_LENGTH);
}

export async function fetchRemoteOkJobs(keywords?: string[]): Promise<FetchedJob[]> {
  const response = await fetch(REMOTEOK_API_URL, {
    headers: { "User-Agent": USER_AGENT },
    signal: AbortSignal.timeout(10000),
  });
  if (!response.ok) {
    throw new Error(`RemoteOK API retornou erro ${response.status}`);
  }

  const body = (await response.json()) as RemoteOkJob[];
  const lowerKeywords = keywords?.map((keyword) => keyword.toLowerCase());

  return body
    .filter((job) => job.id && job.position && job.description && job.url)
    .filter((job) => {
      if (!lowerKeywords || lowerKeywords.length === 0) return true;
      const haystack = `${job.position} ${job.description}`.toLowerCase();
      return lowerKeywords.some((keyword) => haystack.includes(keyword));
    })
    .map((job) => ({
      url: job.url!,
      jobTitle: job.position!,
      jobText: htmlToPlainText(job.description!),
      source: "remoteok",
      location: job.location?.trim() || "Remoto",
    }));
}
