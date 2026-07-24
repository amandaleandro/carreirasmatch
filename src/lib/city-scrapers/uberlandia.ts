import * as cheerio from "cheerio";
import { CityScraper, ScrapedOpportunity } from "./types";

const BASE_URL = "https://www.uberlandia.mg.gov.br";

const USER_AGENT = "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.0.0 Safari/537.36";

async function fetchPage(url: string) {
  const res = await fetch(url, {
    headers: {
      "User-Agent": USER_AGENT,
      Accept: "text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8",
      "Accept-Language": "pt-BR,pt;q=0.9",
    },
    signal: AbortSignal.timeout(20_000),
  });
  if (!res.ok) throw new Error(`HTTP ${res.status} para ${url}`);
  return res.text();
}

export class UberlandiaPrefeituraScraper implements CityScraper {
  cityId = "uberlandia-prefeitura";
  cityName = "Uberlândia";
  state = "MG";

  async scrape(): Promise<ScrapedOpportunity[]> {
    const results: ScrapedOpportunity[] = [];

    // 1. Raspar Vagas e SINE da Prefeitura
    try {
      const vagasSearchUrl = `${BASE_URL}/?s=vagas+sine`;
      const htmlSearch = await fetchPage(vagasSearchUrl);
      const $search = cheerio.load(htmlSearch);

      const postUrls: string[] = [];
      $search("article").each((_, article) => {
        const link = $search(article).find("a").attr("href");
        if (link && !postUrls.includes(link)) {
          postUrls.push(link);
        }
      });

      // Processar os últimos artigos do SINE Uberlândia
      for (const postUrl of postUrls.slice(0, 5)) {
        try {
          const postHtml = await fetchPage(postUrl);
          const $post = cheerio.load(postHtml);
          const postTitle = $post("h1").text().trim() || $post("title").text().trim();

          $post("p").each((_, p) => {
            const text = $post(p).text().trim();
            if (text.includes("CÓDIGO:") || text.includes("VAGA") || text.includes("Salário")) {
              const codeMatch = text.match(/CÓDIGO:\s*(\d+)/i);
              const vagaMatch = text.match(/(\d+\s*VAGAS?:?\s*([^Salário\n]+))/i);
              const salarioMatch = text.match(/Salário:\s*([^\n\r]+)/i);

              const code = codeMatch ? codeMatch[1] : null;
              const titleClean = vagaMatch ? vagaMatch[1].trim() : text.slice(0, 100);

              if (titleClean && titleClean.length > 5) {
                const uniqueKey = code ? `sine-udicod-${code}` : `sine-udi-${Buffer.from(text.slice(0, 50)).toString("hex")}`;
                results.push({
                  externalKey: uniqueKey,
                  title: `[SINE Uberlândia] ${titleClean.slice(0, 180)}`,
                  company: "SINE Uberlândia / Prefeitura",
                  description: text,
                  url: postUrl,
                  city: "Uberlândia",
                  state: "MG",
                  salary: salarioMatch ? salarioMatch[1].trim() : "",
                  type: "vaga",
                });
              }
            }
          });
        } catch (e) {
          console.error(`[Uberlândia Scraper] Erro ao raspar post ${postUrl}:`, e);
        }
      }
    } catch (e) {
      console.error("[Uberlândia Scraper] Erro ao buscar vagas no portal:", e);
    }

    // 2. Raspar Cursos e Capacitações da Prefeitura (Desenvolvimento Social / Qualifica)
    try {
      const cursosSearchUrl = `${BASE_URL}/?s=cursos+capacitacao+gratuito`;
      const htmlCursos = await fetchPage(cursosSearchUrl);
      const $cursos = cheerio.load(htmlCursos);

      $cursos("article").each((_, article) => {
        const title = $cursos(article).find("h2, h3, .entry-title").text().trim();
        const link = $cursos(article).find("a").attr("href");
        const summary = $cursos(article).find("p, .entry-summary").text().trim();

        if (link && title) {
          results.push({
            externalKey: `pref-udi-curso-${Buffer.from(link).toString("hex").slice(0, 24)}`,
            title: `[Prefeitura UDI] ${title.slice(0, 180)}`,
            company: "Prefeitura de Uberlândia / Desenvol. Social",
            description: summary || title,
            url: link,
            city: "Uberlândia",
            state: "MG",
            type: "curso",
          });
        }
      });
    } catch (e) {
      console.error("[Uberlândia Scraper] Erro ao buscar cursos no portal:", e);
    }

    return results;
  }
}
