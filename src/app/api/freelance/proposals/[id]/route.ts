import { NextResponse } from "next/server";
import { requireAuth } from "@/lib/require-auth";
import { prisma } from "@/lib/prisma";
import { calculateFreelanceCommissionCents, calculateFreelancerPayoutCents } from "@/lib/freelance";
import { sendFreelanceProposalAcceptedEmail, sendFreelanceProposalRejectedEmail } from "@/lib/resend";

// Gerencia uma proposta:
//  - o contratante (dono do projeto) aceita ("accept") ou rejeita ("reject");
//  - o freelancer autor retira ("withdraw").
// Aceitar cria o contrato, coloca o projeto em andamento, rejeita as demais
// propostas e abre a thread de conversa, tudo numa transação.
export async function PATCH(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const { session, response } = await requireAuth();
  if (!session) return response;
  const { id } = await params;

  let body: { action?: string };
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Requisição inválida." }, { status: 400 });
  }
  const action = body.action;

  const proposal = await prisma.freelanceProposal.findUnique({
    where: { id },
    include: { project: true },
  });
  if (!proposal) return NextResponse.json({ error: "Proposta não encontrada." }, { status: 404 });

  const isClient = proposal.project.clientUserId === session.user.id;
  const isFreelancer = proposal.freelancerUserId === session.user.id;

  if (action === "withdraw") {
    if (!isFreelancer) return NextResponse.json({ error: "Sem permissão." }, { status: 403 });
    if (proposal.status !== "pending") {
      return NextResponse.json({ error: "Esta proposta não pode mais ser retirada." }, { status: 409 });
    }
    await prisma.freelanceProposal.update({ where: { id }, data: { status: "withdrawn" } });
    return NextResponse.json({ ok: true });
  }

  if (!isClient) return NextResponse.json({ error: "Sem permissão." }, { status: 403 });
  if (proposal.project.status !== "open") {
    return NextResponse.json({ error: "Este projeto não está mais aberto." }, { status: 409 });
  }

  if (action === "reject") {
    if (proposal.status !== "pending") {
      return NextResponse.json({ error: "Esta proposta já foi resolvida." }, { status: 409 });
    }
    await prisma.freelanceProposal.update({ where: { id }, data: { status: "rejected" } });
    const freelancer = await prisma.user.findUnique({ where: { id: proposal.freelancerUserId } });
    if (freelancer?.email) {
      void sendFreelanceProposalRejectedEmail(freelancer.email, {
        freelancerName: freelancer.name,
        projectTitle: proposal.project.title,
      });
    }
    return NextResponse.json({ ok: true });
  }

  if (action === "accept") {
    if (proposal.status !== "pending") {
      return NextResponse.json({ error: "Esta proposta já foi resolvida." }, { status: 409 });
    }
    const contract = await prisma.$transaction(async (tx) => {
      const created = await tx.freelanceContract.create({
        data: {
          projectId: proposal.projectId,
          proposalId: proposal.id,
          clientUserId: proposal.project.clientUserId,
          freelancerUserId: proposal.freelancerUserId,
          agreedCents: proposal.bidCents,
          platformFeeCents: calculateFreelanceCommissionCents(proposal.bidCents),
          freelancerPayoutCents: calculateFreelancerPayoutCents(proposal.bidCents),
        },
      });
      await tx.freelanceProposal.update({ where: { id: proposal.id }, data: { status: "accepted" } });
      // Rejeita as demais propostas pendentes do projeto.
      await tx.freelanceProposal.updateMany({
        where: { projectId: proposal.projectId, status: "pending", id: { not: proposal.id } },
        data: { status: "rejected" },
      });
      await tx.freelanceProject.update({
        where: { id: proposal.projectId },
        data: { status: "in_progress" },
      });
      // Abre a thread cliente↔freelancer (idempotente pelo unique).
      await tx.freelanceThread.upsert({
        where: {
          projectId_freelancerUserId: {
            projectId: proposal.projectId,
            freelancerUserId: proposal.freelancerUserId,
          },
        },
        create: {
          projectId: proposal.projectId,
          clientUserId: proposal.project.clientUserId,
          freelancerUserId: proposal.freelancerUserId,
        },
        update: {},
      });
      return created;
    });
    const freelancer = await prisma.user.findUnique({ where: { id: proposal.freelancerUserId } });
    if (freelancer?.email) {
      void sendFreelanceProposalAcceptedEmail(freelancer.email, {
        freelancerName: freelancer.name,
        projectTitle: proposal.project.title,
        contractId: contract.id,
      });
    }
    return NextResponse.json({ ok: true, contractId: contract.id });
  }

  return NextResponse.json({ error: "Ação inválida." }, { status: 400 });
}
