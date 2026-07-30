import { NextRequest, NextResponse } from "next/server";
import { requireToolAccess } from "@/lib/require-auth";
import { gradeOabSecondPhase } from "@/lib/tools";
import { logStudyActivity } from "@/lib/study-activity";

export async function POST(req: NextRequest) {
  try {
    const { session, response } = await requireToolAccess("/tools/oab/segunda-fase");
    if (!session) return response!;

    const { area, pecaText } = await req.json();

    if (!pecaText || !String(pecaText).trim()) {
      return NextResponse.json({ error: "Cole o texto da sua peça ou resposta discursiva." }, { status: 400 });
    }

    const result = await gradeOabSecondPhase(String(area ?? ""), String(pecaText));

    void logStudyActivity(session.user.id, "oab_segunda_fase");

    return NextResponse.json(result);
  } catch (error) {
    console.error("Erro ao corrigir peça da 2ª fase OAB:", error);
    return NextResponse.json({ error: "Erro ao processar. Tente novamente." }, { status: 500 });
  }
}
