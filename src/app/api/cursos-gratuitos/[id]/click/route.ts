import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;

  try {
    const course = await prisma.externalCourse.findUnique({
      where: { id },
      select: { partnerId: true },
    });

    if (course?.partnerId) {
      await prisma.partnerCourseClick.create({
        data: {
          courseId: id,
          partnerId: course.partnerId,
        },
      });
    }

    return NextResponse.json({ ok: true });
  } catch (err) {
    console.error("Erro ao registrar clique:", err);
    return NextResponse.json({ error: "Erro interno" }, { status: 500 });
  }
}
