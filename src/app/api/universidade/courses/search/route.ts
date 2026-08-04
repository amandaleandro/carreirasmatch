import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

// Sem checagem de sessão de propósito: essa busca também é usada no formulário
// de cadastro (/register), antes de existir usuário autenticado. É leitura
// pública de catálogo de cursos, sem dado sensível.
export async function GET(req: NextRequest) {
  const q = (req.nextUrl.searchParams.get("q") ?? "").trim();
  if (q.length < 2) return NextResponse.json({ courses: [] });

  const courses = await prisma.universityCourse.findMany({
    where: { active: true, title: { contains: q, mode: "insensitive" } },
    include: { university: { select: { name: true, city: true, state: true } } },
    take: 15,
    orderBy: { title: "asc" },
  });

  return NextResponse.json({
    courses: courses.map((c) => ({
      id: c.id,
      title: c.title,
      area: c.area,
      universityName: c.university.name,
      city: c.university.city,
      state: c.university.state,
    })),
  });
}
