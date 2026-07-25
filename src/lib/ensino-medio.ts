import { runJsonAcrossProviders } from "@/lib/ai-providers";
import {
  YearId,
  SubjectMetadata,
  HIGH_SCHOOL_SUBJECTS,
} from "./ensino-medio-types";

export * from "./ensino-medio-types";

export function getSubjectBySlug(slug: string): SubjectMetadata | undefined {
  return HIGH_SCHOOL_SUBJECTS.find((s) => s.slug === slug);
}

export function getTopicsByYear(subject: SubjectMetadata, selectedYear: YearId): Array<{ topic: string; yearId: "1o-ano" | "2o-ano" | "3o-ano"; yearLabel: string }> {
  if (selectedYear === "1o-ano") {
    return subject.topicsByYear["1o-ano"].map(t => ({ topic: t, yearId: "1o-ano", yearLabel: "1º Ano" }));
  }
  if (selectedYear === "2o-ano") {
    return subject.topicsByYear["2o-ano"].map(t => ({ topic: t, yearId: "2o-ano", yearLabel: "2º Ano" }));
  }
  if (selectedYear === "3o-ano") {
    return subject.topicsByYear["3o-ano"].map(t => ({ topic: t, yearId: "3o-ano", yearLabel: "3º Ano & ENEM" }));
  }

  // All years
  return [
    ...subject.topicsByYear["1o-ano"].map(t => ({ topic: t, yearId: "1o-ano" as const, yearLabel: "1º Ano" })),
    ...subject.topicsByYear["2o-ano"].map(t => ({ topic: t, yearId: "2o-ano" as const, yearLabel: "2º Ano" })),
    ...subject.topicsByYear["3o-ano"].map(t => ({ topic: t, yearId: "3o-ano" as const, yearLabel: "3º Ano & ENEM" })),
  ];
}

export interface EnsinoMedioGeneratedContent {
  subjectName: string;
  topic: string;
  summary: {
    title: string;
    introduction: string;
    keyPoints: string[];
    enemTip: string;
  };
  careerGuidance: {
    collegePaths: Array<{ name: string; why: string }>;
    technicalPaths: Array<{ name: string; why: string }>;
    marketOutlook: string;
  };
  quiz: Array<{
    id: number;
    question: string;
    options: string[];
    correctAnswerIndex: number;
    explanation: string;
  }>;
  flashcards: Array<{
    id: number;
    front: string;
    back: string;
  }>;
  trueOrFalse: Array<{
    id: number;
    statement: string;
    isTrue: boolean;
    explanation: string;
  }>;
}

export async function generateEnsinoMedioMaterial(
  subjectSlug: string,
  topic: string
): Promise<EnsinoMedioGeneratedContent> {
  const subject = getSubjectBySlug(subjectSlug);
  const subjectName = subject ? subject.name : subjectSlug;

  const systemPrompt = `Você é um tutor especialista em Ensino Médio, ENEM e Orientação Vocacional para jovens no Brasil.
Seu objetivo é gerar um material de estudo completo, educativo, envolvente e focado na prática para a matéria de "${subjectName}" sobre o tópico "${topic}".

IMPORTANTE: O estudante também quer entender como este conhecimento se aplica no mercado de trabalho e quais opções de cursos superiores (Faculdade/Graduação) ou Cursos Técnicos se conectam com esse assunto.

Retorne EXATAMENTE um objeto JSON válido seguindo a estrutura:
{
  "subjectName": "${subjectName}",
  "topic": "${topic}",
  "summary": {
    "title": "Título chamativo do resumo",
    "introduction": "Explicação clara e didática de 2-3 parágrafos",
    "keyPoints": ["Ponto chave 1", "Ponto chave 2", "Ponto chave 3", "Ponto chave 4"],
    "enemTip": "Dica prática de como esse assunto costuma ser cobrado no ENEM ou vestibulares"
  },
  "careerGuidance": {
    "collegePaths": [
      { "name": "Nome da Faculdade/Curso", "why": "Como esta matéria se aplica nesta profissão" },
      { "name": "Nome da Faculdade/Curso", "why": "Como esta matéria se aplica nesta profissão" }
    ],
    "technicalPaths": [
      { "name": "Nome do Curso Técnico", "why": "Como este curso técnico aplica o assunto rapidamente no mercado" },
      { "name": "Nome do Curso Técnico", "why": "Como este curso técnico aplica o assunto rapidamente no mercado" }
    ],
    "marketOutlook": "Visão geral sobre oportunidades de carreira e salários para quem gosta desta área"
  },
  "quiz": [
    {
      "id": 1,
      "question": "Pergunta do quiz?",
      "options": ["Opção A", "Opção B", "Opção C", "Opção D"],
      "correctAnswerIndex": 0,
      "explanation": "Explicação por que a resposta está correta"
    }
  ],
  "flashcards": [
    { "id": 1, "front": "Conceito ou pergunta rápida", "back": "Resposta direta e fácil de memorizar" }
  ],
  "trueOrFalse": [
    { "id": 1, "statement": "Afirmação sobre o conteúdo", "isTrue": true, "explanation": "Explicação do motivo" }
  ]
}`;

  const userMessage = `Gere o material de estudo e jogos interativos para a matéria "${subjectName}" sobre o tópico "${topic}". Seja didático, encorajador e preciso.`;

  const rawJson = await runJsonAcrossProviders(
    systemPrompt,
    userMessage,
    0.7,
    4000,
    "llama-3.3-70b-versatile",
    undefined,
    "ensino_medio_generation",
    "gemini"
  );

  const parsed = JSON.parse(rawJson) as EnsinoMedioGeneratedContent;
  return parsed;
}
