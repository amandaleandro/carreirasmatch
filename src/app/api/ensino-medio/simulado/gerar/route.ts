import { NextResponse } from "next/server";
import { runJsonAcrossProviders } from "@/lib/ai-providers";
import { getSubjectBySlug } from "@/lib/ensino-medio";
import { logStudyActivity } from "@/lib/study-activity";
import { reserveFeatureForRoute } from "@/lib/feature-access";
import { COMMERCIAL_FEATURE_KEYS } from "@/lib/commercial-plan-catalog";

export interface GeneratedSimulado {
  title: string;
  yearLabel: string;
  subjectName: string;
  questions: Array<{
    id: number;
    subjectName: string;
    topic: string;
    question: string;
    options: string[];
    correctAnswerIndex: number;
    explanation: string;
    enemTip: string;
  }>;
}

export async function POST(req: Request) {
  const { session, response, release } = await reserveFeatureForRoute(COMMERCIAL_FEATURE_KEYS.studyTool);
  if (!session) return response!;

  try {
    const { subjectSlug, yearId, numQuestions = 5 } = await req.json();

    const isAllSubjects = subjectSlug === "todas" || !subjectSlug;
    const subject = !isAllSubjects ? getSubjectBySlug(subjectSlug) : null;
    const subjectName = subject ? subject.name : "Geral (Todas as Matérias)";

    const yearLabels: Record<string, string> = {
      "1o-ano": "1º Ano do Ensino Médio",
      "2o-ano": "2º Ano do Ensino Médio",
      "3o-ano": "3º Ano & ENEM",
      all: "Ensino Médio Completo (1º ao 3º Ano)",
    };

    const targetYearLabel = yearLabels[yearId] || yearLabels["all"];

    const systemPrompt = `Você é uma banca examinadora de vestibulares e do ENEM no Brasil, especialista em elaboração de testes escolares para o Ensino Médio.
Seu objetivo é gerar um simulado inédito de alta qualidade com ${numQuestions} questões objetivas focadas no conteúdo de "${subjectName}" para o "${targetYearLabel}".

Cada questão deve conter:
- 4 opções de resposta (índices 0 a 3).
- Resposta correta (correctAnswerIndex).
- Explicação didática e detalhada da solução.
- Uma dica prática no estilo ENEM/Vestibular.

Retorne EXATAMENTE um objeto JSON válido seguindo a estrutura:
{
  "title": "Simulado de ${subjectName} - ${targetYearLabel}",
  "yearLabel": "${targetYearLabel}",
  "subjectName": "${subjectName}",
  "questions": [
    {
      "id": 1,
      "subjectName": "Nome da matéria",
      "topic": "Tópico avaliado",
      "question": "Texto da questão?",
      "options": ["Opção A", "Opção B", "Opção C", "Opção D"],
      "correctAnswerIndex": 0,
      "explanation": "Explicação completa por que esta é a alternativa correta",
      "enemTip": "Dica de como este conceito aparece nas provas"
    }
  ]
}`;

    const userMessage = `Gere um simulado com ${numQuestions} questões para ${subjectName} focando na grade do ${targetYearLabel}.`;

    const rawJson = await runJsonAcrossProviders(
      systemPrompt,
      userMessage,
      0.7,
      4000,
      "llama-3.3-70b-versatile",
      undefined,
      "ensino_medio_simulado",
      "gemini"
    );

    const parsed = JSON.parse(rawJson) as GeneratedSimulado;

    void logStudyActivity(session.user.id, "simulado_enem");

    await release!.confirm();
    return NextResponse.json(parsed);
  } catch (error) {
    await release!.cancel();
    console.error("[API ensino-medio/simulado/gerar] Erro:", error);
    return NextResponse.json(
      { error: "Falha ao gerar simulado. Tente novamente." },
      { status: 500 }
    );
  }
}
