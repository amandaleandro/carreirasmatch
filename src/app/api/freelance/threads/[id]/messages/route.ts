import { NextResponse } from "next/server";
import { requireAuth } from "@/lib/require-auth";
import { prisma } from "@/lib/prisma";

// Envia uma mensagem numa thread. Só as duas partes (contratante e freelancer)
// podem escrever.
export async function POST(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const { session, response } = await requireAuth();
  if (!session) return response;
  const { id } = await params;

  let body: { body?: string };
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Requisição inválida." }, { status: 400 });
  }
  const text = (body.body ?? "").trim().slice(0, 4000);
  if (!text) return NextResponse.json({ error: "Escreva uma mensagem." }, { status: 400 });

  const thread = await prisma.freelanceThread.findUnique({ where: { id } });
  if (!thread) return NextResponse.json({ error: "Conversa não encontrada." }, { status: 404 });

  const isClient = thread.clientUserId === session.user.id;
  const isFreelancer = thread.freelancerUserId === session.user.id;
  if (!isClient && !isFreelancer) return NextResponse.json({ error: "Sem permissão." }, { status: 403 });

  await prisma.$transaction([
    prisma.freelanceMessage.create({
      data: {
        threadId: id,
        senderUserId: session.user.id,
        body: text,
        // Já lida por quem enviou; não lida pela contraparte.
        readByClient: isClient,
        readByFreelancer: isFreelancer,
      },
    }),
    prisma.freelanceThread.update({ where: { id }, data: { lastMessageAt: new Date() } }),
  ]);

  return NextResponse.json({ ok: true });
}
