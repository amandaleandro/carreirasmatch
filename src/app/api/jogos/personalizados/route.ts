import { NextRequest, NextResponse } from "next/server";
import { requireAuth } from "@/lib/require-auth";
import { prisma } from "@/lib/prisma";
import { buildCareerGamePack } from "@/lib/career-game-generator";

export async function GET(request: NextRequest) {
  const { session, response } = await requireAuth();
  if (!session) return response!;

  const game = request.nextUrl.searchParams.get("game");
  const phase = request.nextUrl.searchParams.get("fase");
  if (!game) {
    return NextResponse.json({ error: "Jogo personalizado inválido." }, { status: 400 });
  }

  let user: {
    careerSegment: string | null;
    professionalArea: string | null;
    currentProfessionalArea: string | null;
    targetProfessionalArea: string | null;
    studyCourse: string | null;
  } | null = null;

  try {
    user = await prisma.user.findUnique({
      where: { id: session.user.id },
      select: {
        careerSegment: true,
        professionalArea: true,
        currentProfessionalArea: true,
        targetProfessionalArea: true,
        studyCourse: true,
      },
    });
  } catch {
    // Fallback seguro enquanto a migração de perfil ainda não foi aplicada.
  }

  const pack = buildCareerGamePack(user ?? {}, phase);
  return NextResponse.json({
    area: pack.area,
    context: pack.context,
    ...(game === "quiz" || game === "duelo" ? { questions: pack.questions } : game === "memory" ? { pairs: pack.pairs } : { words: pack.words }),
  });
}
