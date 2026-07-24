import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { runJsonPrompt } from "@/lib/groq";
import { z } from "zod";

const quickSaveSchema = z.object({
  extractedRole: z.string(),
  extractedCompany: z.string(),
  location: z.string(),
  salaryEstimate: z.string(),
  keyRequirements: z.array(z.string()),
  quickSummary: z.string(),
});

export async function POST(req: Request) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json(
        { error: "Você precisa estar autenticado para salvar vagas." },
        { status: 401 }
      );
    }

    const body = await req.json();
    const { title = "", company = "", description = "", url = "" } = body;

    if (!description.trim()) {
      return NextResponse.json(
        { error: "Envie a descrição da vaga." },
        { status: 400 }
      );
    }

    const systemPrompt = `Você é um assistente de inteligência de recrutamento.
Sua missão é extrair as informações estruturadas de um anúncio de vaga de emprego colado pelo usuário.
Retorne um JSON com:
- extractedRole: título limpo do cargo
- extractedCompany: nome da empresa (ou "Empresa Confidencial" se não houver)
- location: cidade/estado ou "Remoto"
- salaryEstimate: faixa salarial informada ou estimativa realista
- keyRequirements: 3-6 requisitos técnicos/comportamentais mais importantes
- quickSummary: resumo em 2 frases sobre a oportunidade`;

    const userMessage = `TÍTULO: ${title}
EMPRESA: ${company}
URL: ${url}
DESCRIÇÃO COMPLETA:
${description}`;

    const extracted = await runJsonPrompt(
      systemPrompt,
      userMessage,
      0.2,
      2000,
      undefined,
      quickSaveSchema,
      "quick_save_job"
    );

    // Salvar candidatura no Kanban do usuário
    const application = await prisma.application.create({
      data: {
        userId: session.user.id,
        company: extracted.extractedCompany || company || "Empresa",
        jobTitle: extracted.extractedRole || title || "Cargo",
        status: "saved",
        jobUrl: url || "",
        notes: `Resumo: ${extracted.quickSummary}\n\nRequisitos: ${extracted.keyRequirements.join(", ")}`,
      },
    });

    return NextResponse.json({ success: true, application, extracted });
  } catch (error) {
    console.error("Erro ao salvar vaga rapidamente:", error);
    return NextResponse.json(
      { error: "Falha ao processar e salvar vaga no Kanban." },
      { status: 500 }
    );
  }
}
