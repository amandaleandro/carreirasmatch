import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";

export async function GET(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Faça login para continuar." }, { status: 401 });
  }

  const { id } = await params;
  const subjects = await prisma.curriculumSubject.findMany({
    where: { universityCourseId: id, semester: { not: null } },
    select: { semester: true },
    distinct: ["semester"],
    orderBy: { semester: "asc" },
  });

  return NextResponse.json({ semesters: subjects.map((s) => s.semester).filter((s): s is number => s !== null) });
}
