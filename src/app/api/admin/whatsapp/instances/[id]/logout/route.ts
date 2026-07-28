import { NextResponse } from "next/server";
import { requireAdminApi } from "@/lib/admin";
import { prisma } from "@/lib/prisma";
import { logoutEvolutionInstance } from "@/lib/evolution";

export async function POST(_req: Request, { params }: { params: Promise<{ id: string }> }) {
  const { session, response } = await requireAdminApi();
  if (!session) return response!;

  const { id } = await params;
  const instance = await prisma.whatsappInstance.findUnique({ where: { id } });
  if (!instance) {
    return NextResponse.json({ error: "Número não encontrado." }, { status: 404 });
  }

  try {
    await logoutEvolutionInstance(instance.instanceName);
    return NextResponse.json({ ok: true });
  } catch (err) {
    return NextResponse.json(
      { error: err instanceof Error ? err.message : "Erro inesperado ao desconectar." },
      { status: 502 }
    );
  }
}
