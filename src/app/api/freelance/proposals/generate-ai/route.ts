import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { runJsonPrompt } from "@/lib/groq";

export async function POST(req: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Faça login para gerar proposta." }, { status: 401 });
    }

    const { projectId } = await req.json();
    if (!projectId) {
      return NextResponse.json({ error: "projectId é obrigatório." }, { status: 400 });
    }

    const [project, userProfile] = await Promise.all([
      prisma.freelanceProject.findUnique({ where: { id: projectId } }),
      prisma.freelancerProfile.findUnique({ where: { userId: session.user.id } }),
    ]);

    if (!project) {
      return NextResponse.json({ error: "Projeto não encontrado." }, { status: 404 });
    }

    const systemPrompt = `Você é um freelancer profissional de alto nível.
Sua missão é escrever uma Carta de Apresentação (Cover Letter) persuasiva, direta e profissional para o projeto especificado.
Responda em JSON no formato:
{
  "coverLetter": "...",
  "suggestedEstimatedDays": 7,
  "keyDeliverables": ["..."]
}`;

    const userPrompt = `PROJETO: ${project.title}
CATEGORIA: ${project.category}
DESCRIÇÃO DO PROJETO: ${project.description}
HABILIDADES REQUISITADAS: ${project.skills}
ORÇAMENTO MÍNIMO: R$ ${project.budgetMinCents ? project.budgetMinCents / 100 : "A combinar"}
ORÇAMENTO MÁXIMO: R$ ${project.budgetMaxCents ? project.budgetMaxCents / 100 : "A combinar"}

MEU PERFIL FREELANCER:
HEADLINE: ${userProfile?.headline || "Profissional autônomo"}
BIO/HABILIDADES: ${userProfile?.bio || "Experiência prática na área."} / ${userProfile?.skills || "[]"}`;

    const proposalAI = await runJsonPrompt(systemPrompt, userPrompt, 0.3);

    return NextResponse.json({
      success: true,
      proposalAI,
    });
  } catch (error) {
    console.error("Erro ao gerar proposta por IA:", error);
    return NextResponse.json({ error: "Erro ao gerar proposta com IA." }, { status: 500 });
  }
}
