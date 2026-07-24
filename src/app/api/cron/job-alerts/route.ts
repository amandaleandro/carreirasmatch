import { NextRequest, NextResponse } from "next/server";
import { processJobAlerts } from "@/lib/job-alerts";

export async function GET(req: NextRequest) {
  try {
    const authHeader = req.headers.get("authorization");
    const cronSecret = process.env.CRON_SECRET;

    if (cronSecret && authHeader !== `Bearer ${cronSecret}`) {
      return NextResponse.json({ error: "Não autorizado." }, { status: 401 });
    }

    const processed = await processJobAlerts();

    return NextResponse.json({
      success: true,
      alertsProcessed: processed.length,
      details: processed,
    });
  } catch (error) {
    console.error("Erro no cron de alertas de vagas:", error);
    return NextResponse.json(
      { error: "Erro ao processar alertas de vagas." },
      { status: 500 }
    );
  }
}
