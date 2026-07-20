import { NextResponse } from "next/server";
import { requireAuth } from "@/lib/require-auth";
import { prisma } from "@/lib/prisma";
import { reaisToCents } from "@/lib/freelance";

// Freelancer envia uma proposta a um projeto aberto.
export async function POST(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const { session, response } = await requireAuth();
  if (!session) return response;
  const { id: projectId } = await params;

  let body: { coverLetter?: string; bid?: unknown; estimatedDays?: unknown };
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Requisição inválida." }, { status: 400 });
  }

  const coverLetter = (body.coverLetter ?? "").trim().slice(0, 4000);
  const bidCents = reaisToCents(body.bid);
  const daysNum = Number(body.estimatedDays);
  const estimatedDays = Number.isFinite(daysNum) && daysNum > 0 ? Math.round(daysNum) : null;

  if (!coverLetter) {
    return NextResponse.json({ error: "Escreva uma mensagem para o contratante." }, { status: 400 });
  }
  if (bidCents == null) {
    return NextResponse.json({ error: "Informe o valor da sua proposta." }, { status: 400 });
  }

  const project = await prisma.freelanceProject.findUnique({ where: { id: projectId } });
  if (!project) return NextResponse.json({ error: "Projeto não encontrado." }, { status: 404 });
  if (project.status !== "open") {
    return NextResponse.json({ error: "Este projeto não está mais aceitando propostas." }, { status: 409 });
  }
  if (project.clientUserId === session.user.id) {
    return NextResponse.json({ error: "Você não pode enviar proposta ao seu próprio projeto." }, { status: 403 });
  }

  const existing = await prisma.freelanceProposal.findUnique({
    where: { projectId_freelancerUserId: { projectId, freelancerUserId: session.user.id } },
  });
  if (existing) {
    return NextResponse.json({ error: "Você já enviou uma proposta para este projeto." }, { status: 409 });
  }

  const proposal = await prisma.$transaction(async (tx) => {
    const created = await tx.freelanceProposal.create({
      data: { projectId, freelancerUserId: session.user.id, coverLetter, bidCents, estimatedDays },
    });
    await tx.freelanceProject.update({
      where: { id: projectId },
      data: { proposalCount: { increment: 1 } },
    });
    return created;
  });

  return NextResponse.json({ id: proposal.id });
}
