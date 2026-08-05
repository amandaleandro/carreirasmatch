import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { runJsonPrompt } from "@/lib/groq";
import { reserveFeatureForRoute } from "@/lib/feature-access";
import { COMMERCIAL_FEATURE_KEYS } from "@/lib/commercial-plan-catalog";

export async function POST(req: NextRequest) {
  const { session, response, release } = await reserveFeatureForRoute(COMMERCIAL_FEATURE_KEYS.aiSimpleAction);
  if (!session) return response!;

  try {
    const { projectId } = await req.json();
    if (!projectId) {
      await release!.cancel();
      return NextResponse.json({ error: "projectId é obrigatório." }, { status: 400 });
    }

    const [project, userProfile] = await Promise.all([
      prisma.freelanceProject.findUnique({ where: { id: projectId } }),
      prisma.freelancerProfile.findUnique({ where: { userId: session.user.id } }),
    ]);

    if (!project) {
      await release!.cancel();
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

    await release!.confirm();
    return NextResponse.json({
      success: true,
      proposalAI,
    });
  } catch (error) {
    await release!.cancel();
    console.error("Erro ao gerar proposta por IA:", error);
    return NextResponse.json({ error: "Erro ao gerar proposta com IA." }, { status: 500 });
  }
}
