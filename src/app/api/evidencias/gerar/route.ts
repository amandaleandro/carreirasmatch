import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { suggestEvidencesFromResume } from "@/lib/groq";

export async function POST() {
  const session = await auth();
  if (!session?.user?.id) return NextResponse.json({ error: "Não autorizado" }, { status: 401 });

  const resume = await prisma.resume.findFirst({
    where: { userId: session.user.id },
    orderBy: { createdAt: "desc" },
    select: { rawText: true },
  });
  if (!resume?.rawText) {
    return NextResponse.json({ error: "Envie um currículo primeiro para a IA conseguir ler suas experiências." }, { status: 400 });
  }

  try {
    const { suggestions } = await suggestEvidencesFromResume(resume.rawText);
    return NextResponse.json({ suggestions });
  } catch {
    return NextResponse.json({ error: "Não foi possível gerar sugestões agora. Tente novamente em instantes." }, { status: 502 });
  }
}
