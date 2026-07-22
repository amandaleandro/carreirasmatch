import { NextResponse } from "next/server";
import { requireAdminApi } from "@/lib/admin";
import { evolutionEnabled, requestEvolutionQrCode } from "@/lib/evolution";

export async function POST() {
  const { session, response } = await requireAdminApi();
  if (!session) return response!;

  if (!evolutionEnabled) {
    return NextResponse.json(
      { error: "Evolution API não configurada no ambiente (EVOLUTION_API_URL/EVOLUTION_API_KEY/EVOLUTION_INSTANCE)." },
      { status: 400 }
    );
  }

  try {
    const { base64, pairingCode } = await requestEvolutionQrCode();
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
