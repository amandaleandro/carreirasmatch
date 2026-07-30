import { runJsonPrompt } from "@/lib/groq";

export type SubjectCareerInsight = {
  competencies: string[];
  relatedProfessions: string[];
  suggestedProject: string;
};

const BASE_RULES = `Responda SEMPRE em português do Brasil. Responda SOMENTE com um objeto JSON válido, sem texto antes ou depois.`;

/** Gera a "conexão com carreira" de uma disciplina universitária: que competências ela
 * desenvolve, quais profissões se relacionam com ela e um projeto prático que o aluno
 * pode fazer para transformar o conteúdo em algo demonstrável no currículo. */
export async function generateSubjectCareerInsight(
  subjectName: string,
  courseName?: string
): Promise<SubjectCareerInsight> {
  const systemPrompt = `Você é um orientador de carreira que ajuda universitários a entender como cada disciplina do curso se conecta ao mercado de trabalho.
${BASE_RULES}
Formato de resposta:
{
  "competencies": string[] (3-5 competências práticas e específicas que essa disciplina desenvolve, evite termos vagos como "raciocínio lógico" sozinho — seja concreto),
  "relatedProfessions": string[] (2-4 profissões ou cargos reais do mercado brasileiro que valorizam essa disciplina),
  "suggestedProject": string (1 projeto prático e específico, viável de fazer sozinho, que transforma o conteúdo da disciplina em algo demonstrável no currículo ou portfólio)
}`;

  const userMessage = `DISCIPLINA: ${subjectName}
CURSO: ${courseName || "não informado"}`;

  return runJsonPrompt<SubjectCareerInsight>(
    systemPrompt,
    userMessage,
    0.4,
    1200,
    undefined,
    undefined,
    "university_subject_insight",
    "cerebras"
  );
}
