import { NextResponse } from "next/server";
import { syncAllExternalSources } from "@/lib/external-source-sync";

export const dynamic = "force-dynamic";
export const maxDuration = 300; // Permite execuções de até 5 minutos

export async function GET(request: Request) {
  // Autenticação opcional por token CRON_SECRET
  const authHeader = request.headers.get("authorization");
  if (process.env.CRON_SECRET && authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json({ error: "Não autorizado" }, { status: 401 });
  }

  try {
    console.log("[Cron sync-all] Iniciando sincronização 3x ao dia das fontes externas (UberHub, Prefeituras, CDLs, MEC)...");
    const result = await syncAllExternalSources();

    return NextResponse.json({
      success: true,
      message: "Sincronização unificada concluída com sucesso (3x ao dia)",
      data: result,
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Erro desconhecido";
    console.error("[Cron sync-all] Erro durante a sincronização:", message);
    return NextResponse.json({ success: false, error: message }, { status: 500 });
  }
}
