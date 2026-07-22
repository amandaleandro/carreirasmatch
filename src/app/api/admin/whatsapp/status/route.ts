import { NextResponse } from "next/server";
import { requireAdminApi } from "@/lib/admin";
import { evolutionEnabled, getEvolutionConnectionState } from "@/lib/evolution";

export async function GET() {
  const { session, response } = await requireAdminApi();
  if (!session) return response!;

  if (!evolutionEnabled) {
    return NextResponse.json({ configured: false, state: "unknown" as const });
  }

  const state = await getEvolutionConnectionState();
  return NextResponse.json({ configured: true, state });
}
