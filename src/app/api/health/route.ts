import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

/**
 * Endpoint leve para o load balancer e o monitoramento externo.
 * Não expõe credenciais nem dados do banco; apenas confirma conectividade.
 */
export async function GET() {
  const startedAt = performance.now();

  try {
    await prisma.$queryRaw`SELECT 1`;
    const databaseMs = Math.round(performance.now() - startedAt);

    return NextResponse.json({
      status: "ok",
      service: "carreirasmatch",
      database: "ok",
      databaseMs,
      timestamp: new Date().toISOString(),
    });
  } catch {
    return NextResponse.json(
      {
        status: "degraded",
        service: "carreirasmatch",
        database: "unavailable",
        timestamp: new Date().toISOString(),
      },
      { status: 503 },
    );
  }
}
