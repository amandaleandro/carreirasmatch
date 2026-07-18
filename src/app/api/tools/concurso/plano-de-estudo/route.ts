import { NextRequest, NextResponse } from "next/server";
import { requireToolAccess } from "@/lib/require-auth";
import { generateConcursoStudyPlan } from "@/lib/tools";

export async function POST(req: NextRequest) {
  try {
    const { session, response } = await requireToolAccess("/tools/concurso/plano-de-estudo");
    if (!session) return response!;

    const { cargo, banca, disciplinas, weeklyStudyHours, timeUntilExam } = await req.json();

    if (!cargo || !String(cargo).trim()) {
      return NextResponse.json({ error: "Informe o cargo ou exame que você vai prestar." }, { status: 400 });
    }
    if (!disciplinas || !String(disciplinas).trim()) {
      return NextResponse.json({ error: "Liste as disciplinas do edital." }, { status: 400 });
    }

    const result = await generateConcursoStudyPlan({
      cargo: String(cargo),
      banca: String(banca ?? ""),
      disciplinas: String(disciplinas),
      weeklyStudyHours: String(weeklyStudyHours ?? ""),
      timeUntilExam: String(timeUntilExam ?? ""),
    });

    return NextResponse.json(result);
  } catch (error) {
    console.error("Erro ao gerar plano de estudo de concurso:", error);
    return NextResponse.json({ error: "Erro ao processar. Tente novamente." }, { status: 500 });
  }
}
