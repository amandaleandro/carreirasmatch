import { NextRequest, NextResponse } from "next/server";
import { requireToolAccess } from "@/lib/require-auth";
import { prisma } from "@/lib/prisma";

const TOOL_HREF = "/tools/schedule-conflict-checker";

export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { session, response } = await requireToolAccess(TOOL_HREF);
    if (!session) return response!;

    const { id } = await params;
    const item = await prisma.classScheduleItem.findUnique({ where: { id } });
    if (!item || item.userId !== session.user.id) {
      return NextResponse.json({ error: "Item não encontrado." }, { status: 404 });
    }

    await prisma.classScheduleItem.delete({ where: { id } });

    return NextResponse.json({ ok: true });
  } catch (error) {
    console.error("Erro ao remover aula:", error);
    return NextResponse.json(
      { error: "Erro ao processar. Tente novamente." },
      { status: 500 }
    );
  }
}
