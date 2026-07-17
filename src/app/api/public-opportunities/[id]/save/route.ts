import { NextResponse } from "next/server";
import { requireAuth } from "@/lib/require-auth";
import { prisma } from "@/lib/prisma";

export async function POST(_: Request, context: { params: Promise<{ id: string }> }) {
  const { session, response } = await requireAuth();
  if (!session) return response!;
  const { id } = await context.params;
  const opportunity = await prisma.publicOpportunity.findFirst({
    where: { id, active: true },
    include: { source: { select: { name: true } } },
  });
  if (!opportunity) return NextResponse.json({ error: "Oportunidade não encontrada." }, { status: 404 });

  const existing = await prisma.application.findFirst({
    where: { userId: session.user.id, jobUrl: opportunity.url },
    select: { id: true },
  });
  if (existing) return NextResponse.json({ applicationId: existing.id, existing: true });

  const application = await prisma.application.create({
    data: {
      userId: session.user.id,
      jobTitle: opportunity.title,
      company: opportunity.company || opportunity.source.name,
      jobUrl: opportunity.url,
      status: "saved",
      deadline: opportunity.expiresAt,
      notes: `Fonte oficial: ${opportunity.source.name}`,
    },
  });
  return NextResponse.json({ applicationId: application.id }, { status: 201 });
}
