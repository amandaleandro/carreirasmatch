import * as cheerio from "cheerio";
import { FetchedJob } from "./types";

const API_URL = "https://remotejobs.org/api/v1/jobs";
const MAX_JOB_TEXT_LENGTH = 12000;
const PAGE_SIZE = 100;
const MAX_PAGES = 5;
const LOCATION_HINTS = ["brazil", "brasil", "latam", "latin america", "worldwide", "anywhere", "global"];
const COUNTRY_RESTRICTED_HINTS = [
  "u.s.",
  "us remote",
  "usa",
  "united states",
  "canada",
  "uk",
  "united kingdom",
  "europe",
  "emea",
  "apac",
  "australia",
  "india",
];

type RemoteJobsOrgJob = {
  title: string;
  url: string;
  description: string;
  location?: string;
};

type RemoteJobsOrgResponse = {
  data: RemoteJobsOrgJob[];
  total: number;
};

function htmlToPlainText(html: string): string {
  return cheerio.load(html).text().replace(/\s+/g, " ").trim().slice(0, MAX_JOB_TEXT_LENGTH);
}

// A API pública do RemoteJobs.org não filtra de fato por palavra-chave (o
// total de resultados não muda), por isso, como nas outras fontes de feed
// geral, buscamos algumas páginas e filtramos no cliente por localidade e
// por palavra-chave.
export async function fetchRemoteJobsOrgJobs(keywords?: string[]): Promise<FetchedJob[]> {
  const allJobs: RemoteJobsOrgJob[] = [];

  for (let page = 0; page < MAX_PAGES; page++) {
    const url = new URL(API_URL);
    url.searchParams.set("limit", String(PAGE_SIZE));
    url.searchParams.set("offset", String(page * PAGE_SIZE));

    const response = await fetch(url.toString(), { signal: AbortSignal.timeout(10000) });
    if (!response.ok) {
      throw new Error(`RemoteJobs.org API retornou erro ${response.status}`);
    }

    const body: RemoteJobsOrgResponse = await response.json();
    if (body.data.length === 0) break;
    allJobs.push(...body.data);
    if (allJobs.length >= body.total) break;
  }

  const lowerKeywords = keywords?.map((keyword) => keyword.toLowerCase());

  return allJobs
    .filter((job) => job.title && job.description && job.url)
    .filter((job) => {
      const location = (job.location ?? "").toLowerCase();
      if (!location) return true;
      if (LOCATION_HINTS.some((hint) => location.includes(hint))) return true;
      if (COUNTRY_RESTRICTED_HINTS.some((hint) => location.includes(hint))) return false;
      return location.includes("remote");
    })
    .filter((job) => {
      if (!lowerKeywords || lowerKeywords.length === 0) return true;
      const haystack = `${job.title} ${job.description}`.toLowerCase();
      return lowerKeywords.some((keyword) => haystack.includes(keyword));
    })
    .map((job) => ({
      url: job.url,
      jobTitle: job.title,
      jobText: htmlToPlainText(job.description),
      source: "remotejobsorg",
      location: job.location || "Remoto",
    }));
}
