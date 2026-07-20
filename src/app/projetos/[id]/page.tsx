import Link from "next/link";
import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import {
  parseSkills,
  categoryLabel,
  formatBudget,
  formatCents,
  averageRating,
} from "@/lib/freelance";
import { ProposalForm } from "@/components/proposal-form";
import { ProposalActions } from "@/components/proposal-actions";
import { ContractPanel } from "@/components/contract-panel";

export const dynamic = "force-dynamic";

type Props = { params: Promise<{ id: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { id } = await params;
  const project = await prisma.freelanceProject.findUnique({ where: { id }, select: { title: true } });
  return { title: project ? project.title : "Projeto não encontrado" };
}

const STATUS_LABEL: Record<string, string> = {
  open: "Aberto",
  in_progress: "Em andamento",
  completed: "Concluído",
  cancelled: "Cancelado",
};

export default async function ProjectDetailPage({ params }: Props) {
  const { id } = await params;
  const [project, session] = await Promise.all([
    prisma.freelanceProject.findUnique({
      where: { id },
      include: { client: { select: { id: true, name: true } } },
    }),
    auth(),
  ]);
  if (!project) notFound();

  const viewerId = session?.user?.id ?? null;
  const isOwner = viewerId === project.clientUserId;
  const skills = parseSkills(project.skills);

  const contract = await prisma.freelanceContract.findUnique({
    where: { projectId: project.id },
    include: {
      client: { select: { name: true } },
      freelancer: { select: { name: true } },
      reviews: { select: { authorUserId: true } },
    },
  });

  // Propostas: o dono vê todas; um freelancer vê só a sua.
  const proposals = isOwner
    ? await prisma.freelanceProposal.findMany({
        where: { projectId: project.id },
        orderBy: [{ status: "asc" }, { createdAt: "asc" }],
        include: {
          freelancer: {
            select: { id: true, name: true, image: true, freelancerProfile: { select: { ratingSum: true, ratingCount: true, headline: true } } },
          },
        },
      })
    : [];

  const myProposal =
    viewerId && !isOwner
      ? await prisma.freelanceProposal.findUnique({
          where: { projectId_freelancerUserId: { projectId: project.id, freelancerUserId: viewerId } },
        })
      : null;

  const viewerIsContractParty =
    contract && (viewerId === contract.clientUserId || viewerId === contract.freelancerUserId);
  const alreadyReviewed = Boolean(contract?.reviews.some((r) => r.authorUserId === viewerId));

  // Thread de conversa (existe quando há contrato). Usada no link "Conversar".
  const thread =
    contract && viewerIsContractParty
      ? await prisma.freelanceThread.findUnique({
          where: { projectId_freelancerUserId: { projectId: project.id, freelancerUserId: contract.freelancerUserId } },
          select: { id: true },
        })
      : null;

  return (
    <div className="max-w-3xl mx-auto px-4 md:px-8 py-10 space-y-8">
      <Link href="/projetos" className="text-sm text-blue-600 dark:text-blue-400 hover:underline">
        ← Todos os projetos
      </Link>

      <header>
        <div className="flex items-center gap-3 flex-wrap">
          <span className="rounded-full bg-neutral-100 dark:bg-white/5 px-3 py-1 text-xs font-semibold">{STATUS_LABEL[project.status] ?? project.status}</span>
          {project.category && <span className="text-sm text-neutral-500">{categoryLabel(project.category)}</span>}
        </div>
        <h1 className="text-2xl md:text-3xl font-bold tracking-tight mt-3">{project.title}</h1>
        <p className="text-sm text-neutral-500 mt-1">
          Publicado por {project.client.name ?? "Contratante"} · {project.proposalCount} proposta(s)
        </p>
        <div className="flex flex-wrap gap-x-6 gap-y-1 mt-4 text-sm">
          <span><span className="text-neutral-500">Orçamento:</span> <span className="font-semibold">{formatBudget(project.budgetType, project.budgetMinCents, project.budgetMaxCents)}</span></span>
          <span><span className="text-neutral-500">Modelo:</span> {project.workModel}</span>
          {project.deadline && <span><span className="text-neutral-500">Prazo:</span> {project.deadline.toLocaleDateString("pt-BR")}</span>}
        </div>
      </header>

      <section>
        <h2 className="text-lg font-semibold mb-2">Descrição</h2>
        <p className="text-neutral-700 dark:text-neutral-300 whitespace-pre-wrap leading-relaxed">{project.description}</p>
      </section>

      {skills.length > 0 && (
        <section>
          <h2 className="text-lg font-semibold mb-3">Habilidades desejadas</h2>
          <div className="flex flex-wrap gap-2">
            {skills.map((s) => (
              <span key={s} className="rounded-full bg-neutral-100 dark:bg-white/5 px-3 py-1 text-sm">{s}</span>
            ))}
          </div>
        </section>
      )}

      {/* Contrato (quando existe e o viewer é parte) */}
      {contract && viewerIsContractParty && thread && (
        <Link href={`/mensagens/${thread.id}`} className="inline-flex items-center gap-1.5 text-sm font-semibold text-blue-600 dark:text-blue-400 hover:underline">
          💬 Conversar com {(viewerId === contract.clientUserId ? contract.freelancer.name : contract.client.name) ?? "a outra parte"}
        </Link>
      )}
      {contract && viewerIsContractParty && (
        <ContractPanel
          contractId={contract.id}
          status={contract.status}
          viewerRole={viewerId === contract.clientUserId ? "client" : "freelancer"}
          agreedLabel={`Valor acordado: ${formatCents(contract.agreedCents)}`}
          counterpartName={(viewerId === contract.clientUserId ? contract.freelancer.name : contract.client.name) ?? "—"}
          alreadyReviewed={alreadyReviewed}
        />
      )}

      {/* Visão do contratante: lista de propostas */}
      {isOwner && (
        <section>
          <h2 className="text-lg font-semibold mb-3">Propostas recebidas ({proposals.length})</h2>
          {proposals.length === 0 ? (
            <p className="text-neutral-500 text-sm">Ainda não há propostas. Elas aparecem aqui assim que chegarem.</p>
          ) : (
            <div className="space-y-4">
              {proposals.map((p) => {
                const prof = p.freelancer.freelancerProfile;
                const avg = prof ? averageRating(prof.ratingSum, prof.ratingCount) : 0;
                return (
                  <div key={p.id} className="rounded-2xl border border-neutral-200 dark:border-neutral-800 p-5">
                    <div className="flex items-start justify-between gap-4">
                      <div>
                        <Link href={`/freelancers/${p.freelancer.id}`} className="font-semibold hover:underline">
                          {p.freelancer.name ?? "Freelancer"}
                        </Link>
                        {prof?.headline && <p className="text-sm text-neutral-500">{prof.headline}</p>}
                        {prof && prof.ratingCount > 0 && <p className="text-sm text-amber-500">★ {avg.toFixed(1)} ({prof.ratingCount})</p>}
                      </div>
                      <div className="text-right shrink-0">
                        <p className="font-semibold">{formatCents(p.bidCents)}</p>
                        {p.estimatedDays && <p className="text-xs text-neutral-500">{p.estimatedDays} dia(s)</p>}
                      </div>
                    </div>
                    <p className="text-sm text-neutral-700 dark:text-neutral-300 mt-3 whitespace-pre-wrap">{p.coverLetter}</p>
                    <div className="flex items-center justify-between mt-4">
                      <span className="text-xs font-medium text-neutral-500">
                        {p.status === "pending" ? "Pendente" : p.status === "accepted" ? "✓ Aceita" : p.status === "rejected" ? "Recusada" : "Retirada"}
                      </span>
                      {project.status === "open" && p.status === "pending" && <ProposalActions proposalId={p.id} />}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </section>
      )}

      {/* Visão do freelancer: enviar proposta ou status da sua */}
      {!isOwner && (
        <section>
          {!viewerId ? (
            <div className="rounded-2xl border border-neutral-200 dark:border-neutral-800 p-6 text-center">
              <p className="text-neutral-600 dark:text-neutral-400">Entre na sua conta para enviar uma proposta.</p>
              <Link href="/login" className="inline-block mt-3 rounded-xl bg-blue-600 px-5 py-2.5 text-sm font-semibold text-white hover:bg-blue-700">Entrar</Link>
            </div>
          ) : myProposal ? (
            <div className="rounded-2xl border border-neutral-200 dark:border-neutral-800 p-6">
              <h2 className="text-lg font-semibold mb-2">Sua proposta</h2>
              <p className="text-sm text-neutral-500">
                Valor: <span className="font-semibold text-neutral-800 dark:text-neutral-200">{formatCents(myProposal.bidCents)}</span>
                {myProposal.estimatedDays ? ` · ${myProposal.estimatedDays} dia(s)` : ""} ·{" "}
                {myProposal.status === "pending" ? "Aguardando resposta" : myProposal.status === "accepted" ? "✓ Aceita — você foi contratado!" : myProposal.status === "rejected" ? "Recusada" : "Retirada"}
              </p>
              <p className="text-sm text-neutral-700 dark:text-neutral-300 mt-3 whitespace-pre-wrap">{myProposal.coverLetter}</p>
            </div>
          ) : project.status === "open" ? (
            <ProposalForm projectId={project.id} />
          ) : (
            <p className="text-neutral-500 text-sm">Este projeto não está mais aceitando propostas.</p>
          )}
        </section>
      )}
    </div>
  );
}
