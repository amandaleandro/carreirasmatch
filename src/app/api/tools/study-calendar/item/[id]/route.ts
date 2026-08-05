import { NextRequest, NextResponse } from "next/server";
import { requireAuth } from "@/lib/require-auth";
import { prisma } from "@/lib/prisma";

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    // Só alterna o "feito" de um item já gerado; nenhum conteúdo novo é gerado aqui,
    // então não há gate de plano/quota a aplicar — só login.
    const { session, response } = await requireAuth();
    if (!session) return response!;

    const { id } = await params;
    const body = await req.json();
    const done = Boolean(body.done);

    const item = await prisma.studyScheduleItem.findUnique({ where: { id } });
    if (!item || item.userId !== session.user.id) {
      return NextResponse.json({ error: "Item não encontrado." }, { status: 404 });
    }

    await prisma.studyScheduleItem.update({ where: { id }, data: { done } });

    return NextResponse.json({ ok: true });
  } catch (error) {
    console.error("Erro ao atualizar item do calendário:", error);
    return NextResponse.json(
      { error: "Erro ao processar. Tente novamente." },
      { status: 500 }
    );
  }
}
