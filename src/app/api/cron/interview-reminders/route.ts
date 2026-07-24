import { NextRequest, NextResponse } from "next/server";
import { processInterviewReminders } from "@/lib/interview-scheduler";

export async function GET(req: NextRequest) {
  try {
    const authHeader = req.headers.get("authorization");
    const cronSecret = process.env.CRON_SECRET;

    if (cronSecret && authHeader !== `Bearer ${cronSecret}`) {
      return NextResponse.json({ error: "Não autorizado." }, { status: 401 });
    }

    const processed = await processInterviewReminders();

    return NextResponse.json({
      success: true,
      remindersSentCount: processed.length,
      details: processed,
    });
  } catch (error) {
    console.error("Erro no cron de lembretes de entrevista:", error);
    return NextResponse.json(
      { error: "Erro ao processar lembretes de entrevista." },
      { status: 500 }
    );
  }
}
