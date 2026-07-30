import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";

export async function POST(req: NextRequest) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Faça login para continuar." }, { status: 401 });
  }

  const { institution, courseName, period, universityCourseId, currentSemester } = await req.json();

  if (typeof courseName !== "string" || !courseName.trim()) {
    return NextResponse.json({ error: "Informe o nome do curso." }, { status: 400 });
  }

  const enrollment = await prisma.universityEnrollment.upsert({
    where: { userId: session.user.id },
    create: {
      userId: session.user.id,
      institution: typeof institution === "string" ? institution.trim() : "",
      courseName: courseName.trim(),
      period: typeof period === "string" ? period.trim() : "",
      universityCourseId: typeof universityCourseId === "string" && universityCourseId.trim() ? universityCourseId.trim() : null,
      currentSemester: Number.isInteger(currentSemester) ? currentSemester : null,
    },
    update: {
      institution: typeof institution === "string" ? institution.trim() : "",
      courseName: courseName.trim(),
      period: typeof period === "string" ? period.trim() : "",
      universityCourseId: typeof universityCourseId === "string" && universityCourseId.trim() ? universityCourseId.trim() : null,
      currentSemester: Number.isInteger(currentSemester) ? currentSemester : null,
    },
  });

  return NextResponse.json({ enrollment });
}
