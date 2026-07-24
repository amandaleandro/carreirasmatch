import * as cheerio from "cheerio";

export interface CDLOpportunity {
  externalKey: string;
  title: string;
  company: string;
  description: string;
  url: string;
  city: string;
  state: string;
  type: "vaga" | "curso" | "evento";
}

const CDL_VAGAS_URL = "https://jobs.quickin.io/cdludi/jobs?page=1";
const CDL_CURSOS_URL = "https://loja.cdludi.org.br/compras/cursos";
const CDL_EVENTOS_URL = "https://loja.cdludi.org.br/compras/eventos";

const USER_AGENT = "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.0.0 Safari/537.36";

async function fetchPage(url: string) {
  const res = await fetch(url, {
    headers: {
      "User-Agent": USER_AGENT,
      Accept: "text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8",
    },
    signal: AbortSignal.timeout(20_000),
  });
  if (!res.ok) throw new Error(`HTTP ${res.status} para ${url}`);
  return res.text();
}

export async function scrapeCDLUberlandia(): Promise<CDLOpportunity[]> {
  const results: CDLOpportunity[] = [];

  // 1. Scrape Vagas CDL Talentos / Estágio (Quickin)
  try {
    const htmlVagas = await fetchPage(CDL_VAGAS_URL);
    const $ = cheerio.load(htmlVagas);

    $("a[href*='/jobs/']").each((_, elem) => {
      const link = $(elem).attr("href");
      const titleText = $(elem).text().replace(/\s+/g, " ").trim();

      if (link && titleText && titleText.length > 3) {
        const fullUrl = link.startsWith("http") ? link : `https://jobs.quickin.io${link}`;
        const jobId = link.split("/").pop() || Buffer.from(link).toString("hex").slice(0, 16);

        results.push({
          externalKey: `cdl-udi-job-${jobId}`,
          title: `[CDL Uberlândia] ${titleText}`,
          company: "CDL Talentos / Empresarial",
          description: `Vaga divulgada pela CDL Uberlândia. Link oficial de candidatura: ${fullUrl}`,
          url: fullUrl,
          city: "Uberlândia",
          state: "MG",
          type: "vaga",
        });
      }
    });
  } catch (e) {
    console.error("[CDL Scraper] Erro ao buscar vagas:", e);
  }

  // 2. Scrape Cursos CDL
  try {
    const htmlCursos = await fetchPage(CDL_CURSOS_URL);
    const $ = cheerio.load(htmlCursos);

    $("a[href*='Produto']").each((_, elem) => {
      const link = $(elem).attr("href");
      const rawText = $(elem).text().replace(/\s+/g, " ").trim();

      if (link && rawText.length > 10) {
        const fullUrl = link.startsWith("http") ? link : `https://loja.cdludi.org.br${link}`;
        const titleMatch = rawText.match(/(?:à|\d{4})\s*([^Valor]+)/i);
        const title = titleMatch ? titleMatch[1].trim() : rawText.slice(0, 100);

        results.push({
          externalKey: `cdl-udi-curso-${Buffer.from(fullUrl).toString("hex").slice(0, 24)}`,
          title: `[Curso CDL] ${title}`,
          company: "CDL Uberlândia",
          description: rawText,
          url: fullUrl,
          city: "Uberlândia",
          state: "MG",
          type: "curso",
        });
      }
    });
  } catch (e) {
    console.error("[CDL Scraper] Erro ao buscar cursos:", e);
  }

  // 3. Scrape Eventos CDL
  try {
    const htmlEventos = await fetchPage(CDL_EVENTOS_URL);
    const $ = cheerio.load(htmlEventos);

    $("a[href*='Produto']").each((_, elem) => {
      const link = $(elem).attr("href");
      const rawText = $(elem).text().replace(/\s+/g, " ").trim();

      if (link && rawText.length > 10) {
        const fullUrl = link.startsWith("http") ? link : `https://loja.cdludi.org.br${link}`;

        results.push({
          externalKey: `cdl-udi-evento-${Buffer.from(fullUrl).toString("hex").slice(0, 24)}`,
          title: `[Evento CDL] ${rawText.slice(0, 120)}`,
          company: "CDL Uberlândia",
          description: rawText,
          url: fullUrl,
          city: "Uberlândia",
          state: "MG",
          type: "evento",
        });
      }
    });
  } catch (e) {
    console.error("[CDL Scraper] Erro ao buscar eventos:", e);
  }

  return results;
}
