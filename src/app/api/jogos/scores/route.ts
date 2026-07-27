import { NextRequest, NextResponse } from "next/server";
import { requireAuth } from "@/lib/require-auth";
import { prisma } from "@/lib/prisma";

export async function POST(req: NextRequest) {
  const { session, response } = await requireAuth();
  if (!session) return response!;

  try {
    const { game, area, score } = await req.json();
    const allowedGames = new Set([
      "typer", "quiz", "memory", "termo", "forca", "vf", "ordenar",
      "cacapalavras", "curriculo", "dilemas", "inbox", "duelo",
    ]);

    if (
      typeof game !== "string" || !allowedGames.has(game) ||
      typeof area !== "string" || area.length > 80 ||
      typeof score !== "number" || !Number.isFinite(score) ||
      !Number.isInteger(score) || score < 0 || score > 100000
    ) {
      return NextResponse.json({ error: "Dados inválidos" }, { status: 400 });
    }

    const gameScore = await prisma.gameScore.create({
      data: {
        userId: session.user.id,
        game,
        area,
        score,
      },
    });

    return NextResponse.json({ ok: true, id: gameScore.id });
  } catch (err) {
    console.error("Erro ao salvar pontuação:", err);
    return NextResponse.json({ error: "Erro interno" }, { status: 500 });
  }
}
