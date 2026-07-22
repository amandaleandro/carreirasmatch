import * as cheerio from "cheerio";
import { assertPublicHttpUrl } from "@/lib/url-safety";

const MAX_JOB_TEXT_LENGTH = 12000;
const FETCH_TIMEOUT_MS = 10000;
const USER_AGENT =
  "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36";

export type ScrapeJobResult =
  | { jobTitle: string; jobText: string; location?: string }
  | { error: string };

type JsonLdJobPosting = {
  "@type"?: string | string[];
  title?: string;
  jobLocation?: JsonLdJobLocation | JsonLdJobLocation[];
};

type JsonLdJobLocation = {
  address?: {
    addressLocality?: string;
    addressRegion?: string;
  };
};

function isJobPosting(node: unknown): node is JsonLdJobPosting {
  if (!node || typeof node !== "object") return false;
  const type = (node as { "@type"?: unknown })["@type"];
  return type === "JobPosting" || (Array.isArray(type) && type.includes("JobPosting"));
}

/**
 * Muitos ATSs (Gupy inclusive - o feed dela é otimizado pra Google for Jobs,
 * que exige esse marcador) publicam a vaga como JSON-LD `JobPosting` com
 * `jobLocation.address.{addressLocality,addressRegion}`. Isso é uma fonte de
 * localização muito mais confiável que tentar achar cidade/estado no texto
 * livre da página, quando está presente.
 */
export function extractLocationFromJsonLd($: cheerio.CheerioAPI): string | undefined {
  const scripts = $('script[type="application/ld+json"]');
  for (let i = 0; i < scripts.length; i++) {
    const raw = $(scripts[i]).contents().text().trim();
    if (!raw) continue;

    let parsed: unknown;
    try {
      parsed = JSON.parse(raw);
    } catch {
      continue;
    }

    const candidates = Array.isArray(parsed) ? parsed : [parsed];
    for (const candidate of candidates) {
      const nodes = candidate && typeof candidate === "object" && "@graph" in candidate
        ? (candidate as { "@graph": unknown[] })["@graph"]
        : [candidate];

      for (const node of nodes) {
        if (!isJobPosting(node)) continue;
        const location = Array.isArray(node.jobLocation) ? node.jobLocation[0] : node.jobLocation;
        const locality = location?.address?.addressLocality?.trim();
        const region = location?.address?.addressRegion?.trim();
        if (locality && region) return `${locality}, ${region}`;
        if (locality) return locality;
        if (region) return region;
      }
    }
  }
  return undefined;
}

export async function fetchJobFromUrl(url: string): Promise<ScrapeJobResult> {
  try {
    await assertPublicHttpUrl(url);
  } catch {
    return { error: "Esse link não é permitido. Verifique se a URL está correta." };
  }

  let response: Response;
  try {
    response = await fetch(url, {
      headers: { "User-Agent": USER_AGENT },
      signal: AbortSignal.timeout(FETCH_TIMEOUT_MS),
    });
  } catch {
    return { error: "Não foi possível acessar esse link. Verifique se a URL está correta." };
  }

  if (!response.ok) {
    return { error: `O site retornou um erro (${response.status}) ao tentar acessar essa vaga.` };
  }

  const html = await response.text();
  const $ = cheerio.load(html);
  const location = extractLocationFromJsonLd($);
  $("script, style, nav, footer, header, noscript").remove();

  const jobTitle =
    $("h1").first().text().trim() ||
    $('meta[property="og:title"]').attr("content")?.trim() ||
    $("title").text().trim();

  const contentRoot = $("main").length
    ? $("main")
    : $("article").length
      ? $("article")
      : $("body");

  const jobText = contentRoot
    .text()
    .replace(/\s+/g, " ")
    .trim()
    .slice(0, MAX_JOB_TEXT_LENGTH);

  if (!jobTitle || !jobText) {
    return { error: "Não conseguimos extrair o conteúdo dessa vaga. O site pode bloquear leitura automática." };
  }

  return location ? { jobTitle, jobText, location } : { jobTitle, jobText };
}
