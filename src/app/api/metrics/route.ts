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
  // Sem token, só aceita hosts usados pelo scrape direto da rede Docker. O
  // Next acrescenta x-forwarded-for inclusive em chamadas internas, então o
  // header Host é o sinal confiável nesta topologia conhecida.
  if (!token && process.env.NODE_ENV === "production") {
    const host = req.headers.get("host")?.split(":")[0] ?? "";
    const internalHosts = new Set(["carreiras-match-app", "127.0.0.1", "localhost"]);
    if (!internalHosts.has(host)) {
      return new NextResponse("Metrics unavailable", { status: 503 });
    }
  }

  if (token && req.headers.get("authorization") !== `Bearer ${token}`) {
    return new NextResponse("Unauthorized", { status: 401 });
  }

  await refreshBusinessMetrics();
  const body = await registry.metrics();
  return new NextResponse(body, {
    status: 200,
    headers: { "Content-Type": registry.contentType },
  });
}
