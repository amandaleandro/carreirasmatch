import { NextRequest, NextResponse } from "next/server";
import { processRadarAlerts } from "@/lib/radar-alerts";

export async function GET(req: NextRequest) {
  try {
    const authHeader = req.headers.get("authorization");
    const cronSecret = process.env.CRON_SECRET;

    if (cronSecret && authHeader !== `Bearer ${cronSecret}`) {
      return NextResponse.json({ error: "Não autorizado." }, { status: 401 });
    }

    const processed = await processRadarAlerts();

    return NextResponse.json({
      success: true,
      radarAlertsProcessed: processed.length,
      details: processed,
    });
  } catch (error) {
    console.error("Erro no cron de alertas de radar:", error);
    return NextResponse.json(
      { error: "Erro ao processar alertas de radar." },
      { status: 500 }
    );
  }
}
