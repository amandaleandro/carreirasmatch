import { NextResponse } from "next/server";
import { generateStudySchedule } from "@/lib/ensino-medio-tools";

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { availableHoursPerDay, availableDays, subjectLevels, goal } = body;

    if (!availableHoursPerDay || typeof availableHoursPerDay !== "number") {
      return NextResponse.json(
        { error: "Informe as horas disponíveis por dia." },
        { status: 400 }
      );
    }

    if (!Array.isArray(availableDays) || availableDays.length === 0) {
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

    return NextResponse.json(schedule);
  } catch (error) {
    console.error("[API cronograma/gerar] Erro:", error);
    return NextResponse.json(
      { error: "Falha ao gerar o cronograma de estudos." },
      { status: 500 }
    );
  }
}
