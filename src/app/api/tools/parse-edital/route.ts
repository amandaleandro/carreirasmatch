import { NextRequest, NextResponse } from "next/server";
import { runJsonPrompt } from "@/lib/groq";
import { logStudyActivity } from "@/lib/study-activity";
import { reserveFeatureForRoute } from "@/lib/feature-access";
import { COMMERCIAL_FEATURE_KEYS } from "@/lib/commercial-plan-catalog";

export async function POST(req: NextRequest) {
  const { session, response, release } = await reserveFeatureForRoute(COMMERCIAL_FEATURE_KEYS.studyTool);
  if (!session) return response!;

  try {
    const { editalText, targetRole } = await req.json();
    if (!editalText || typeof editalText !== "string") {
      await release!.cancel();
      return NextResponse.json({ error: "Cole o texto do edital para analisar." }, { status: 400 });
    }

    const systemPrompt = `Você é um especialista em análise de editais de concursos públicos e exames da OAB.
Analise o texto do edital fornecido e extraia a estrutura de disciplinas e planejamento de estudo.
Retorne um JSON com a seguinte estrutura exata:
{
  "concursoTitle": "...",
  "banca": "...",
  "totalVagas": "...",
  "salaryLabel": "...",
  "subjects": [
    { "name": "...", "weight": "Alta | Média | Baixa", "estimatedHoursWeek": 4, "keyTopics": ["..."] }
  ],
  "studyPlanCycle": [
    { "day": "Dia 1", "focusSubject": "...", "activity": "Estudo teórico + 20 questões" }
  ],
  "criticalDates": ["..."]
}`;

    const userPrompt = `CARGO DE INTERESSE: ${targetRole || "Geral / Não informado"}
TEXTO DO EDITAL:
${editalText.slice(0, 5000)}`;

    const parsedData = await runJsonPrompt(systemPrompt, userPrompt, 0.2);

    void logStudyActivity(session.user.id, "edital");

    await release!.confirm();
    return NextResponse.json({ success: true, parsedData });
  } catch (error) {
    await release!.cancel();
    console.error("Erro ao analisar edital:", error);
    return NextResponse.json({ error: "Não foi possível analisar o edital no momento." }, { status: 500 });
  }
}
