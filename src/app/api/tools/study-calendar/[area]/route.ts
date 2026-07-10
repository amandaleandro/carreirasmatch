import { NextRequest, NextResponse } from "next/server";
import { requireToolAccess } from "@/lib/require-auth";
import { getVocationArea } from "@/lib/vocation-areas";
import { prisma } from "@/lib/prisma";
import type { WeeklyScheduleBlock } from "@/lib/tools";

function startOfWeek(date: Date): Date {
  const d = new Date(date);
  d.setHours(0, 0, 0, 0);
  return d;
}

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
    const weeklySchedule = body.weeklySchedule as WeeklyScheduleBlock[];

    if (!Array.isArray(weeklySchedule) || weeklySchedule.length === 0) {
      return NextResponse.json({ error: "Cronograma inválido." }, { status: 400 });
    }

    await prisma.studyScheduleItem.deleteMany({
      where: { userId: session.user.id, areaSlug: area.slug },
    });

    const today = startOfWeek(new Date());
    const rows = weeklySchedule.flatMap((block) => {
      const weekStart = new Date(today);
      weekStart.setDate(weekStart.getDate() + (block.week - 1) * 7);
      return block.tasks.map((task) => ({
        userId: session.user.id,
        areaSlug: area.slug,
        weekStart,
        focus: block.focus,
        task,
      }));
    });

    await prisma.studyScheduleItem.createMany({ data: rows });

    return NextResponse.json({ ok: true });
  } catch (error) {
    console.error("Erro ao salvar calendário de estudos:", error);
    return NextResponse.json(
      { error: "Erro ao processar. Tente novamente." },
      { status: 500 }
    );
  }
}
