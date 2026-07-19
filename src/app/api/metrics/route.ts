import { NextRequest, NextResponse } from "next/server";
import { refreshBusinessMetrics, registry } from "@/lib/metrics";

// Sempre em tempo de request e no runtime Node (prom-client depende de APIs do
// Node como process/perf_hooks; não roda em edge).
export const runtime = "nodejs";
export const dynamic = "force-dynamic";

// O Prometheus faz scrape deste endpoint pela rede interna do Docker
// (carreiras-match-app:3000). O Caddy bloqueia /api/metrics vindo da internet
// (ver Caddyfile), mas mantemos uma trava por token como defesa em profundidade:
// se METRICS_TOKEN estiver setado, exige-se "Authorization: Bearer <token>".
export async function GET(req: NextRequest) {
  const token = process.env.METRICS_TOKEN;
  if (token) {
    const auth = req.headers.get("authorization");
    if (auth !== `Bearer ${token}`) {
      return new NextResponse("Unauthorized", { status: 401 });
    }
  }

  await refreshBusinessMetrics();
  const body = await registry.metrics();
  return new NextResponse(body, {
    status: 200,
    headers: { "Content-Type": registry.contentType },
  });
}
