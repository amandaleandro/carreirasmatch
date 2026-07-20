import { prisma } from "@/lib/prisma";
import { isEntryLevelVaga } from "@/lib/vaga-fields";

/** URL (relativa) da página pública de uma vaga de empresa no feed. */
export function vagaFeedUrl(vagaId: string): string {
  return `/vagas/empresa/${vagaId}`;
}

type VagaForFeed = {
  id: string;
  title: string;
  description: string;
  area: string;
  state: string;
  workModel?: string;
  seniority?: string;
  jobType?: string;
  salaryMin?: number | null;
  feedJobId: string | null;
};

/**
 * Publica (ou atualiza) a vaga no feed público criando/atualizando um Job espelho.
 * Devolve o id do Job. O Job usa source "empresa" e aponta para a página pública
 * da vaga. Idempotente: reaproveita o Job já existente (feedJobId).
 */
export async function publishVagaToFeed(vaga: VagaForFeed, companyName: string): Promise<string> {
  const data = {
    jobTitle: vaga.title,
    jobText: vaga.description,
    location: vaga.state || "",
    area: vaga.area || "",
    company: companyName,
    source: "empresa",
    workModel: vaga.workModel || "",
    seniority: vaga.seniority || "",
    entryLevel: isEntryLevelVaga(vaga.seniority ?? "", vaga.jobType ?? ""),
    salaryMin: vaga.salaryMin ?? null,
    active: true,
  };

  if (vaga.feedJobId) {
    const existing = await prisma.job.findUnique({ where: { id: vaga.feedJobId }, select: { id: true } });
    if (existing) {
      await prisma.job.update({ where: { id: existing.id }, data });
      return existing.id;
    }
  }

  // url é único: usa a página pública da vaga. Upsert protege contra corrida.
  const job = await prisma.job.upsert({
    where: { url: vagaFeedUrl(vaga.id) },
    create: { url: vagaFeedUrl(vaga.id), ...data },
    update: data,
  });
  return job.id;
}

/** Tira a vaga do feed (desativa o Job espelho, se houver). */
export async function unpublishVagaFromFeed(feedJobId: string | null): Promise<void> {
  if (!feedJobId) return;
  await prisma.job.updateMany({ where: { id: feedJobId }, data: { active: false } });
}
