import { NextRequest, NextResponse } from "next/server";
import { runJsonPrompt } from "@/lib/groq";
import { reserveFeatureForRoute } from "@/lib/feature-access";
import { COMMERCIAL_FEATURE_KEYS } from "@/lib/commercial-plan-catalog";
import { prisma } from "@/lib/prisma";
import { requireAuth } from "@/lib/require-auth";

export async function GET() {
  const { session, response } = await requireAuth();
  if (!session) return response!;

  const saved = await prisma.toolReviewResult.findUnique({
    where: { userId_type: { userId: session.user.id, type: "linkedin" } },
  });
  if (!saved) return NextResponse.json({ result: null });

  return NextResponse.json({ result: JSON.parse(saved.result), updatedAt: saved.updatedAt });
}

export async function POST(req: NextRequest) {
  const { session, response, release } = await reserveFeatureForRoute(COMMERCIAL_FEATURE_KEYS.aiSimpleAction);
  if (!session) return response!;

  try {
    const { currentRole, targetRole, keySkills, bioSummary } = await req.json();
    if (!targetRole) {
      await release!.cancel();
      return NextResponse.json({ error: "Informe o cargo pretendido." }, { status: 400 });
    }

    const systemPrompt = `Você é um Top Voice do LinkedIn especialista em posicionamento profissional e branding pessoal.
Gere otimizações completas para o perfil do LinkedIn e postagens de autoridade.
Retorne um JSON estrito:
{
  "headlineOptions": ["...", "...", "..."],
  "aboutSection": "...",
  "experienceBullets": ["..."],
  "authorityPostSample": {
    "title": "...",
    "content": "..."
  }
}`;

    const userPrompt = `CARGO ATUAL/ÚLTIMO: ${currentRole || "Profissional"}
CARGO PRETENDIDO: ${targetRole}
PRINCIPAIS SKILLS: ${keySkills || "Geral da área"}
RESUMO/RESUMO HISTÓRICO: ${bioSummary || "Sem detalhes adicionais"}`;

    const data = await runJsonPrompt(systemPrompt, userPrompt, 0.3);

    await prisma.toolReviewResult.upsert({
      where: { userId_type: { userId: session.user.id, type: "linkedin" } },
      create: { userId: session.user.id, type: "linkedin", input: JSON.stringify({ currentRole, targetRole, keySkills, bioSummary }), result: JSON.stringify(data) },
      update: { input: JSON.stringify({ currentRole, targetRole, keySkills, bioSummary }), result: JSON.stringify(data) },
    });

    await release!.confirm();
    return NextResponse.json({ success: true, linkedin: data });
  } catch (error) {
    await release!.cancel();
    console.error("Erro ao otimizar perfil do LinkedIn:", error);
    return NextResponse.json({ error: "Erro ao gerar otimização do LinkedIn." }, { status: 500 });
  }
}
