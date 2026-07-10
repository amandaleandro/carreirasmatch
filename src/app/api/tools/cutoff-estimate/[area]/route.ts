import { NextRequest, NextResponse } from "next/server";
import { requireToolAccess } from "@/lib/require-auth";
import { estimateCutoffChance } from "@/lib/tools";
import { getVocationArea } from "@/lib/vocation-areas";

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ area: string }> }
) {
  try {
    const { area: areaSlug } = await params;
    const area = getVocationArea(areaSlug);
    if (!area) {
      return NextResponse.json({ error: "Área inválida." }, { status: 400 });
    }

    const { session, response } = await requireToolAccess("/tools/vocation-test");
    if (!session) return response!;

    const body = await req.json();
    const userScore = Number(body.userScore);
    const targetInstitutionType = (body.targetInstitutionType as string) ?? "";

    if (!Number.isFinite(userScore) || userScore <= 0 || userScore > 1000) {
      return NextResponse.json({ error: "Informe uma nota válida (0-1000)." }, { status: 400 });
    }
    if (!targetInstitutionType.trim()) {
      return NextResponse.json({ error: "Informe o tipo de instituição-alvo." }, { status: 400 });
    }

    const result = await estimateCutoffChance(area, userScore, targetInstitutionType);

    return NextResponse.json(result);
  } catch (error) {
    console.error("Erro ao estimar chance de corte:", error);
    return NextResponse.json(
      { error: "Erro ao processar. Tente novamente." },
      { status: 500 }
    );
  }
}
