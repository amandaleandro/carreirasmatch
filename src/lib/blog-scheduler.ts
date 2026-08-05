import { prisma } from "@/lib/prisma";
import { getSetting, setSetting } from "@/lib/app-settings";
import { VOCATION_AREAS, type VocationAreaConfig } from "@/lib/vocation-areas";
import { TRANSVERSAL_TOPICS, type BlogTopicConfig } from "@/lib/blog-topics";
import { generateBlogPost, gradientIndexForSlug, slugify, validateGeneratedPost } from "@/lib/blog-generator";
import type { Post } from "@/generated/prisma/client";

const NICHE_CURSOR_SETTING_KEY = "blog:niche_cursor";
const TICK_INTERVAL_MS = 15 * 60 * 1000;
const INITIAL_DELAY_MS = 30 * 1000;

// Rodízio único cobrindo os dois pilares do blog: áreas vocacionais e temas
// transversais (currículo, entrevista, ensino médio...). Concatenar em vez de
// intercalar mantém o cursor simples; com 35 áreas + 8 temas, um tema
// transversal aparece a cada ~5 posts (posts/dia padrão = 5).
const ALL_TOPICS: (VocationAreaConfig | BlogTopicConfig)[] = [...VOCATION_AREAS, ...TRANSVERSAL_TOPICS];

function postsPerDay(): number {
  const raw = Number(process.env.BLOG_POSTS_PER_DAY);
  // Uma cadência menor favorece revisão e diferenciação editorial. O limite
  // pode ser aumentado conscientemente por ambiente após revisão humana.
  return Number.isFinite(raw) && raw > 0 ? Math.min(Math.floor(raw), 3) : 1;
}

/** Start of "today" in America/Sao_Paulo, expressed as a UTC Date usable in a Prisma query. */
function startOfTodaySaoPaulo(): Date {
  const now = new Date();
  const spNow = new Date(now.toLocaleString("en-US", { timeZone: "America/Sao_Paulo" }));
  const spMidnight = new Date(spNow.getFullYear(), spNow.getMonth(), spNow.getDate());
  const offsetMs = now.getTime() - spNow.getTime();
  return new Date(spMidnight.getTime() + offsetMs);
}

async function nextNicheCursor(): Promise<number> {
  const stored = await getSetting(NICHE_CURSOR_SETTING_KEY);
  const cursor = stored ? parseInt(stored, 10) % ALL_TOPICS.length : 0;
  return Number.isFinite(cursor) && cursor >= 0 ? cursor : 0;
}

async function uniqueSlug(title: string): Promise<string> {
  const base = slugify(title) || "post";
  let candidate = base;
  let suffix = 2;
  while (await prisma.post.findUnique({ where: { slug: candidate }, select: { id: true } })) {
    candidate = `${base}-${suffix}`;
    suffix += 1;
  }
  return candidate;
}

export async function generateNextPost(): Promise<Post> {
  const cursor = await nextNicheCursor();
  const area = ALL_TOPICS[cursor];

  // Mais títulos recentes = melhor sinal de deduplicação para o gerador não
  // repetir tema nem formato de título dentro da mesma área.
  const recent = await prisma.post.findMany({
    where: { areaSlug: area.slug },
    orderBy: { publishedAt: "desc" },
    take: 15,
    select: { title: true },
  });

  const generated = await generateBlogPost(area, recent.map((p) => p.title));
  validateGeneratedPost(generated);
  const slug = await uniqueSlug(generated.title);

  const post = await prisma.post.create({
    data: {
      slug,
      title: generated.title,
      excerpt: generated.excerpt,
      areaSlug: area.slug,
      areaLabel: area.label,
      coverEmoji: generated.coverEmoji || "📝",
      gradientIdx: gradientIndexForSlug(slug),
      contentJson: JSON.stringify(generated.contentBlocks),
    },
  });

  await setSetting(NICHE_CURSOR_SETTING_KEY, String((cursor + 1) % ALL_TOPICS.length));
  return post;
}

export async function runDailyTick(): Promise<void> {
  // Post mensal do Termômetro (determinístico, dedupe por slug ano-mês);
  // roda fora da cota diária de posts de IA.
  try {
    const { publishMonthlyInsightsPost } = await import("@/lib/insights-post");
    await publishMonthlyInsightsPost();
  } catch (error) {
    console.error("blog-scheduler: failed to publish monthly insights post", error);
  }

  const target = postsPerDay();
  const count = await prisma.post.count({
    where: { publishedAt: { gte: startOfTodaySaoPaulo() } },
  });
  if (count >= target) return;

  try {
    await generateNextPost();
  } catch (error) {
    console.error("blog-scheduler: failed to generate post", error);
  }
}

let started = false;

export function startBlogScheduler(): void {
  if (started) return;
  started = true;

  setTimeout(() => {
    void runDailyTick();
    setInterval(() => void runDailyTick(), TICK_INTERVAL_MS);
  }, INITIAL_DELAY_MS);
}
