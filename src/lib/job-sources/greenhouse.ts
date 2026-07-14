import * as cheerio from "cheerio";
import { FetchedJob } from "./types";
import { isBrazilRelevantLocation } from "./location-filter";

const BOARD_API_URL = "https://boards-api.greenhouse.io/v1/boards/{board}/jobs";
const MAX_JOB_TEXT_LENGTH = 12000;
const DEFAULT_BOARDS = [
  "rdstation",
  "arcoeducacao",
  "xpinc",
  "zupinnovation",
  "capco",
  "nubank",
  "cloudwalk",
  "quintoandar",
  "hotmart",
  "gympass",
  "wellhub",
];

type GreenhouseJob = {
  id: number;
  title: string;
  content: string;
  absolute_url: string;
  location?: { name?: string };
};

type GreenhouseResponse = {
  jobs: GreenhouseJob[];
};

function htmlToPlainText(html: string): string {
  return cheerio.load(html).text().replace(/\s+/g, " ").trim().slice(0, MAX_JOB_TEXT_LENGTH);
}

// Greenhouse (ATS) expõe um job board público por empresa, sem necessidade de
// chave (https://developers.greenhouse.io/job-board.html). Mesmo padrão de
// lista de empresas via env usado para Gupy/Sólides.
export function isGreenhouseConfigured(): boolean {
  return getGreenhouseBoards().length > 0;
}

export function getGreenhouseBoards(): string[] {
  const raw = process.env.GREENHOUSE_BOARDS;
  if (!raw) return DEFAULT_BOARDS;

  return raw
    .split(",")
    .map((board) => board.trim())
    .filter(Boolean);
}

async function fetchBoardJobs(board: string): Promise<FetchedJob[]> {
  const url = new URL(BOARD_API_URL.replace("{board}", board));
  url.searchParams.set("content", "true");

  const response = await fetch(url.toString(), { signal: AbortSignal.timeout(10000) });
  if (!response.ok) {
    throw new Error(`Greenhouse API (${board}) retornou erro ${response.status}`);
  }

  const body: GreenhouseResponse = await response.json();

  return body.jobs
    .filter((job) => job.title && job.content && job.absolute_url)
    .filter((job) => isBrazilRelevantLocation(job.location?.name))
    .map((job) => ({
      url: job.absolute_url,
      jobTitle: job.title,
      jobText: htmlToPlainText(job.content),
      source: "greenhouse",
      location: job.location?.name,
    }));
}

export async function fetchGreenhouseJobs(
  boards: string[] = getGreenhouseBoards(),
  keywords?: string[]
): Promise<FetchedJob[]> {
  if (boards.length === 0) return [];

  const perBoard = await Promise.allSettled(boards.map(fetchBoardJobs));

  const jobsByUrl = new Map<string, FetchedJob>();
  for (const result of perBoard) {
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
