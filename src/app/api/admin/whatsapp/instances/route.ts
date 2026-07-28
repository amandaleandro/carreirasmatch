import { NextRequest, NextResponse } from "next/server";
import { requireAdminApi } from "@/lib/admin";
import {
  evolutionEnabled,
  createWhatsappInstance,
  getEvolutionConnectionState,
  listWhatsappInstances,
} from "@/lib/evolution";

/** Lista os números cadastrados com o estado ao vivo de cada um. */
export async function GET() {
  const { session, response } = await requireAdminApi();
  if (!session) return response!;

  if (!evolutionEnabled) {
    return NextResponse.json({ configured: false, instances: [] });
  }

  const instances = await listWhatsappInstances();
  const withState = await Promise.all(
    instances.map(async (instance) => ({
      id: instance.id,
      label: instance.label,
      instanceName: instance.instanceName,
      state: await getEvolutionConnectionState(instance.instanceName),
    }))
  );

  return NextResponse.json({ configured: true, instances: withState });
}

/** Cadastra um novo número (só o registro; o pareamento via QR é um passo separado). */
export async function POST(req: NextRequest) {
  const { session, response } = await requireAdminApi();
  if (!session) return response!;

  if (!evolutionEnabled) {
    return NextResponse.json(
      { error: "Evolution API não configurada no ambiente (EVOLUTION_API_URL/EVOLUTION_API_KEY)." },
      { status: 400 }
    );
  }

  const body = await req.json().catch(() => null);
  const label = typeof body?.label === "string" ? body.label : "";

  try {
    const instance = await createWhatsappInstance(label);
    return NextResponse.json({ id: instance.id, label: instance.label, instanceName: instance.instanceName });
  } catch (err) {
    return NextResponse.json(
      { error: err instanceof Error ? err.message : "Erro inesperado ao cadastrar o número." },
      { status: 400 }
    );
  }
}
