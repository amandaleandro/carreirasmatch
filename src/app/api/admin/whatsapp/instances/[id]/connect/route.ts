import { NextResponse } from "next/server";
import { requireAdminApi } from "@/lib/admin";
import { prisma } from "@/lib/prisma";
import { requestEvolutionQrCode } from "@/lib/evolution";

export async function POST(_req: Request, { params }: { params: Promise<{ id: string }> }) {
  const { session, response } = await requireAdminApi();
  if (!session) return response!;

  const { id } = await params;
  const instance = await prisma.whatsappInstance.findUnique({ where: { id } });
  if (!instance) {
    return NextResponse.json({ error: "Número não encontrado." }, { status: 404 });
  }

  try {
    const { base64, pairingCode } = await requestEvolutionQrCode(instance.instanceName);
    if (!base64) {
      return NextResponse.json({ error: "A Evolution API não retornou um QR code." }, { status: 502 });
    }
    return NextResponse.json({ base64, pairingCode });
  } catch (err) {
    return NextResponse.json(
      { error: err instanceof Error ? err.message : "Erro inesperado ao gerar o QR code." },
      { status: 502 }
    );
  }
}
