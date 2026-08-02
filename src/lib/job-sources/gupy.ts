import { FetchedJob } from "./types";
import { isBrazilRelevantLocation } from "./location-filter";

// A Gupy expõe uma API de busca global e pública, usada pelo próprio portal
// de vagas (employability-portal.gupy.io), que cobre TODAS as empresas que
// usam a plataforma — não só uma lista fixa. Substitui a abordagem anterior
// (sitemap por empresa + scraping de cada página de vaga), que ficava presa
// a ~34 empresas cadastradas manualmente e era lenta (1 fetch por vaga).
// `pagination.total` da API é bugado (trava em 100 quando limit>=100), então
// pagina por offset até uma página vir com menos linhas que o limit.
const API_URL = "https://employability-portal.gupy.io/api/v1/jobs";
const PAGE_LIMIT = 100;
const MAX_OFFSET = 500; // segurança: até 6 páginas por termo de busca

type GupyJob = {
  id: string | number;
  name: string;
  careerPageName?: string;
  workplaceType?: string;
  isRemoteWork?: boolean;
  city?: string;
  state?: string;
  country?: string;
  jobUrl?: string;
  careerPageUrl?: string;
  publishedDate?: string;
  description?: string;
};

type GupyResponse = {
  data?: GupyJob[];
};

async function fetchPage(query: string, offset: number): Promise<GupyJob[]> {
  const url = new URL(API_URL);
  url.searchParams.set("jobName", query);
  url.searchParams.set("offset", String(offset));
  url.searchParams.set("limit", String(PAGE_LIMIT));

  const response = await fetch(url.toString(), {
    headers: { Accept: "application/json" },
    signal: AbortSignal.timeout(10000),
  });
  if (!response.ok) {
    throw new Error(`API de busca da Gupy retornou erro ${response.status}`);
  }

  const body: GupyResponse = await response.json();
  return body.data ?? [];
}

async function fetchAllPages(query: string): Promise<GupyJob[]> {
  const jobs: GupyJob[] = [];
  let offset = 0;
  while (offset <= MAX_OFFSET) {
    const page = await fetchPage(query, offset);
    jobs.push(...page);
    if (page.length < PAGE_LIMIT) break;
    offset += PAGE_LIMIT;
  }
  return jobs;
}

function jobLocation(job: GupyJob): string | undefined {
  return [job.city, job.state, job.country].filter(Boolean).join(" / ") || undefined;
}

function toFetchedJob(job: GupyJob): FetchedJob | null {
  const url = job.jobUrl || job.careerPageUrl;
  if (!url || !job.name) return null;

  return {
    url,
    jobTitle: job.name,
    jobText: job.description ?? job.name,
    source: "gupy",
    company: job.careerPageName,
    location: jobLocation(job),
  };
}

export async function fetchGupyJobs(
  queries: string | string[] = "Assistente Administrativo",
): Promise<FetchedJob[]> {
  const terms = [...new Set(Array.isArray(queries) ? queries : [queries])].filter(Boolean);
  const jobsById = new Map<string | number, GupyJob>();
  const pagesByTerm = await Promise.all(terms.map((term) => fetchAllPages(term)));
  for (const pages of pagesByTerm) {
    for (const job of pages) jobsById.set(job.id, job);
  }

  const jobs: FetchedJob[] = [];
  for (const job of jobsById.values()) {
    if (!isBrazilRelevantLocation(jobLocation(job))) continue;
    const fetched = toFetchedJob(job);
    if (fetched) jobs.push(fetched);
  }
  return jobs;
}
