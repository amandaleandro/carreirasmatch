import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";

export async function POST(req: NextRequest) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Faça login para continuar." }, { status: 401 });
  }

  const { name } = await req.json();
  if (typeof name !== "string" || !name.trim()) {
    return NextResponse.json({ error: "Informe o nome da disciplina." }, { status: 400 });
  }

  const enrollment = await prisma.universityEnrollment.findUnique({ where: { userId: session.user.id } });
  if (!enrollment) {
    return NextResponse.json({ error: "Cadastre seu curso antes de adicionar disciplinas." }, { status: 400 });
  }

  const subject = await prisma.universitySubject.create({
    data: { enrollmentId: enrollment.id, name: name.trim().slice(0, 200) },
  });

  return NextResponse.json({ subject });
}

export async function DELETE(req: NextRequest) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Faça login para continuar." }, { status: 401 });
  }

  const { id } = await req.json();
  if (typeof id !== "string" || !id) {
    return NextResponse.json({ error: "Disciplina inválida." }, { status: 400 });
  }

  await prisma.universitySubject.deleteMany({
    where: { id, enrollment: { userId: session.user.id } },
  });

  return NextResponse.json({ ok: true });
}
