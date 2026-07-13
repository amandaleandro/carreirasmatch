import * as cheerio from "cheerio";
import { FetchedJob } from "./types";

const THE_MUSE_API_URL = "https://www.themuse.com/api/public/jobs";
const MAX_JOB_TEXT_LENGTH = 12000;
const MAX_PAGES = 5;
const LOCATION_HINTS = ["brazil", "brasil", "remote", "latam", "latin america"];

type MuseJob = {
  name: string;
  contents: string;
  refs: { landing_page: string };
  locations?: { name: string }[];
};

type MuseResponse = {
  page_count: number;
  results: MuseJob[];
};

function htmlToPlainText(html: string): string {
  return cheerio
    .load(html)
    .text()
    .replace(/\s+/g, " ")
    .trim()
    .slice(0, MAX_JOB_TEXT_LENGTH);
}

// A API pública do The Muse não filtra de fato pelo parâmetro "location" (o
// total de resultados não muda entre buscas), por isso, como no Arbeitnow,
// buscamos algumas páginas do feed geral e filtramos no cliente por vagas
// remotas/no Brasil e por palavra-chave.
export async function fetchTheMuseJobs(keywords?: string[]): Promise<FetchedJob[]> {
  const allJobs: MuseJob[] = [];

  for (let page = 0; page < MAX_PAGES; page++) {
    const url = new URL(THE_MUSE_API_URL);
    url.searchParams.set("page", String(page));

    const response = await fetch(url.toString(), {
      signal: AbortSignal.timeout(10000),
    });
    if (!response.ok) {
      throw new Error(`The Muse API retornou erro ${response.status}`);
    }

    const body: MuseResponse = await response.json();
    allJobs.push(...body.results);
    if (page + 1 >= body.page_count) break;
  }

  const lowerKeywords = keywords?.map((keyword) => keyword.toLowerCase());

  return allJobs
    .filter((job) => job.name && job.contents && job.refs?.landing_page)
    .filter((job) => {
      const locationText = (job.locations ?? []).map((location) => location.name).join(" ").toLowerCase();
      return LOCATION_HINTS.some((hint) => locationText.includes(hint));
    })
    .filter((job) => {
      if (!lowerKeywords || lowerKeywords.length === 0) return true;
      const haystack = `${job.name} ${job.contents}`.toLowerCase();
      return lowerKeywords.some((keyword) => haystack.includes(keyword));
    })
    .map((job) => ({
      url: job.refs.landing_page,
      jobTitle: job.name,
      jobText: htmlToPlainText(job.contents),
      source: "themuse",
      location: (job.locations ?? []).map((location) => location.name).join(", ") || undefined,
    }));
}
