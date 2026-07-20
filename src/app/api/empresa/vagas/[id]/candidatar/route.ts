import { NextResponse } from "next/server";
import { requireAuth } from "@/lib/require-auth";
import { prisma } from "@/lib/prisma";

// Candidato se candidata a uma vaga de empresa publicada no feed.
export async function POST(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const { session, response } = await requireAuth();
  if (!session) return response;

  // Sessão de empresa não se candidata a vagas.
  if (session.user.accountType === "company") {
    return NextResponse.json({ error: "Contas de empresa não podem se candidatar." }, { status: 403 });
  }

  const { id } = await params;
  const vaga = await prisma.companyVaga.findFirst({
    where: { id, publishedToFeed: true, status: "open" },
    select: { id: true },
  });
  if (!vaga) {
    return NextResponse.json({ error: "Vaga indisponível." }, { status: 404 });
  }

  let message = "";
  try {
    const body = await req.json();
    message = typeof body.message === "string" ? body.message.trim().slice(0, 2000) : "";
  } catch {
    // corpo opcional
  }

  await prisma.companyJobApplication.upsert({
    where: { vagaId_userId: { vagaId: vaga.id, userId: session.user.id } },
    create: { vagaId: vaga.id, userId: session.user.id, message },
    update: message ? { message } : {},
  });

  return NextResponse.json({ ok: true });
}
