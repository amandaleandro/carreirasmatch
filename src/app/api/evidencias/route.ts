import { NextResponse } from "next/server";
import { z } from "zod";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";

const evidenceSchema = z.object({
  category: z.enum(["projeto", "resultado", "certificacao", "ferramenta"]),
  title: z.string().trim().min(1).max(160),
  description: z.string().trim().min(1).max(4000),
  metrics: z.string().trim().max(500).optional(),
});

export async function GET() {
  const session = await auth();
  if (!session?.user?.id) return NextResponse.json({ error: "Não autorizado" }, { status: 401 });

  const items = await prisma.professionalEvidence.findMany({
    where: { userId: session.user.id },
    orderBy: { createdAt: "desc" },
  });

  return NextResponse.json({ items });
}

export async function POST(request: Request) {
  const session = await auth();
  if (!session?.user?.id) return NextResponse.json({ error: "Não autorizado" }, { status: 401 });

  const parsed = evidenceSchema.safeParse(await request.json());
  if (!parsed.success) {
    return NextResponse.json({ error: "Preencha os dados da evidência corretamente." }, { status: 400 });
  }

  const item = await prisma.professionalEvidence.create({
    data: { ...parsed.data, userId: session.user.id, metrics: parsed.data.metrics || null },
  });

  return NextResponse.json({ item }, { status: 201 });
}

export async function DELETE(request: Request) {
  const session = await auth();
  if (!session?.user?.id) return NextResponse.json({ error: "Não autorizado" }, { status: 401 });

  const body = z.object({ id: z.string().min(1) }).safeParse(await request.json());
  if (!body.success) return NextResponse.json({ error: "Evidência inválida." }, { status: 400 });

  const result = await prisma.professionalEvidence.deleteMany({
    where: { id: body.data.id, userId: session.user.id },
  });
  if (result.count === 0) return NextResponse.json({ error: "Evidência não encontrada." }, { status: 404 });

  return NextResponse.json({ ok: true });
}
