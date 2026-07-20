import { NextResponse } from "next/server";
import { requirePartnerApi } from "@/lib/partner-auth";
import { prisma } from "@/lib/prisma";

export async function POST(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { partner, response } = await requirePartnerApi();
  if (!partner) return response;

  const { id } = await params;

  const course = await prisma.externalCourse.findFirst({
    where: { id, partnerId: partner.id },
  });

  if (!course) {
    return NextResponse.json({ error: "Curso não encontrado." }, { status: 404 });
  }

  if (course.featured) {
    return NextResponse.json({ error: "Este curso já está destacado." }, { status: 400 });
  }

  if (partner.credits <= 0) {
    return NextResponse.json({ error: "Você não possui créditos de destaque suficientes." }, { status: 400 });
  }

  // Desconta crédito e destaca o curso
  await prisma.$transaction([
    prisma.partner.update({
      where: { id: partner.id },
      data: { credits: { decrement: 1 } },
    }),
    prisma.externalCourse.update({
      where: { id },
      data: { featured: true },
    }),
  ]);

  return NextResponse.json({ ok: true });
}
