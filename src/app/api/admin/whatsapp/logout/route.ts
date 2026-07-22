import { NextResponse } from "next/server";
import { requireAdminApi } from "@/lib/admin";
import { evolutionEnabled, logoutEvolutionInstance } from "@/lib/evolution";

export async function POST() {
  const { session, response } = await requireAdminApi();
  if (!session) return response!;

  if (!evolutionEnabled) {
    return NextResponse.json({ error: "Evolution API não configurada." }, { status: 400 });
  }

  try {
    await logoutEvolutionInstance();
    return NextResponse.json({ ok: true });
  } catch (err) {
    return NextResponse.json(
      { error: err instanceof Error ? err.message : "Erro inesperado ao desconectar." },
      { status: 502 }
    );
  }
}
