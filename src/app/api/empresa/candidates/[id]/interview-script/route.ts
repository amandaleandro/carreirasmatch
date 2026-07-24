import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireCompanyApi } from "@/lib/company-auth";
import { runJsonPrompt } from "@/lib/groq";

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { company } = await requireCompanyApi();
    const { id } = await params;

    const candidate = await prisma.companyCandidate.findUnique({
      where: { id },
      include: {
        job: { select: { companyId: true, title: true, description: true } },
      },
    });

    if (!company || !candidate || candidate.job.companyId !== company.id) {
      return NextResponse.json({ error: "Candidato não encontrado." }, { status: 404 });
    }

    const systemPrompt = `Você é um gestor especialista em R&S (Recrutamento e Seleção).
Sua tarefa é gerar um ROTEIRO PRÁTICO DE ENTREVISTA para o recrutador aplicar a este candidato em relação à vaga.
Siga o formato JSON estrito:
{
  "keyQuestions": [
    { "question": "...", "objective": "...", "idealAnswer": "..." }
  ],
  "technicalProbes": ["..."],
  "behavioralScenarios": ["..."],
  "redFlagsToInvestigate": ["..."]
}`;

    const userPrompt = `VAGA: ${candidate.job.title}
DESCRIÇÃO DA VAGA: ${candidate.job.description}

NOME DO CANDIDATO: ${candidate.candidateName || candidate.fileName}
FIT SCORE INICIAL: ${candidate.fitScore}%
JUSTIFICATIVA INICIAL: ${candidate.reason}

TEXTO DO CURRÍCULO DO CANDIDATO:
${candidate.rawText.slice(0, 3500)}`;

    const script = await runJsonPrompt(systemPrompt, userPrompt, 0.2);

    return NextResponse.json({
      success: true,
      candidateName: candidate.candidateName || candidate.fileName,
      jobTitle: candidate.job.title,
      script,
    });
  } catch (error) {
    console.error("Erro ao gerar script de entrevista:", error);
    return NextResponse.json({ error: "Erro ao gerar script com IA." }, { status: 500 });
  }
}
