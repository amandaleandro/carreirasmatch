import { NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { runJsonPrompt } from "@/lib/groq";
import { reserveFeatureForRoute } from "@/lib/feature-access";
import { COMMERCIAL_FEATURE_KEYS } from "@/lib/commercial-plan-catalog";

const kitSchema = z.object({
  summary: z.string().min(1),
  tailoredResumeBullets: z.array(z.string()).min(1).max(8),
  coverLetter: z.string().min(1),
  recruiterMessage: z.string().min(1),
  referralRequest: z.string().min(1),
  formAnswers: z.array(z.object({ question: z.string(), answer: z.string() })).max(8),
  interviewQuestions: z.array(z.string()).min(1).max(8),
  preparationPlan: z.array(z.string()).min(1).max(8),
  traceability: z.array(z.object({
    change: z.string(),
    source: z.string(),
    requirement: z.string(),
    confidence: z.enum(["alta", "média", "baixa"]),
  })).max(10),
});

function parseStringArray(value: string | null | undefined) {
  if (!value) return [];
  try {
    const parsed = JSON.parse(value);
    return Array.isArray(parsed) ? parsed.filter((item): item is string => typeof item === "string") : [];
  } catch {
    return [];
  }
}

export async function POST(request: Request) {
  const { session, response, release } = await reserveFeatureForRoute(COMMERCIAL_FEATURE_KEYS.resumeByJob);
  if (!session) return response!;

  const body = await request.json().catch(() => ({}));
  const applicationId = typeof body.applicationId === "string" ? body.applicationId : "";
  const language = body.language === "en" || body.language === "es" ? body.language : "pt-BR";
  if (!applicationId) {
    await release!.cancel();
    return NextResponse.json({ error: "Candidatura inválida." }, { status: 400 });
  }

  const application = await prisma.application.findFirst({
    where: { id: applicationId, userId: session.user.id },
    include: {
      job: { select: { jobText: true, jobTitle: true, company: true } },
      analysis: { select: { resumeId: true, keywordsFound: true, keywordsMissing: true, interviewQuestions: true, suggestedSummary: true } },
    },
  });
  if (!application) {
    await release!.cancel();
    return NextResponse.json({ error: "Candidatura não encontrada." }, { status: 404 });
  }

  const resumeId = application.analysis?.resumeId;
  const [resume, evidences] = await Promise.all([
    resumeId ? prisma.resume.findUnique({ where: { id: resumeId }, select: { rawText: true } }) : null,
    prisma.professionalEvidence.findMany({ where: { userId: session.user.id }, orderBy: { createdAt: "desc" }, take: 20 }),
  ]);

  const jobText = application.job?.jobText || application.notes || "Descrição não informada.";
  const requirements = [
    ...parseStringArray(application.analysis?.keywordsFound),
    ...parseStringArray(application.analysis?.keywordsMissing),
  ].slice(0, 20);
  const evidenceText = evidences.map((item) => `${item.title}: ${item.description}${item.metrics ? ` | Métrica: ${item.metrics}` : ""}`).join("\n");

  try {
    const kit = await runJsonPrompt(
      `Você é um estrategista de candidaturas. Gere um kit completo para esta oportunidade.
Regra obrigatória: não invente experiências, números, cargos, empresas ou competências. Use somente o currículo e as evidências fornecidos. Quando faltar evidência, escreva uma resposta honesta e sinalize a lacuna na rastreabilidade.
O kit deve ser direto, pronto para copiar e adaptado à vaga. Escreva no idioma solicitado: ${language === "en" ? "inglês internacional" : language === "es" ? "espanhol profissional" : "português do Brasil"}.
Inclua origem de cada alteração do currículo (currículo ou evidência), requisito relacionado e confiança.
Retorne somente JSON conforme o schema.`,
      `IDIOMA DO KIT: ${language}
VAGA: ${application.jobTitle} — ${application.company || application.job?.company || "Empresa"}
DESCRIÇÃO:
${jobText.slice(0, 18000)}

CURRÍCULO:
${(resume?.rawText || "Currículo não disponível.").slice(0, 16000)}

EVIDÊNCIAS PROFISSIONAIS:
${evidenceText || "Nenhuma evidência cadastrada."}

REQUISITOS JÁ IDENTIFICADOS:
${requirements.join(", ") || "Nenhum requisito estruturado."}`,
      0.2,
      6500,
      undefined,
      kitSchema,
      "application_kit"
    );
    await release!.confirm();
    return NextResponse.json({ success: true, kit });
  } catch (error) {
    await release!.cancel();
    console.error("Erro ao gerar kit de candidatura:", error);
    return NextResponse.json({ error: "Não foi possível gerar o kit agora." }, { status: 500 });
  }
}
