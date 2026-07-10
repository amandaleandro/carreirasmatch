import { NextRequest, NextResponse } from "next/server";
import { requireToolAccess } from "@/lib/require-auth";
import { prisma } from "@/lib/prisma";

const TOOL_HREF = "/tools/schedule-conflict-checker";

export async function GET() {
  const { session, response } = await requireToolAccess(TOOL_HREF);
  if (!session) return response!;

  const items = await prisma.classScheduleItem.findMany({
    where: { userId: session.user.id },
    orderBy: [{ dayOfWeek: "asc" }, { startTime: "asc" }],
  });

  return NextResponse.json({ items });
}

export async function POST(req: NextRequest) {
  try {
    const { session, response } = await requireToolAccess(TOOL_HREF);
    if (!session) return response!;

    const { dayOfWeek, startTime, endTime, subject } = await req.json();

    if (
      typeof dayOfWeek !== "number" ||
      dayOfWeek < 0 ||
      dayOfWeek > 6 ||
      !startTime ||
      !endTime ||
      !subject?.trim()
    ) {
      return NextResponse.json(
        { error: "Preencha dia, horário de início, fim e matéria." },
        { status: 400 }
      );
    }

    const item = await prisma.classScheduleItem.create({
      data: {
        userId: session.user.id,
        dayOfWeek,
        startTime,
        endTime,
        subject: subject.trim(),
      },
    });

    return NextResponse.json({ item });
  } catch (error) {
    console.error("Erro ao salvar aula:", error);
    return NextResponse.json(
      { error: "Erro ao processar. Tente novamente." },
      { status: 500 }
    );
  }
}
