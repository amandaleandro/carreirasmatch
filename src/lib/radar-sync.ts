import * as cheerio from "cheerio";
import { prisma } from "@/lib/prisma";
import { recordSync } from "@/lib/external-source-sync";

/**
 * Radares de novos concursos e vestibulares. Coleta itens de feeds RSS de
 * agregadores populares, filtra por relevância (palavras-chave do tema) e grava
 * em RadarItem. Apenas título/link/resumo são guardados; o link aponta para a
 * matéria/edital original na fonte.
 */

export type RadarKind = "concurso" | "vestibular";

const USER_AGENT = "Mozilla/5.0 (compatible; CarreirasMatch/1.0; +https://carreirasmatch.com.br/contato)";

export const RADAR_FEEDS: { kind: RadarKind; name: string; url: string }[] = [
  { kind: "concurso", name: "Gran Cursos", url: "https://blog.grancursosonline.com.br/feed/" },
  { kind: "concurso", name: "Concursos no Brasil", url: "https://www.concursosnobrasil.com/feed/" },
  { kind: "vestibular", name: "Quero Bolsa", url: "https://querobolsa.com.br/revista/feed.xml" },
  { kind: "vestibular", name: "Stoodi", url: "https://blog.stoodi.com.br/feed/" },
  { kind: "vestibular", name: "Guia do Estudante", url: "https://guiadoestudante.abril.com.br/feed/" },
];

const RELEVANCE: Record<RadarKind, RegExp> = {
  concurso:
    /concurso|edital|inscri[cç][aã]o|sele[cç][aã]o|prova|convoca|nomea|banca|gabarito|vagas?/i,
  vestibular:
    /vestibular|enem|sisu|prouni|fies|fuvest|unicamp|uerj|unesp|ufpr|ufrgs|universidade|faculdade|gradua[cç][aã]o|processo seletivo|matr[ií]cula|curso superior|\bmec\b|edital|inscri[cç][aã]o|bolsa|nota de corte|reda[cç][aã]o/i,
};

export function isRelevant(kind: RadarKind, text: string): boolean {
  return RELEVANCE[kind].test(text);
}

export type ParsedFeedItem = {
  title: string;
  url: string;
  summary: string;
  publishedAt: Date | null;
};

function stripHtml(value: string): string {
  return value
    .replace(/<[^>]*>/g, " ")
    .replace(/&nbsp;/g, " ")
    .replace(/&amp;/g, "&")
    .replace(/&#8217;|&#8216;/g, "'")
    .replace(/&#8220;|&#8221;/g, '"')
    .replace(/&#8230;/g, "…")
    .replace(/\s+/g, " ")
    .trim();
}

/** Extrai os itens de um XML de RSS/Atom. Puro (sem I/O) para ser testável. */
export function parseFeedItems(xml: string): ParsedFeedItem[] {
  const $ = cheerio.load(xml, { xmlMode: true });
  const items: ParsedFeedItem[] = [];
  $("item, entry").each((_, element) => {
    const el = $(element);
    const title = stripHtml(el.children("title").first().text());
    // RSS usa <link>texto</link>; Atom usa <link href="...">.
    const rawLink = el.children("link").first().text().trim();
    const url = rawLink || el.children("link").first().attr("href") || "";
    const rawSummary =
      el.children("description").first().text() || el.children("summary").first().text() || "";
    const summary = stripHtml(rawSummary).slice(0, 240);
    const dateText =
      el.children("pubDate").first().text() ||
      el.children("published").first().text() ||
      el.children("updated").first().text();
    const parsed = dateText ? new Date(dateText) : null;
    const publishedAt = parsed && !Number.isNaN(parsed.getTime()) ? parsed : null;
    if (title && url) items.push({ title, url: url.split("#")[0], summary, publishedAt });
  });
  return items;
}

async function fetchFeed(url: string): Promise<string> {
  const response = await fetch(url, {
    headers: { "user-agent": USER_AGENT, accept: "application/rss+xml, application/xml, text/xml, */*" },
    redirect: "follow",
    signal: AbortSignal.timeout(20_000),
  });
  if (!response.ok) throw new Error(`${url}: HTTP ${response.status}`);
  return response.text();
}

export async function syncRadar(kind: RadarKind) {
  return recordSync(`radar-${kind}`, `Radar de ${kind === "concurso" ? "concursos" : "vestibulares"}`, "radar", async () => {
    const feeds = RADAR_FEEDS.filter((feed) => feed.kind === kind);
    const seenAt = new Date();
    const errors: string[] = [];
    let count = 0;

    for (const feed of feeds) {
      try {
        const items = parseFeedItems(await fetchFeed(feed.url));
        for (const item of items) {
          if (!isRelevant(kind, `${item.title} ${item.summary}`)) continue;
          await prisma.radarItem.upsert({
            where: { url: item.url },
            create: {
              kind,
              title: item.title.slice(0, 240),
              url: item.url,
              source: feed.name,
              summary: item.summary,
              publishedAt: item.publishedAt,
              lastSeenAt: seenAt,
            },
            update: {
              title: item.title.slice(0, 240),
              source: feed.name,
              summary: item.summary,
              active: true,
              lastSeenAt: seenAt,
              ...(item.publishedAt ? { publishedAt: item.publishedAt } : {}),
            },
          });
          count += 1;
        }
      } catch (error) {
        errors.push(error instanceof Error ? error.message : String(error));
      }
    }

    // Desativa itens que sumiram dos feeds há mais de 45 dias.
    const cutoff = new Date(seenAt.getTime() - 45 * 24 * 60 * 60 * 1000);
    await prisma.radarItem.updateMany({
      where: { kind, active: true, lastSeenAt: { lt: cutoff } },
      data: { active: false },
    });

    if (errors.length && count === 0) throw new Error(errors.join(" | "));
    return count;
  });
}

export async function syncRadars() {
  const [concurso, vestibular] = await Promise.allSettled([syncRadar("concurso"), syncRadar("vestibular")]);
  return {
    concursos: concurso.status === "fulfilled" ? concurso.value : 0,
    vestibulares: vestibular.status === "fulfilled" ? vestibular.value : 0,
    errors: [concurso, vestibular]
      .filter((r): r is PromiseRejectedResult => r.status === "rejected")
      .map((r) => (r.reason instanceof Error ? r.reason.message : String(r.reason))),
  };
}
