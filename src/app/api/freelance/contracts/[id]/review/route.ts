import { NextResponse } from "next/server";
import { requireAuth } from "@/lib/require-auth";
import { prisma } from "@/lib/prisma";

// Avaliação mútua de um contrato concluído. Cada parte avalia a outra uma vez.
// Quando o contratante avalia o freelancer, a nota entra na reputação
// desnormalizada do FreelancerProfile.
export async function POST(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const { session, response } = await requireAuth();
  if (!session) return response;
  const { id } = await params;

  let body: { rating?: unknown; comment?: string };
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Requisição inválida." }, { status: 400 });
  }

  const rating = Math.round(Number(body.rating));
  if (!Number.isFinite(rating) || rating < 1 || rating > 5) {
    return NextResponse.json({ error: "Dê uma nota de 1 a 5." }, { status: 400 });
  }
  const comment = (body.comment ?? "").trim().slice(0, 2000);

  const contract = await prisma.freelanceContract.findUnique({ where: { id } });
  if (!contract) return NextResponse.json({ error: "Contrato não encontrado." }, { status: 404 });
  if (contract.status !== "completed") {
    return NextResponse.json({ error: "Só é possível avaliar após a conclusão." }, { status: 409 });
  }

  const isClient = contract.clientUserId === session.user.id;
  const isFreelancer = contract.freelancerUserId === session.user.id;
  if (!isClient && !isFreelancer) return NextResponse.json({ error: "Sem permissão." }, { status: 403 });

  const direction = isClient ? "client_to_freelancer" : "freelancer_to_client";
  const targetUserId = isClient ? contract.freelancerUserId : contract.clientUserId;

  const existing = await prisma.freelanceReview.findUnique({
    where: { contractId_authorUserId: { contractId: id, authorUserId: session.user.id } },
  });
  if (existing) {
    return NextResponse.json({ error: "Você já avaliou este contrato." }, { status: 409 });
  }

  await prisma.$transaction(async (tx) => {
    await tx.freelanceReview.create({
      data: { contractId: id, authorUserId: session.user.id, targetUserId, direction, rating, comment },
    });
    // A reputação exibida no perfil é do freelancer (avaliado pelo contratante).
    if (direction === "client_to_freelancer") {
      await tx.freelancerProfile.updateMany({
        where: { userId: targetUserId },
        data: { ratingSum: { increment: rating }, ratingCount: { increment: 1 } },
      });
    }
  });

  return NextResponse.json({ ok: true });
}
