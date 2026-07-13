import * as cheerio from "cheerio";
import { FetchedJob } from "./types";

const HIMALAYAS_API_URL = "https://himalayas.app/jobs/api";
const MAX_JOB_TEXT_LENGTH = 12000;
const PAGE_SIZE = 100;
const MAX_PAGES = 5;
const LOCATION_HINTS = ["brazil", "brasil", "latam", "latin america", "worldwide", "anywhere"];

type HimalayasJob = {
  title: string;
  description: string;
  applicationLink: string;
  locationRestrictions?: string[];
};

type HimalayasResponse = {
  totalCount: number;
  jobs: HimalayasJob[];
};

function htmlToPlainText(html: string): string {
  return cheerio.load(html).text().replace(/\s+/g, " ").trim().slice(0, MAX_JOB_TEXT_LENGTH);
}

// A API pública do Himalayas não filtra de fato pelo parâmetro "country" (a
// lista retornada é idêntica com ou sem o parâmetro), por isso, como no
// Arbeitnow/The Muse, buscamos algumas páginas do feed geral (é 100% remoto)
// e filtramos no cliente por Brasil/LatAm/mundo afora e por palavra-chave.
export async function fetchHimalayasJobs(keywords?: string[]): Promise<FetchedJob[]> {
  const allJobs: HimalayasJob[] = [];

  for (let page = 0; page < MAX_PAGES; page++) {
    const url = new URL(HIMALAYAS_API_URL);
    url.searchParams.set("limit", String(PAGE_SIZE));
    url.searchParams.set("offset", String(page * PAGE_SIZE));

    const response = await fetch(url.toString(), { signal: AbortSignal.timeout(10000) });
    if (!response.ok) {
      throw new Error(`Himalayas API retornou erro ${response.status}`);
    }

    const body: HimalayasResponse = await response.json();
    if (body.jobs.length === 0) break;
    allJobs.push(...body.jobs);
  }

  const lowerKeywords = keywords?.map((keyword) => keyword.toLowerCase());

  return allJobs
    .filter((job) => job.title && job.description && job.applicationLink)
    .filter((job) => {
      const restrictions = job.locationRestrictions ?? [];
      if (restrictions.length === 0) return true;
      const locationText = restrictions.join(" ").toLowerCase();
      return LOCATION_HINTS.some((hint) => locationText.includes(hint));
    })
    .filter((job) => {
      if (!lowerKeywords || lowerKeywords.length === 0) return true;
      const haystack = `${job.title} ${job.description}`.toLowerCase();
      return lowerKeywords.some((keyword) => haystack.includes(keyword));
    })
    .map((job) => ({
      url: job.applicationLink,
      jobTitle: job.title,
      jobText: htmlToPlainText(job.description),
      source: "himalayas",
      location: job.locationRestrictions?.length ? job.locationRestrictions.join(", ") : "Remoto",
    }));
}
