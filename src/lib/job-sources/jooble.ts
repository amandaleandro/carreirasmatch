import * as cheerio from "cheerio";
import { FetchedJob } from "./types";

const MAX_JOB_TEXT_LENGTH = 12000;

type JoobleJob = {
  title?: string;
  location?: string;
  snippet?: string;
  link?: string;
  company?: string;
  id?: string | number;
};

type JoobleResponse = {
  totalCount: number;
  jobs: JoobleJob[];
};

function htmlToPlainText(html: string): string {
  return cheerio.load(html).text().replace(/\s+/g, " ").trim().slice(0, MAX_JOB_TEXT_LENGTH);
}

export function isJoobleConfigured(): boolean {
  return Boolean(process.env.JOOBLE_API_KEY);
}

// API oficial de parceiro da Jooble (precisa de uma chave gratuita em
// https://jooble.org/api/about). Diferente das outras fontes, essa é uma
// integração documentada e sancionada por eles, não scraping.
export async function fetchJoobleJobs(searchTerm?: string): Promise<FetchedJob[]> {
  const apiKey = process.env.JOOBLE_API_KEY;
  if (!apiKey) return [];

  const response = await fetch(`https://jooble.org/api/${apiKey}`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      keywords: searchTerm ?? "",
      location: "Brasil",
    }),
    signal: AbortSignal.timeout(10000),
  });
  if (!response.ok) {
    throw new Error(`Jooble API retornou erro ${response.status}`);
  }

  const body: JoobleResponse = await response.json();

  return (body.jobs ?? [])
    .filter((job) => job.title && job.snippet && job.link)
    .map((job) => ({
      url: job.link!,
      jobTitle: job.title!,
      jobText: htmlToPlainText(job.snippet!),
      source: "jooble",
      location: job.location || undefined,
    }));
}
