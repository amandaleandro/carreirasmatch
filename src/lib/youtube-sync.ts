import { prisma } from "@/lib/prisma";
import { recordSync } from "@/lib/external-source-sync";

/**
 * Coleta automática de vídeos gratuitos do YouTube (mentorias e cursos de carreira)
 * via YouTube Data API v3. Mesmo em modo automático, as buscas são "curadas" por
 * um conjunto fixo de termos por nicho para manter a relevância, evitando clickbait
 * e conteúdo fora do tema. Os vídeos são apenas EMBUTIDOS (player oficial); nada é
 * baixado ou rehospedado, em conformidade com os termos do YouTube.
 */

const SEARCH_ENDPOINT = "https://www.googleapis.com/youtube/v3/search";
const VIDEOS_ENDPOINT = "https://www.googleapis.com/youtube/v3/videos";
const MAX_PER_NICHE = 8;

// Tema (rótulo exibido) -> busca educativa. Cada tema consome uma busca da API.
// Além de carreira, o catálogo cobre conhecimentos úteis para estudo, trabalho,
// organização pessoal e desenvolvimento profissional.
export const NICHE_QUERIES: { area: string; query: string }[] = [
  { area: "Carreira", query: "mentoria de carreira como crescer profissionalmente" },
  { area: "Primeiro emprego", query: "como conseguir o primeiro emprego sem experiência" },
  { area: "Entrevista de emprego", query: "como se sair bem na entrevista de emprego dicas" },
  { area: "Currículo", query: "como fazer um currículo que se destaca passo a passo" },
  { area: "Transição de carreira", query: "transição de carreira como mudar de área com segurança" },
  { area: "LinkedIn", query: "como usar o LinkedIn para conseguir emprego" },
  { area: "Concursos", query: "como estudar para concurso público organização e método" },
  { area: "OAB", query: "como passar no exame da OAB primeira fase dicas" },
  { area: "Vestibular e ENEM", query: "como estudar para o ENEM e vestibular técnicas" },
  { area: "Empreendedorismo", query: "empreendedorismo para iniciantes como começar um negócio" },
  { area: "Estágio e aprendiz", query: "como conseguir estágio e programa jovem aprendiz" },
  { area: "Produtividade e estudos", query: "como manter a disciplina e organizar a rotina de estudos" },
  { area: "Tecnologia", query: "curso tecnologia para iniciantes aula completa português" },
  { area: "Informática", query: "curso informática básica aula completa português" },
  { area: "Inglês", query: "curso inglês para iniciantes aula completa português" },
  { area: "Educação financeira", query: "educação financeira para iniciantes aula completa" },
  { area: "Comunicação", query: "comunicação e oratória curso aula completa" },
  { area: "Marketing", query: "marketing digital para iniciantes curso completo" },
  { area: "Gestão e liderança", query: "gestão e liderança curso aula completa" },
  { area: "Excel e produtividade", query: "curso excel para iniciantes aula completa" },
];

type YoutubeSearchItem = {
  id?: { videoId?: string };
  snippet?: {
    title?: string;
    description?: string;
    channelTitle?: string;
    publishedAt?: string;
    thumbnails?: { high?: { url?: string }; medium?: { url?: string }; default?: { url?: string } };
  };
};

/** Converte duração ISO 8601 (ex.: PT1H2M10S) em segundos. */
export function parseIsoDuration(value: string): number {
  const match = /PT(?:(\d+)H)?(?:(\d+)M)?(?:(\d+)S)?/.exec(value);
  if (!match) return 0;
  const [, h, m, s] = match;
  return Number(h ?? 0) * 3600 + Number(m ?? 0) * 60 + Number(s ?? 0);
}

export type CareerVideoRecord = {
  videoId: string;
  title: string;
  channel: string;
  description: string;
  thumbnail: string;
  area: string;
  durationSec: number;
  publishedAt: Date | null;
};

const CONTENT_AREAS: { area: string; terms: RegExp }[] = [
  { area: "Excel e produtividade", terms: /\bexcel\b|planilha|powerpoint|word\b|office\b/i },
  { area: "Tecnologia", terms: /programa[cç][aã]o|desenvolvimento|intelig[eê]ncia artificial|\bia\b|python|javascript|tecnologia/i },
  { area: "Informática", terms: /inform[aá]tica|computador|windows|internet|digita[cç][aã]o/i },
  { area: "Inglês", terms: /ingl[eê]s|english|vocabul[aá]rio|pron[uú]ncia/i },
  { area: "Educação financeira", terms: /finan[cç]|dinheiro|investimento|or[cç]amento|d[ií]vida/i },
  { area: "Comunicação", terms: /comunica[cç][aã]o|orat[oó]ria|falar em p[uú]blico|apresenta[cç][aã]o/i },
  { area: "Marketing", terms: /marketing|tr[aá]fego pago|redes sociais|copywriting|vendas/i },
  { area: "Gestão e liderança", terms: /gest[aã]o|lideran[cç]a|liderar|equipe|administra[cç][aã]o/i },
  { area: "LinkedIn", terms: /linkedin/i },
  { area: "Currículo", terms: /curr[ií]culo|\bcv\b/i },
  { area: "Entrevista de emprego", terms: /entrevista|recrutador|processo seletivo/i },
  { area: "Primeiro emprego", terms: /primeiro emprego|sem experi[eê]ncia/i },
  { area: "Estágio e aprendiz", terms: /est[aá]gio|estagi[aá]rio|jovem aprendiz/i },
  { area: "Transição de carreira", terms: /transi[cç][aã]o de carreira|mudar de (?:carreira|[aá]rea)|nova carreira/i },
  { area: "Concursos", terms: /concurso p[uú]blico|concursado|banca examinadora/i },
  { area: "OAB", terms: /\boab\b|exame da ordem/i },
  { area: "Vestibular e ENEM", terms: /vestibular|\benem\b/i },
  { area: "Empreendedorismo", terms: /empreendedor|neg[oó]cio pr[oó]prio|empresa/i },
  { area: "Produtividade e estudos", terms: /produtividade|estudar|estudos|disciplina|organiza[cç][aã]o|rotina/i },
];

export function classifyVideoArea(fallbackArea: string, title: string, description: string): string {
  const content = `${title} ${description}`;
  return CONTENT_AREAS.find(({ terms }) => terms.test(content))?.area ?? fallbackArea;
}

/**
 * Converte um item de busca do YouTube (+ duração já resolvida) no registro que será
 * gravado. Retorna null quando o item deve ser descartado: sem videoId, ou vídeo muito
 * curto (< 60s = provável Short, não é conteúdo de mentoria/curso).
 */
export function mapSearchItem(area: string, item: YoutubeSearchItem, durationSec: number): CareerVideoRecord | null {
  const videoId = item.id?.videoId;
  if (!videoId) return null;
  if (durationSec > 0 && durationSec < 60) return null;
  const snippet = item.snippet ?? {};
  const thumbnail =
    snippet.thumbnails?.high?.url ?? snippet.thumbnails?.medium?.url ?? snippet.thumbnails?.default?.url ?? "";
  return {
    videoId,
    title: (snippet.title ?? "").slice(0, 240),
    channel: (snippet.channelTitle ?? "").slice(0, 120),
    description: (snippet.description ?? "").slice(0, 500),
    thumbnail,
    area: classifyVideoArea(area, snippet.title ?? "", snippet.description ?? ""),
    durationSec,
    publishedAt: snippet.publishedAt ? new Date(snippet.publishedAt) : null,
  };
}

async function fetchJson(url: string): Promise<unknown> {
  const response = await fetch(url, { signal: AbortSignal.timeout(20_000) });
  if (!response.ok) {
    const body = await response.text().catch(() => "");
    throw new Error(`YouTube API HTTP ${response.status}: ${body.slice(0, 200)}`);
  }
  return response.json();
}

/** Busca durações (em lote) para os videoIds informados. */
async function fetchDurations(apiKey: string, videoIds: string[]): Promise<Map<string, number>> {
  const durations = new Map<string, number>();
  for (let i = 0; i < videoIds.length; i += 50) {
    const batch = videoIds.slice(i, i + 50);
    const url = `${VIDEOS_ENDPOINT}?part=contentDetails&id=${batch.join(",")}&key=${apiKey}`;
    const data = (await fetchJson(url)) as { items?: { id?: string; contentDetails?: { duration?: string } }[] };
    for (const item of data.items ?? []) {
      if (item.id && item.contentDetails?.duration) {
        durations.set(item.id, parseIsoDuration(item.contentDetails.duration));
      }
    }
  }
  return durations;
}

export async function syncYoutubeCareerVideos() {
  return recordSync("youtube-videos", "Vídeos de carreira (YouTube)", "video", async () => {
    const apiKey = process.env.YOUTUBE_API_KEY;
    // Sem chave configurada, a coleta é simplesmente pulada (como as demais fontes externas).
    if (!apiKey) return 0;

    const seenAt = new Date();
    const found = new Map<string, { area: string; item: YoutubeSearchItem }>();

    for (const { area, query } of NICHE_QUERIES) {
      const url =
        `${SEARCH_ENDPOINT}?part=snippet&type=video&videoEmbeddable=true` +
        `&relevanceLanguage=pt&regionCode=BR&safeSearch=strict&order=relevance` +
        `&maxResults=${MAX_PER_NICHE}&q=${encodeURIComponent(query)}&key=${apiKey}`;
      const data = (await fetchJson(url)) as { items?: YoutubeSearchItem[] };
      for (const item of data.items ?? []) {
        const videoId = item.id?.videoId;
        if (videoId && !found.has(videoId)) found.set(videoId, { area, item });
      }
    }

    const durations = await fetchDurations(apiKey, [...found.keys()]);

    let count = 0;
    for (const [videoId, { area, item }] of found) {
      const record = mapSearchItem(area, item, durations.get(videoId) ?? 0);
      if (!record) continue;
      await prisma.careerVideo.upsert({
        where: { videoId },
        create: { ...record, source: "youtube", lastSeenAt: seenAt },
        update: {
          title: record.title,
          channel: record.channel,
          thumbnail: record.thumbnail,
          area: record.area,
          durationSec: record.durationSec,
          active: true,
          lastSeenAt: seenAt,
        },
      });
      count += 1;
    }

    // Desativa vídeos que sumiram das buscas há mais de 60 dias.
    const cutoff = new Date(seenAt.getTime() - 60 * 24 * 60 * 60 * 1000);
    await prisma.careerVideo.updateMany({
      where: { source: "youtube", active: true, lastSeenAt: { lt: cutoff } },
      data: { active: false },
    });

    return count;
  });
}
