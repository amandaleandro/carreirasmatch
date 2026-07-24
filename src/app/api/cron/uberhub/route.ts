import { NextResponse } from "next/server";
import { syncUberHubData } from "@/lib/uberhub-sync";

export const dynamic = "force-dynamic";
export const maxDuration = 120;

export async function GET(request: Request) {
  // Verificação de segredo opcional para Cron (CRON_SECRET)
  const authHeader = request.headers.get("authorization");
  if (process.env.CRON_SECRET && authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json({ error: "Não autorizado" }, { status: 401 });
  }

  try {
    const itemCount = await syncUberHubData();
    return NextResponse.json({
      success: true,
      message: "Sincronização do UberHub concluída com sucesso",
      itemCount,
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Erro desconhecido";
    return NextResponse.json({ success: false, error: message }, { status: 500 });
  }
}
