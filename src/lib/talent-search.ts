import { prisma } from "@/lib/prisma";
import { rankCandidates, type CandidateInput } from "@/lib/tools";

/** Teto de candidatos por busca, para manter a chamada de IA limitada. */
export const TALENT_SEARCH_POOL_LIMIT = 25;

export type TalentMatch = {
  userId: string;
  firstName: string;
  professionalArea: string;
  city: string;
  state: string;
  fitScore: number;
  reason: string;
  /** Status do pedido de contato desta empresa para este candidato. */
  contactStatus: "none" | "pending" | "accepted" | "declined";
  /** Só preenchido quando contactStatus === "accepted". */
  contact: { name: string; email: string; phone: string } | null;
  isTopPlayer?: boolean;
};

function firstNameOf(name: string | null): string {
  const trimmed = (name ?? "").trim();
  if (!trimmed) return "Candidato";
  return trimmed.split(/\s+/)[0];
}

/**
 * Busca candidatos que deram opt-in (discoverable) e ranqueia pela aderência à
 * vaga informada. Pré-filtra por área/UF quando informados e limita o pool.
 * Nunca expõe contato aqui, só nome, área e cidade; o contato só volta quando
 * já existe um pedido aceito pelo candidato.
 */
export async function searchTalent(
  companyId: string,
  jobTitle: string,
  jobText: string,
  filters: { area?: string; state?: string } = {}
): Promise<TalentMatch[]> {
  const startOfMonth = new Date(new Date().getFullYear(), new Date().getMonth(), 1);
  const [pool, topMonthlyScores] = await Promise.all([
    prisma.user.findMany({
      where: {
        discoverable: true,
        resumes: { some: {} },
        ...(filters.area ? { professionalArea: { contains: filters.area, mode: "insensitive" } } : {}),
        ...(filters.state ? { state: filters.state.toUpperCase() } : {}),
      },
      orderBy: { createdAt: "desc" },
      take: TALENT_SEARCH_POOL_LIMIT,
      select: {
        id: true,
        name: true,
        email: true,
        phone: true,
        professionalArea: true,
        city: true,
        state: true,
        resumes: {
          orderBy: { createdAt: "desc" },
          take: 1,
          select: { rawText: true },
        },
      },
    }),
    prisma.gameScore.findMany({
      where: { createdAt: { gte: startOfMonth } },
      orderBy: { score: "desc" },
      take: 10,
      select: { userId: true },
    }),
  ]);

  const top10UserIds = new Set(topMonthlyScores.map((s) => s.userId));

  const withResume = pool.filter((u) => u.resumes[0]?.rawText?.trim());
  if (withResume.length === 0) return [];

  const candidates: CandidateInput[] = withResume.map((u) => ({
    id: u.id,
    label: firstNameOf(u.name),
    resumeText: u.resumes[0].rawText,
  }));

  const ranking = await rankCandidates(jobTitle, jobText, candidates);
  const scoreById = new Map(ranking.ranking.map((r) => [r.candidateId, r]));

  // Pedidos de contato já existentes desta empresa para os candidatos do pool.
  const requests = await prisma.talentContactRequest.findMany({
    where: { companyId, userId: { in: withResume.map((u) => u.id) } },
    select: { userId: true, status: true },
  });
  const statusByUser = new Map(requests.map((r) => [r.userId, r.status]));

  const matches: TalentMatch[] = withResume.map((u) => {
    const scored = scoreById.get(u.id);
    const rawStatus = statusByUser.get(u.id);
    const contactStatus: TalentMatch["contactStatus"] =
      rawStatus === "accepted" || rawStatus === "declined" || rawStatus === "pending" ? rawStatus : "none";
    return {
      userId: u.id,
      firstName: firstNameOf(u.name),
      professionalArea: u.professionalArea ?? "",
      city: u.city ?? "",
      state: u.state ?? "",
      fitScore: scored?.fitScore ?? 0,
      reason: scored?.reason ?? "",
      contactStatus,
      contact:
        contactStatus === "accepted"
          ? { name: u.name ?? "", email: u.email ?? "", phone: u.phone ?? "" }
          : null,
      isTopPlayer: top10UserIds.has(u.id),
    };
  });

  matches.sort((a, b) => b.fitScore - a.fitScore);
  return matches;
}
