import { NextResponse } from "next/server";
import { z } from "zod";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";

const versionSchema = z.object({
  label: z.string().trim().min(1).max(120),
  summary: z.string().max(5000).default(""),
  resumeStructured: z.unknown().default({}),
  approvedSuggestions: z.unknown().default([]),
  analysisId: z.string().optional(),
});

export async function GET(_request: Request, { params }: { params: Promise<{ id: string }> }) {
  const session = await auth();
  if (!session?.user?.id) return NextResponse.json({ error: "Não autorizado" }, { status: 401 });
  const { id } = await params;
  const application = await prisma.application.findFirst({ where: { id, userId: session.user.id }, select: { id: true } });
  if (!application) return NextResponse.json({ error: "Candidatura não encontrada." }, { status: 404 });
  const versions = await prisma.applicationResumeVersion.findMany({ where: { applicationId: id }, orderBy: { createdAt: "desc" } });
  return NextResponse.json({ versions });
}

export async function POST(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const session = await auth();
  if (!session?.user?.id) return NextResponse.json({ error: "Não autorizado" }, { status: 401 });
  const { id } = await params;
  const application = await prisma.application.findFirst({ where: { id, userId: session.user.id }, select: { id: true } });
  if (!application) return NextResponse.json({ error: "Candidatura não encontrada." }, { status: 404 });
  const parsed = versionSchema.safeParse(await request.json());
  if (!parsed.success) return NextResponse.json({ error: "Versão de currículo inválida." }, { status: 400 });
  const version = await prisma.applicationResumeVersion.create({
    data: {
      applicationId: id,
      analysisId: parsed.data.analysisId,
      label: parsed.data.label,
      summary: parsed.data.summary,
      resumeStructured: JSON.stringify(parsed.data.resumeStructured),
      approvedSuggestions: JSON.stringify(parsed.data.approvedSuggestions),
    },
  });
  return NextResponse.json({ version }, { status: 201 });
}
