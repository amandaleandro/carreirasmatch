import { prisma } from "@/lib/prisma";

/**
 * Agregados anônimos do banco de análises para a página pública /insights.
 * Cache em memória por 6h: os números mudam devagar e a query mais pesada
 * (parse de keywordsMissing das análises recentes) não deve rodar a cada view.
 */

export type MarketInsights = {
  totalAnalyses: number;
  averageScore: number;
  applyNowPercent: number;
  topMissingKeywords: { term: string; count: number }[];
  scoreByTrack: { track: string; averageScore: number; count: number }[];
};

const CACHE_TTL_MS = 6 * 60 * 60 * 1000;
let cached: { value: MarketInsights; expiresAt: number } | null = null;

/** Normaliza um termo para agrupar variações ("Excel Avançado" ≈ "excel avançado"). */
function normalizeTerm(term: string): string {
  return term.toLowerCase().replace(/\s+/g, " ").trim();
}

/** Capitaliza para exibição mantendo siglas curtas em maiúsculas (SQL, CRM...). */
function displayTerm(term: string): string {
  if (term.length <= 4 && !term.includes(" ")) return term.toUpperCase();
  return term;
}

export async function getMarketInsights(): Promise<MarketInsights> {
  if (cached && cached.expiresAt > Date.now()) return cached.value;

  const [totalAnalyses, overallAgg, applyNowCount, byTrack, recent] = await Promise.all([
    prisma.analysis.count(),
    prisma.analysis.aggregate({ _avg: { overallScore: true } }),
    prisma.analysis.count({ where: { applicationStatus: "apply_now" } }),
    prisma.analysis.groupBy({
      by: ["careerTrack"],
      _avg: { overallScore: true },
      _count: { _all: true },
    }),
    prisma.analysis.findMany({
      select: { keywordsMissing: true },
      orderBy: { createdAt: "desc" },
      take: 2000,
    }),
  ]);

  const counts = new Map<string, number>();
  for (const row of recent) {
    try {
      const terms = JSON.parse(row.keywordsMissing) as string[];
      // Set por análise: o mesmo termo repetido numa análise conta uma vez.
      for (const term of new Set(terms.map(normalizeTerm))) {
        if (!term || term.length > 40) continue;
        counts.set(term, (counts.get(term) ?? 0) + 1);
      }
    } catch {
      // linha antiga/malformada, ignora
    }
  }

  const topMissingKeywords = [...counts.entries()]
    .sort((a, b) => b[1] - a[1])
    .slice(0, 15)
    .map(([term, count]) => ({ term: displayTerm(term), count }));

  const scoreByTrack = byTrack
    .map((t) => ({
      track: t.careerTrack,
      averageScore: Math.round(t._avg.overallScore ?? 0),
      count: t._count._all,
    }))
    .filter((t) => t.count >= 10)
    .sort((a, b) => b.averageScore - a.averageScore);

  const value: MarketInsights = {
    totalAnalyses,
    averageScore: Math.round(overallAgg._avg.overallScore ?? 0),
    applyNowPercent: totalAnalyses > 0 ? Math.round((applyNowCount / totalAnalyses) * 100) : 0,
    topMissingKeywords,
    scoreByTrack,
  };

  cached = { value, expiresAt: Date.now() + CACHE_TTL_MS };
  return value;
}
