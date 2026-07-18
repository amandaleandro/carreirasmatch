import { NextRequest, NextResponse } from "next/server";
import { requireToolAccess } from "@/lib/require-auth";
import { estimateConcursoCutoff } from "@/lib/tools";

export async function POST(req: NextRequest) {
  try {
    const { session, response } = await requireToolAccess("/tools/concurso/nota-de-corte");
    if (!session) return response!;

    const { cargo, banca, regiao, userScore } = await req.json();

    if (!cargo || !String(cargo).trim()) {
      return NextResponse.json({ error: "Informe o cargo ou concurso." }, { status: 400 });
    }

    const score = Number(userScore);
    if (!Number.isFinite(score) || score < 0) {
      return NextResponse.json({ error: "Informe sua pontuação estimada (percentual de acerto ou nota)." }, { status: 400 });
    }

    const result = await estimateConcursoCutoff({
      cargo: String(cargo),
      banca: String(banca ?? ""),
      regiao: String(regiao ?? ""),
      userScore: score,
    });

    return NextResponse.json(result);
  } catch (error) {
    console.error("Erro ao estimar nota de corte:", error);
    return NextResponse.json({ error: "Erro ao processar. Tente novamente." }, { status: 500 });
  }
}
