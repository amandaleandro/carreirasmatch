import * as cheerio from "cheerio";
import { assertPublicHttpUrl } from "@/lib/url-safety";

const MAX_JOB_TEXT_LENGTH = 12000;
const FETCH_TIMEOUT_MS = 10000;
const USER_AGENT =
  "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36";

export type ScrapeJobResult =
  | { jobTitle: string; jobText: string }
  | { error: string };

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

  return { jobTitle, jobText };
}
