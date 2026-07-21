import * as cheerio from "cheerio";
import { prisma } from "@/lib/prisma";
import { assertPublicHttpUrl } from "@/lib/url-safety";
import { PDFParse } from "pdf-parse";
import { assessOpportunityRisk } from "@/lib/opportunity-safety";
import { syncYoutubeCareerVideos, classifyVideoArea } from "@/lib/youtube-sync";
import { syncRadars } from "@/lib/radar-sync";

const USER_AGENT = "CarreirasMatch/1.0 (+https://carreirasmatch.com.br/contato)";
const APRENDA_MAIS = "https://aprendamais.mec.gov.br/course/";
const SINE_PI = "https://portal.pi.gov.br/sine/vagas-de-emprego/";
const OPPORTUNITY_TERMS = /vaga|emprego|oportunidade|processo seletivo|trabalho|estágio|aprendiz/i;

async function fetchHtml(url: string) {
  const response = await fetch(url, {
    headers: { "user-agent": USER_AGENT, accept: "text/html,application/xhtml+xml" },
    signal: AbortSignal.timeout(30_000),
  });
  if (!response.ok) throw new Error(`${url}: HTTP ${response.status}`);
  return response.text();
}

function clean(value: string) {
  return value.replace(/\s+/g, " ").trim();
}

export async function recordSync(key: string, label: string, kind: string, run: () => Promise<number>) {
  const startedAt = new Date();
  await prisma.sourceSync.upsert({
    where: { key },
    create: { key, label, kind, lastRunAt: startedAt },
    update: { label, kind, lastRunAt: startedAt },
  });
  try {
    const itemCount = await run();
    await prisma.sourceSync.update({
      where: { key },
      data: { lastSuccessAt: new Date(), itemCount, lastError: "" },
    });
    return itemCount;
  } catch (error) {
    const message = error instanceof Error ? error.message : "Erro desconhecido";
    await prisma.sourceSync.update({
      where: { key },
      data: { lastError: message.slice(0, 1000) },
    });
    throw error;
  }
}

export async function syncAprendaMaisCourses() {
  return recordSync("aprenda-mais", "Aprenda Mais MEC", "course", async () => {
    const root = cheerio.load(await fetchHtml(APRENDA_MAIS));
    const categories = new Map<string, string>();
    root('a[href*="course/index.php?categoryid="]').each((_, element) => {
      const url = root(element).attr("href");
      const area = clean(root(element).text());
      if (url && area && !area.toLowerCase().includes("turmas anteriores") && area !== "Capacitação para Autores") {
        categories.set(url.split("&")[0], area);
      }
    });

    const seenAt = new Date();
    let count = 0;
    for (const [categoryUrl, area] of categories) {
      const $ = cheerio.load(await fetchHtml(categoryUrl));
      const courses = new Map<string, string>();
      $('a[href*="/course/view.php?id="]').each((_, element) => {
        const url = $(element).attr("href");
        const title = clean($(element).text());
        if (url && title) courses.set(url.split("&")[0], title);
      });
      for (const [url, title] of courses) {
        await prisma.externalCourse.upsert({
          where: { url },
          create: {
            title,
            provider: "Aprenda Mais MEC",
            url,
            area,
            modality: "online",
            free: true,
            certificate: true,
            source: "aprenda-mais",
            lastSeenAt: seenAt,
          },
          update: { title, area, active: true, lastSeenAt: seenAt },
        });
        count += 1;
      }
    }
    return count;
  });
}

// Escola Virtual (Fundação Bradesco): plataforma nacional de cursos livres 100%
// gratuitos e com certificado, autoinstrucionais. Diferente da maioria dos sites
// estaduais de SENAI/SENAC (que são SPAs em Angular/React sem URL própria por
// curso, inviáveis de raspar sem um browser completo), o ev.org.br renderiza os
// cards de curso no HTML de cada página de área, com link e título limpos.
const ESCOLA_VIRTUAL_BASE = "https://www.ev.org.br";
const ESCOLA_VIRTUAL_AREAS: { slug: string; area: string }[] = [
  { slug: "analise-de-dados", area: "Análise de Dados" },
  { slug: "desenvolvimento-pessoal-e-profissional", area: "Desenvolvimento Pessoal" },
  { slug: "educacao-e-tecnologia", area: "Educação e Tecnologia" },
  { slug: "inteligencia-artificial", area: "Inteligência Artificial" },
  { slug: "negocios-e-inovacao", area: "Negócios e Inovação" },
  { slug: "produtividade", area: "Produtividade" },
  { slug: "programacao", area: "Programação" },
  { slug: "tecnologia-da-informacao", area: "Tecnologia da Informação" },
];

export async function syncEscolaVirtualCourses() {
  return recordSync("escola-virtual", "Escola Virtual (Fundação Bradesco)", "course", async () => {
    const seenAt = new Date();
    const courses = new Map<string, { title: string; area: string }>();

    for (const { slug, area } of ESCOLA_VIRTUAL_AREAS) {
      const $ = cheerio.load(await fetchHtml(`${ESCOLA_VIRTUAL_BASE}/areas-de-interesse/${slug}`));
      $('a.m-card_link[href^="/cursos/"]').each((_, element) => {
        const href = $(element).attr("href");
        const title = clean($(element).text());
        if (!href || !title) return;
        const url = `${ESCOLA_VIRTUAL_BASE}${href}`;
        if (!courses.has(url)) courses.set(url, { title, area });
      });
    }

    let count = 0;
    for (const [url, { title, area }] of courses) {
      await prisma.externalCourse.upsert({
        where: { url },
        create: {
          title,
          provider: "Fundação Bradesco - Escola Virtual",
          url,
          area,
          modality: "online",
          free: true,
          certificate: true,
          source: "escola-virtual",
          lastSeenAt: seenAt,
        },
        update: { title, area, active: true, lastSeenAt: seenAt },
      });
      count += 1;
    }
    return count;
  });
}

function parsePublishedDate(title: string) {
  const match = title.match(/(\d{1,2}) de ([a-zç]+) de (\d{4})/i);
  if (!match) return null;
  const months: Record<string, number> = {
    janeiro: 0, fevereiro: 1, março: 2, marco: 2, abril: 3, maio: 4, junho: 5,
    julho: 6, agosto: 7, setembro: 8, outubro: 9, novembro: 10, dezembro: 11,
  };
  const month = months[match[2].toLowerCase()];
  if (month === undefined) return null;
  return new Date(Date.UTC(Number(match[3]), month, Number(match[1]), 12));
}

export async function syncSinePiBulletins() {
  return recordSync("sine-pi", "SINE Piauí", "job-bulletin", async () => {
    const $ = cheerio.load(await fetchHtml(SINE_PI));
    const bulletins = new Map<string, string>();
    $('a[href$=".pdf"]').each((_, element) => {
      const url = $(element).attr("href");
      const title = clean($(element).text());
      if (url && /ofertas de vagas/i.test(title)) bulletins.set(url, title);
    });
    const seenAt = new Date();
    let count = 0;
    for (const [url, title] of [...bulletins].slice(0, 30)) {
      await prisma.publicJobBulletin.upsert({
        where: { url },
        create: {
          title,
          url,
          source: "SINE Piauí",
          city: "Diversas cidades",
          state: "PI",
          publishedAt: parsePublishedDate(title),
          lastSeenAt: seenAt,
        },
        update: { title, active: true, lastSeenAt: seenAt, publishedAt: parsePublishedDate(title) },
      });
      count += 1;
    }
    return count;
  });
}

export async function ensureDefaultOpportunitySources() {
  await prisma.opportunitySource.upsert({
    where: { url: SINE_PI },
    create: {
      name: "SINE Piauí",
      url: SINE_PI,
      kind: "job",
      parser: "links",
      state: "PI",
      official: true,
    },
    update: { name: "SINE Piauí", official: true },
  });
}

function absoluteUrl(value: string, base: string) {
  try {
    return new URL(value, base).toString();
  } catch {
    return "";
  }
}

async function extractPdfDetails(url: string) {
  if (!/\.pdf($|\?)/i.test(url)) return null;
  await assertPublicHttpUrl(url);
  const response = await fetch(url, {
    headers: { "user-agent": USER_AGENT, accept: "application/pdf" },
    signal: AbortSignal.timeout(30_000),
  });
  if (!response.ok) return null;
  const parser = new PDFParse({ data: Buffer.from(await response.arrayBuffer()) });
  try {
    const result = await parser.getText();
    const text = clean(result.text).slice(0, 12_000);
    const salary = text.match(/(?:sal[aá]rio|remunera[cç][aã]o)\s*:?\s*(R\$\s?[\d.,]+)/i)?.[1] ?? "";
    const education = text.match(/(?:escolaridade|forma[cç][aã]o)\s*:?\s*([^.;]{3,100})/i)?.[1] ?? "";
    const experience = text.match(/(?:experi[eê]ncia)\s*:?\s*([^.;]{3,100})/i)?.[1] ?? "";
    const quantityRaw = text.match(/(\d{1,3})\s+vagas?/i)?.[1];
    return {
      description: text,
      salary: salary.slice(0, 80),
      education: education.slice(0, 120),
      experience: experience.slice(0, 120),
      quantity: quantityRaw ? Number(quantityRaw) : null,
    };
  } finally {
    await parser.destroy();
  }
}

async function syncOpportunitySource(source: {
  id: string;
  name: string;
  url: string;
  state: string;
  city: string;
  official: boolean;
}) {
  const startedAt = new Date();
  await prisma.opportunitySource.update({ where: { id: source.id }, data: { lastRunAt: startedAt } });
  try {
    await assertPublicHttpUrl(source.url);
    const $ = cheerio.load(await fetchHtml(source.url));
    const items = new Map<string, string>();
    $("a[href]").each((_, element) => {
      const href = absoluteUrl($(element).attr("href") ?? "", source.url);
      const title = clean($(element).text()) || clean($(element).attr("title") ?? "");
      if (!href || !title || title.length < 5) return;
      if (OPPORTUNITY_TERMS.test(title) || /\.pdf($|\?)/i.test(href)) items.set(href, title);
    });

    const seenAt = new Date();
    let count = 0;
    for (const [url, title] of [...items].slice(0, 150)) {
      const existing = await prisma.publicOpportunity.findUnique({
        where: { sourceId_externalKey: { sourceId: source.id, externalKey: url } },
        select: { id: true, description: true },
      });
      const details = !existing?.description && count < 10
        ? await extractPdfDetails(url).catch(() => null)
        : null;
      const risk = assessOpportunityRisk({
        title,
        description: details?.description ?? "",
        url,
        official: source.official,
      });
      await prisma.publicOpportunity.upsert({
        where: { sourceId_externalKey: { sourceId: source.id, externalKey: url } },
        create: {
          sourceId: source.id,
          externalKey: url,
          title: title.slice(0, 240),
          url,
          city: source.city,
          state: source.state,
          official: source.official,
          publishedAt: parsePublishedDate(title),
          lastSeenAt: seenAt,
          ...(details ?? {}),
          riskScore: risk.score,
          riskReasons: JSON.stringify(risk.reasons),
          linkStatus: "ok",
          lastCheckedAt: new Date(),
        },
        update: {
          title: title.slice(0, 240),
          url,
          city: source.city,
          state: source.state,
          official: source.official,
          active: true,
          lastSeenAt: seenAt,
          ...(details ?? {}),
          riskScore: risk.score,
          riskReasons: JSON.stringify(risk.reasons),
          linkStatus: "ok",
          lastCheckedAt: new Date(),
        },
      });
      count += 1;
    }

    await prisma.opportunitySource.update({
      where: { id: source.id },
      data: { lastSuccessAt: new Date(), lastError: "", itemCount: count },
    });
    return count;
  } catch (error) {
    const message = error instanceof Error ? error.message : "Erro desconhecido";
    await prisma.opportunitySource.update({
      where: { id: source.id },
      data: { lastError: message.slice(0, 1000) },
    });
    throw error;
  }
}

export async function syncRegisteredOpportunitySources() {
  await ensureDefaultOpportunitySources();
  const sources = await prisma.opportunitySource.findMany({ where: { active: true, kind: "job" } });
  const results = await Promise.allSettled(sources.map(syncOpportunitySource));
  const opportunities = results.reduce(
    (total, result) => total + (result.status === "fulfilled" ? result.value : 0),
    0,
  );
  const errors = results.flatMap((result) =>
    result.status === "rejected"
      ? [result.reason instanceof Error ? result.reason.message : String(result.reason)]
      : [],
  );

  await prisma.publicOpportunity.updateMany({
    where: {
      active: true,
      OR: [
        { expiresAt: { lt: new Date() } },
        { lastSeenAt: { lt: new Date(Date.now() - 45 * 24 * 60 * 60 * 1000) } },
      ],
    },
    data: { active: false },
  });
  return { opportunities, errors };
}

// Página de DETALHE de um curso: /curso/... ou /cursos/... . Preciso o bastante para não
// pegar links de categoria (/cursosTecnicos), hotsites ou PDFs que sujam a listagem.
const COURSE_PATH = /\/cursos?\//i;
const FREE_TERMS = /gratuit|gr[aá]tis|sem custo|bolsa integral|100% gratu/i;

/**
 * Deriva um título limpo a partir do slug da URL do curso. O texto âncora desses portais vem
 * poluído (badges "PRESENCIAL", categoria, "Matrículas abertas" grudados no nome), enquanto o
 * slug é estruturado: /cursos/app1153-administracao-de-materiais/ → "Administracao De Materiais".
 * Remove o código de prefixo (app1153-, tec0063-) e capitaliza palavras longas.
 */
export function courseTitleFromUrl(href: string): string {
  try {
    const parts = new URL(href).pathname.split("/").filter(Boolean);
    const marker = parts.findIndex((p) => /^cursos?$/i.test(p));
    const raw = (marker >= 0 && parts[marker + 1]) || parts[parts.length - 1] || "";
    const slug = raw.replace(/^[a-z]{1,4}\d{2,6}-/i, "");
    const hadCode = slug !== raw;
    const words = slug.split(/[-_]+/).filter(Boolean);
    if (words.length === 0) return "";
    // Rejeita páginas de CATEGORIA (/cursos/tecnico/, /cursos/graduacao/): slug de 1 palavra,
    // sem código e sem segmentos extras (uuid). Cursos reais têm código, ≥2 palavras ou uuids.
    if (!hadCode && words.length < 2 && parts.length < 3) return "";
    return words.map((w) => (w.length <= 2 ? w : w[0].toUpperCase() + w.slice(1))).join(" ");
  } catch {
    return "";
  }
}

/**
 * Fontes de curso presencial verificadas (SSR, cursos como links reais). Semeadas como
 * OpportunitySource kind="course" para aparecerem no admin, onde podem ser editadas/pausadas.
 * Novas fontes regionais podem ser cadastradas pelo admin sem tocar no código.
 *
 * A maioria dos portais estaduais de SENAI/SENAC (SP, PR, RS-SENAC, EAD SENAC) são SPAs
 * em Angular/React que renderizam os cursos via chamada de API no cliente - sem HTML
 * estático nem URL própria por curso, então não dá pra raspar sem um browser completo
 * (como fazemos com o Indeed via Playwright). Por isso a lista fica pequena: apenas
 * fontes validadas manualmente que servem HTML com os cursos já renderizados.
 */
const DEFAULT_COURSE_SOURCES: { name: string; url: string; state: string; city: string }[] = [
  { name: "SENAI-RS", url: "https://cursos.senairs.org.br/", state: "RS", city: "" },
];

export async function ensureDefaultCourseSources() {
  for (const source of DEFAULT_COURSE_SOURCES) {
    await prisma.opportunitySource.upsert({
      where: { url: source.url },
      create: { ...source, kind: "course", parser: "links", official: true },
      update: { name: source.name, kind: "course", official: true },
    });
  }

  // SENAC-RS foi migrado para SPA (Angular) sem HTML estático e sempre retornava
  // 0 cursos; desativa a fonte cadastrada anteriormente para parar de gastar
  // ciclos de sync com ela.
  await prisma.opportunitySource.updateMany({
    where: { url: "https://www.senacrs.com.br/cursosLivres", kind: "course" },
    data: { active: false },
  });
}

/**
 * Fonte de cursos cadastrada no admin (OpportunitySource kind="course"). Raspa os links
 * de curso da página e grava em ExternalCourse. Usada principalmente para cursos
 * PRESENCIAIS por cidade/estado (SENAI/SENAC regionais, Escola do Trabalhador etc.),
 * já que os online federais vêm do Aprenda Mais MEC.
 */
async function syncCourseSource(source: {
  id: string;
  name: string;
  url: string;
  state: string;
  city: string;
}) {
  const startedAt = new Date();
  await prisma.opportunitySource.update({ where: { id: source.id }, data: { lastRunAt: startedAt } });
  try {
    await assertPublicHttpUrl(source.url);
    const $ = cheerio.load(await fetchHtml(source.url));
    const items = new Map<string, string>();
    $("a[href]").each((_, element) => {
      const href = absoluteUrl($(element).attr("href") ?? "", source.url);
      if (!href || href === source.url || !COURSE_PATH.test(href)) return;
      const title = courseTitleFromUrl(href);
      if (title.length < 5) return;
      items.set(href, title);
    });

    // Presencial quando a fonte tem localização; caso contrário assume online.
    const modality = source.city || source.state ? "presencial" : "online";
    const seenAt = new Date();
    let count = 0;
    for (const [url, title] of [...items].slice(0, 150)) {
      const free = FREE_TERMS.test(title);
      const area = classifyVideoArea("", title, "");
      await prisma.externalCourse.upsert({
        where: { url },
        create: {
          title: title.slice(0, 240),
          provider: source.name,
          url,
          area,
          city: source.city,
          state: source.state,
          modality,
          free,
          certificate: false,
          source: `opp:${source.id}`,
          lastSeenAt: seenAt,
        },
        update: {
          title: title.slice(0, 240),
          provider: source.name,
          area,
          city: source.city,
          state: source.state,
          modality,
          free,
          active: true,
          lastSeenAt: seenAt,
        },
      });
      count += 1;
    }

    await prisma.opportunitySource.update({
      where: { id: source.id },
      data: { lastSuccessAt: new Date(), lastError: "", itemCount: count },
    });
    return count;
  } catch (error) {
    const message = error instanceof Error ? error.message : "Erro desconhecido";
    await prisma.opportunitySource.update({
      where: { id: source.id },
      data: { lastError: message.slice(0, 1000) },
    });
    throw error;
  }
}

export async function syncRegisteredCourseSources() {
  await ensureDefaultCourseSources();
  const sources = await prisma.opportunitySource.findMany({ where: { active: true, kind: "course" } });
  const results = await Promise.allSettled(sources.map(syncCourseSource));
  const courses = results.reduce(
    (total, result) => total + (result.status === "fulfilled" ? result.value : 0),
    0,
  );
  const errors = results.flatMap((result) =>
    result.status === "rejected"
      ? [result.reason instanceof Error ? result.reason.message : String(result.reason)]
      : [],
  );

  // Desativa cursos cadastrados que sumiram da fonte há mais de 45 dias.
  await prisma.externalCourse.updateMany({
    where: {
      source: { startsWith: "opp:" },
      active: true,
      lastSeenAt: { lt: new Date(Date.now() - 45 * 24 * 60 * 60 * 1000) },
    },
    data: { active: false },
  });
  return { courses, errors };
}

export async function syncAllExternalSources() {
  const results = await Promise.allSettled([
    syncAprendaMaisCourses(),
    syncSinePiBulletins(),
    syncRegisteredOpportunitySources(),
    syncRegisteredCourseSources(),
    syncYoutubeCareerVideos(),
    syncRadars(),
    syncEscolaVirtualCourses(),
  ]);
  const errors = results.flatMap((result) =>
    result.status === "rejected"
      ? [result.reason instanceof Error ? result.reason.message : String(result.reason)]
      : result.value && typeof result.value === "object" && "errors" in result.value
        ? result.value.errors
        : [],
  );
  const registeredCourses =
    results[3].status === "fulfilled" && typeof results[3].value === "object"
      ? results[3].value.courses
      : 0;
  const escolaVirtualCourses = results[6].status === "fulfilled" ? results[6].value : 0;
  return {
    courses:
      (results[0].status === "fulfilled" ? results[0].value : 0) + registeredCourses + escolaVirtualCourses,
    bulletins: results[1].status === "fulfilled" ? results[1].value : 0,
    opportunities:
      results[2].status === "fulfilled" && typeof results[2].value === "object"
        ? results[2].value.opportunities
        : 0,
    videos: results[4].status === "fulfilled" ? results[4].value : 0,
    concursos:
      results[5].status === "fulfilled" && typeof results[5].value === "object"
        ? results[5].value.concursos
        : 0,
    vestibulares:
      results[5].status === "fulfilled" && typeof results[5].value === "object"
        ? results[5].value.vestibulares
        : 0,
    errors,
  };
}
