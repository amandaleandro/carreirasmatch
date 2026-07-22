import { prisma } from "@/lib/prisma";
import { searchTalent, type TalentMatch } from "@/lib/talent-search";

/**
 * Match guardado no snapshot da vaga (matchesJson). Nunca inclui contato, só
 * dados neutros usados para exibir a lista. O contato e o status do pedido são
 * resolvidos ao vivo em `hydrateMatches`.
 */
export type StoredVagaMatch = {
  userId: string;
  firstName: string;
  professionalArea: string;
  city: string;
  state: string;
  fitScore: number;
  reason: string;
};

function toStored(matches: TalentMatch[]): StoredVagaMatch[] {
  return matches.map((m) => ({
    userId: m.userId,
    firstName: m.firstName,
    professionalArea: m.professionalArea,
    city: m.city,
    state: m.state,
    fitScore: m.fitScore,
    reason: m.reason,
  }));
}

export function parseStoredMatches(matchesJson: string): StoredVagaMatch[] {
  if (!matchesJson) return [];
  try {
    const parsed = JSON.parse(matchesJson);
    return Array.isArray(parsed) ? (parsed as StoredVagaMatch[]) : [];
  } catch {
    return [];
  }
}

/**
 * Roda o matching do banco de talentos para a vaga, guarda o snapshot (sem
 * contato) em matchesJson e devolve os matches já com status/contato ao vivo.
 */
export async function runVagaMatch(vaga: {
  id: string;
  companyId: string;
  title: string;
  description: string;
  area: string;
  state: string;
}): Promise<TalentMatch[]> {
  const matches = await searchTalent(vaga.companyId, vaga.title, vaga.description, {
    area: vaga.area || undefined,
    state: vaga.state || undefined,
  });

  await prisma.companyVaga.update({
    where: { id: vaga.id },
    data: { matchesJson: JSON.stringify(toStored(matches)), lastMatchedAt: new Date() },
  });

  return matches;
}

/**
 * Reidrata um snapshot guardado com o status atual do pedido de contato (o
 * candidato pode ter aceitado depois) e, quando aceito, com o contato real.
 * Evita re-rodar a IA a cada visita da vaga.
 */
export async function hydrateMatches(
  companyId: string,
  stored: StoredVagaMatch[]
): Promise<TalentMatch[]> {
  if (stored.length === 0) return [];
  const userIds = stored.map((m) => m.userId);

  const requests = await prisma.talentContactRequest.findMany({
    where: { companyId, userId: { in: userIds } },
    select: { userId: true, status: true },
  });
  const statusByUser = new Map(requests.map((r) => [r.userId, r.status]));

  const acceptedIds = requests.filter((r) => r.status === "accepted").map((r) => r.userId);
  const acceptedUsers = acceptedIds.length
    ? await prisma.user.findMany({
        where: { id: { in: acceptedIds } },
        select: { id: true, name: true, email: true, phone: true },
      })
    : [];
  const contactByUser = new Map(acceptedUsers.map((u) => [u.id, u]));

  return stored.map((m) => {
    const rawStatus = statusByUser.get(m.userId);
    const contactStatus: TalentMatch["contactStatus"] =
      rawStatus === "accepted" || rawStatus === "declined" || rawStatus === "pending" ? rawStatus : "none";
    const u = contactByUser.get(m.userId);
    return {
      userId: m.userId,
      firstName: m.firstName,
      professionalArea: m.professionalArea,
      city: m.city,
      state: m.state,
      fitScore: m.fitScore,
      reason: m.reason,
      contactStatus,
      contact:
        contactStatus === "accepted" && u
          ? { name: u.name ?? "", email: u.email ?? "", phone: u.phone ?? "" }
          : null,
    };
  });
}
