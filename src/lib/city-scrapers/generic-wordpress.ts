import * as cheerio from "cheerio";
import { CityScraper, ScrapedOpportunity } from "./types";

const USER_AGENT = "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.0.0 Safari/537.36";

export class GenericWordPressCityScraper implements CityScraper {
  cityId: string;
  cityName: string;
  state: string;
  baseUrl: string;

  constructor(cityId: string, cityName: string, state: string, baseUrl: string) {
    this.cityId = cityId;
    this.cityName = cityName;
    this.state = state;
    this.baseUrl = baseUrl.replace(/\/$/, "");
  }

  private async fetchPage(url: string) {
    const res = await fetch(url, {
      headers: {
        "User-Agent": USER_AGENT,
        Accept: "text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8",
      },
      signal: AbortSignal.timeout(15_000),
    });
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    return res.text();
  }

  async scrape(): Promise<ScrapedOpportunity[]> {
    const results: ScrapedOpportunity[] = [];
    const searchTerms = [
      { query: "vagas+sine", type: "vaga" as const },
      { query: "cursos+gratuitos", type: "curso" as const },
      { query: "eventos+inscrições", type: "evento" as const },
    ];

    for (const term of searchTerms) {
      try {
        const searchUrl = `${this.baseUrl}/?s=${term.query}`;
        const html = await this.fetchPage(searchUrl);
        const $ = cheerio.load(html);

        $("article, .post, .entry").each((_, article) => {
          const title = $(article).find("h2, h3, .entry-title, a").first().text().trim();
          const link = $(article).find("a").first().attr("href");
          const snippet = $(article).find("p, .entry-summary").first().text().trim();

          if (link && title && title.length > 8) {
            const key = `wp-${this.cityId}-${Buffer.from(link).toString("hex").slice(0, 24)}`;
            results.push({
              externalKey: key,
              title: `[${this.cityName}] ${title.slice(0, 180)}`,
              company: `Prefeitura de ${this.cityName}`,
              description: snippet || title,
              url: link,
              city: this.cityName,
              state: this.state,
              type: term.type,
            });
          }
        });
      } catch (e) {
        console.error(`[WP Scraper ${this.cityName}] Erro na busca "${term.query}":`, e);
      }
    }

    return results;
  }
}
