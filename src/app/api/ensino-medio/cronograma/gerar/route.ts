import { NextResponse } from "next/server";
import { generateStudySchedule } from "@/lib/ensino-medio-tools";
import { reserveFeatureForRoute } from "@/lib/feature-access";
import { COMMERCIAL_FEATURE_KEYS } from "@/lib/commercial-plan-catalog";

export async function POST(req: Request) {
  const { session, response, release } = await reserveFeatureForRoute(COMMERCIAL_FEATURE_KEYS.studyTool);
  if (!session) return response!;

  try {
    const body = await req.json();
    const { availableHoursPerDay, availableDays, subjectLevels, goal } = body;

    if (!availableHoursPerDay || typeof availableHoursPerDay !== "number") {
      await release!.cancel();
      return NextResponse.json(
        { error: "Informe as horas disponíveis por dia." },
        { status: 400 }
      );
    }

    if (!Array.isArray(availableDays) || availableDays.length === 0) {
      await release!.cancel();
      return NextResponse.json(
        { error: "Selecione pelo menos um dia da semana." },
        { status: 400 }
      );
    }

    const schedule = await generateStudySchedule({
      availableHoursPerDay,
      availableDays,
      subjectLevels: subjectLevels || {},
      goal: goal || "Preparação ENEM e Vestibulares",
    });

    await release!.confirm();
    return NextResponse.json(schedule);
  } catch (error) {
    await release!.cancel();
    console.error("[API cronograma/gerar] Erro:", error);
    return NextResponse.json(
      { error: "Falha ao gerar o cronograma de estudos." },
      { status: 500 }
    );
  }
}
