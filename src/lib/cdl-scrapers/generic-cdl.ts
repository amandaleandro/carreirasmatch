import * as cheerio from "cheerio";
import { CDLOpportunity } from "./cdl-uberlandia";

const USER_AGENT = "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.0.0 Safari/537.36";

export interface CDLConfig {
  id: string;
  cityName: string;
  state: string;
  domain: string;
  quickinSlug?: string;
}

export async function scrapeGenericCDL(config: CDLConfig): Promise<CDLOpportunity[]> {
  const results: CDLOpportunity[] = [];
  const baseUrl = config.domain.replace(/\/$/, "");

  // 1. Se possuir Quickin / Plataforma de vagas da CDL
  if (config.quickinSlug) {
    try {
      const quickinUrl = `https://jobs.quickin.io/${config.quickinSlug}/jobs?page=1`;
      const res = await fetch(quickinUrl, { headers: { "User-Agent": USER_AGENT } });
      if (res.ok) {
        const html = await res.text();
        const $ = cheerio.load(html);

        $("a[href*='/jobs/']").each((_, elem) => {
          const link = $(elem).attr("href");
          const title = $(elem).text().replace(/\s+/g, " ").trim();
          if (link && title) {
            const fullUrl = link.startsWith("http") ? link : `https://jobs.quickin.io${link}`;
            results.push({
              externalKey: `cdl-${config.id}-job-${Buffer.from(link).toString("hex").slice(0, 16)}`,
              title: `[CDL ${config.cityName}] ${title}`,
              company: `CDL ${config.cityName}`,
              description: `Vaga de emprego/estágio divulgada pela CDL ${config.cityName}. Link: ${fullUrl}`,
              url: fullUrl,
              city: config.cityName,
              state: config.state,
              type: "vaga",
            });
          }
        });
      }
    } catch (e) {
      console.error(`[CDL Scraper ${config.cityName}] Erro Quickin:`, e);
    }
  }

  // 2. Cursos e Eventos no site da CDL
  try {
    const resSite = await fetch(baseUrl, { headers: { "User-Agent": USER_AGENT }, signal: AbortSignal.timeout(15_000) });
    if (resSite.ok) {
      const html = await resSite.text();
      const $ = cheerio.load(html);

      $("a[href*='curso'], a[href*='evento'], a[href*='capacitacao']").each((_, elem) => {
        const link = $(elem).attr("href");
        const title = $(elem).text().replace(/\s+/g, " ").trim();

        if (link && title && title.length > 8 && !title.toLowerCase().includes("ver todos")) {
          const fullUrl = link.startsWith("http") ? link : `${baseUrl}${link.startsWith("/") ? "" : "/"}${link}`;
          const isCurso = title.toLowerCase().includes("curso") || link.toLowerCase().includes("curso");

          results.push({
            externalKey: `cdl-${config.id}-${Buffer.from(fullUrl).toString("hex").slice(0, 24)}`,
            title: `[CDL ${config.cityName}] ${title.slice(0, 180)}`,
            company: `CDL ${config.cityName}`,
            description: title,
            url: fullUrl,
            city: config.cityName,
            state: config.state,
            type: isCurso ? "curso" : "evento",
          });
        }
      });
    }
  } catch (e) {
    console.error(`[CDL Scraper ${config.cityName}] Erro no portal:`, e);
  }

  return results;
}
