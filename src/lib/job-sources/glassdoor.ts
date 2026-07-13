import * as cheerio from "cheerio";
import { FetchedJob } from "./types";

const API_URL = "http://api.glassdoor.com/api/api.htm";

// ATENÇÃO: a Glassdoor Jobs API é uma API de parceiro (precisa virar parceiro
// homologado com eles, não é cadastro self-service). A seção da documentação
// com o nome exato da ação de busca de vagas e seus parâmetros só é visível
// logado como parceiro aprovado, não tive acesso a ela. O que está abaixo
// segue a estrutura genérica documentada publicamente (v, format, t.p, t.k,
// userip, useragent, action, q) com "action=jobs" e "q=<termo>" como palpite
// pela convenção usada nos outros exemplos da doc (ex.: action=employers).
// Precisa ser confirmado/ajustado assim que houver acesso de parceiro real, 
// os nomes dos campos de resposta abaixo (jobListings/jobTitle/jobViewUrl/
// description) também são um palpite e provavelmente vão precisar de ajuste.
const MAX_JOB_TEXT_LENGTH = 12000;

type GlassdoorJobListing = {
  jobTitle?: string;
  jobViewUrl?: string;
  description?: string;
};

type GlassdoorResponse = {
  success: boolean;
  status: string;
  response?: {
    jobListings?: GlassdoorJobListing[];
  };
};

function htmlToPlainText(html: string): string {
  return cheerio.load(html).text().replace(/\s+/g, " ").trim().slice(0, MAX_JOB_TEXT_LENGTH);
}

export function isGlassdoorConfigured(): boolean {
  return Boolean(process.env.GLASSDOOR_PARTNER_ID && process.env.GLASSDOOR_PARTNER_KEY);
}

export async function fetchGlassdoorJobs(
  searchTerm: string | undefined,
  userIp: string,
  userAgent: string
): Promise<FetchedJob[]> {
  const partnerId = process.env.GLASSDOOR_PARTNER_ID;
  const partnerKey = process.env.GLASSDOOR_PARTNER_KEY;
  if (!partnerId || !partnerKey) return [];

  const url = new URL(API_URL);
  url.searchParams.set("v", "1");
  url.searchParams.set("format", "json");
  url.searchParams.set("t.p", partnerId);
  url.searchParams.set("t.k", partnerKey);
  url.searchParams.set("userip", userIp);
  url.searchParams.set("useragent", userAgent);
  url.searchParams.set("action", "jobs");
  if (searchTerm) url.searchParams.set("q", searchTerm);

  const response = await fetch(url.toString(), { signal: AbortSignal.timeout(10000) });
  if (!response.ok) {
    throw new Error(`Glassdoor API retornou erro ${response.status}`);
  }

  const body: GlassdoorResponse = await response.json();
  if (!body.success) {
    throw new Error(`Glassdoor API: ${body.status}`);
  }

  const listings = body.response?.jobListings;
  if (!Array.isArray(listings)) {
    throw new Error(
      "formato de resposta inesperado (parâmetros/ação da API ainda não confirmados com a doc de parceiro)"
    );
  }

  return listings
    .filter((job) => job.jobTitle && job.jobViewUrl && job.description)
    .map((job) => ({
      url: job.jobViewUrl!,
      jobTitle: job.jobTitle!,
      jobText: htmlToPlainText(job.description!),
      source: "glassdoor",
    }));
}
