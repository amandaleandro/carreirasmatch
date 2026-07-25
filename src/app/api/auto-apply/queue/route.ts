import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";

export async function POST(req: Request) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Não autorizado" }, { status: 401 });
  }


  try {
    const { jobId, jobTitle, company, jobUrl, fitScore } = await req.json();

    if (!jobTitle || !jobUrl) {
      return NextResponse.json({ error: "Título e URL da vaga são obrigatórios" }, { status: 400 });
    }

    const item = await prisma.autoApplicationQueue.create({
      data: {
        userId: session.user.id,
        jobId: jobId || null,
        jobTitle,
        company: company || "",
        jobUrl,
        fitScore: Number(fitScore) || 80,
        status: "queued",
      },
    });

    return NextResponse.json({ success: true, item });
  } catch (error: any) {
    return NextResponse.json({ error: error.message || "Erro ao adicionar à fila" }, { status: 500 });
  }
}
