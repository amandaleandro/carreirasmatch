import { NextResponse } from "next/server";
import { runJsonAcrossProviders } from "@/lib/ai-providers";
import { getSubjectBySlug } from "@/lib/ensino-medio";
import { reserveFeatureForRoute } from "@/lib/feature-access";
import { COMMERCIAL_FEATURE_KEYS } from "@/lib/commercial-plan-catalog";

export interface GeneratedMindMapNode {
  title: string;
  description: string;
  children?: GeneratedMindMapNode[];
}

export interface GeneratedMindMap {
  subjectName: string;
  topic: string;
  yearLabel: string;
  root: GeneratedMindMapNode;
}

export async function POST(req: Request) {
  const { session, response, release } = await reserveFeatureForRoute(COMMERCIAL_FEATURE_KEYS.studyTool);
  if (!session) return response!;

  try {
    const { subjectSlug, yearId, topic } = await req.json();

    const subject = getSubjectBySlug(subjectSlug);
    const subjectName = subject ? subject.name : subjectSlug;

    const yearLabels: Record<string, string> = {
      "1o-ano": "1º Ano do Ensino Médio",
      "2o-ano": "2º Ano do Ensino Médio",
      "3o-ano": "3º Ano & ENEM",
      all: "Ensino Médio Completo",
    };

    const targetYearLabel = yearLabels[yearId] || yearLabels["all"];
    const topicToUse = topic ? topic.trim() : "Visão Geral da Matéria";

    const systemPrompt = `Você é um especialista em psicologia da aprendizagem e mapas conceituais para estudantes do Ensino Médio no Brasil.
Seu objetivo é gerar um mapa mental conceitual estruturado em árvore (nó central -> 3 a 4 ramos principais -> 2 sub-ramos cada) para a matéria de "${subjectName}" (${targetYearLabel}) sobre o tópico "${topicToUse}".

Retorne EXATAMENTE um objeto JSON válido seguindo a estrutura:
{
  "subjectName": "${subjectName}",
  "topic": "${topicToUse}",
  "yearLabel": "${targetYearLabel}",
  "root": {
    "title": "${topicToUse}",
    "description": "Conceito central resumido em uma frase",
    "children": [
      {
        "title": "Ramo Principal 1",
        "description": "Explicação curta do primeiro pilar",
        "children": [
          { "title": "Sub-conceito 1.1", "description": "Detalhe prático ou aplicação" },
          { "title": "Sub-conceito 1.2", "description": "Detalhe prático ou aplicação" }
        ]
      },
      {
        "title": "Ramo Principal 2",
        "description": "Explicação curta do segundo pilar",
        "children": [
          { "title": "Sub-conceito 2.1", "description": "Detalhe prático ou aplicação" },
          { "title": "Sub-conceito 2.2", "description": "Detalhe prático ou aplicação" }
        ]
      },
      {
        "title": "Ramo Principal 3",
        "description": "Explicação curta do terceiro pilar",
        "children": [
          { "title": "Sub-conceito 3.1", "description": "Detalhe prático ou aplicação" },
          { "title": "Sub-conceito 3.2", "description": "Detalhe prático ou aplicação" }
        ]
      }
    ]
  }
}`;

    const userMessage = `Gere um mapa mental conceitual em árvore sobre ${topicToUse} na matéria ${subjectName} (${targetYearLabel}).`;

    const rawJson = await runJsonAcrossProviders(
      systemPrompt,
      userMessage,
      0.7,
      4000,
      "llama-3.3-70b-versatile",
      undefined,
      "ensino_medio_mapa_mental",
      "gemini"
    );

    const parsed = JSON.parse(rawJson) as GeneratedMindMap;
    await release!.confirm();
    return NextResponse.json(parsed);
  } catch (error) {
    await release!.cancel();
    console.error("[API ensino-medio/mapa-mental/gerar] Erro:", error);
    return NextResponse.json(
      { error: "Falha ao gerar mapa mental. Tente novamente." },
      { status: 500 }
    );
  }
}
