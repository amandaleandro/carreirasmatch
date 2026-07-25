import { NextResponse } from "next/server";
import { z } from "zod";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";

const queueSchema = z.object({ jobId: z.string().min(1).max(100) });

export async function POST(req: Request) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Não autorizado" }, { status: 401 });
  }

  const parsed = queueSchema.safeParse(await req.json());
  if (!parsed.success) {
    return NextResponse.json({ error: "Vaga inválida." }, { status: 400 });
  }

  const resume = await prisma.resume.findFirst({
    where: { userId: session.user.id },
    orderBy: { createdAt: "desc" },
    select: { id: true },
  });
  if (!resume) {
    return NextResponse.json({ error: "Cadastre um currículo antes de adicionar vagas." }, { status: 409 });
  }

  const match = await prisma.jobMatch.findUnique({
    where: { resumeId_jobId: { resumeId: resume.id, jobId: parsed.data.jobId } },
    include: { job: true },
  });
  if (!match?.job.active) {
    return NextResponse.json({ error: "Vaga indisponível ou ainda não analisada." }, { status: 404 });
  }

  try {
    const item = await prisma.autoApplicationQueue.upsert({
      where: {
        userId_jobId: { userId: session.user.id, jobId: match.jobId },
      },
      create: {
        userId: session.user.id,
        jobId: match.jobId,
        jobTitle: match.job.jobTitle,
        company: match.job.company,
        jobUrl: match.job.url,
        fitScore: match.fitScore,
        status: "queued",
      },
      update: {},
    });
    return NextResponse.json({ success: true, item });
  } catch (error) {
    console.error("auto-apply queue:", error);
    return NextResponse.json({ error: "Não foi possível adicionar a vaga à fila." }, { status: 500 });
  }
}
