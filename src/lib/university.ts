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
  courseName?: string,
  syllabus?: string
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
CURSO: ${courseName || "não informado"}${syllabus ? `\nEMENTA (use como base do conteúdo real da disciplina):\n${syllabus}` : ""}`;

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

export type SubjectExercise = {
  question: string;
  options: string[];
  correctIndex: number;
  explanation: string;
};

export type SubjectExerciseSet = { questions: SubjectExercise[] };

/** Gera uma lista de exercícios de múltipla escolha para uma disciplina universitária,
 * no nível de uma prova/lista de fixação de conteúdo — para o aluno praticar o que
 * aprendeu, não só entender a relevância de carreira (isso já é o insight). */
export async function generateSubjectExercises(
  subjectName: string,
  courseName?: string,
  syllabus?: string
): Promise<SubjectExerciseSet> {
  const systemPrompt = `Você é um professor universitário elaborando uma lista de exercícios de fixação para uma disciplina de graduação.
${BASE_RULES}
Formato de resposta:
{
  "questions": [
    {
      "question": string (enunciado claro e específico do conteúdo da disciplina, nível de graduação),
      "options": string[] (exatamente 4 alternativas plausíveis, apenas uma correta),
      "correctIndex": number (índice 0-3 da alternativa correta),
      "explanation": string (por que a alternativa correta está certa, 1-2 frases)
    }
  ] (gere exatamente 5 questões, variando o subtema dentro da disciplina)
}`;

  const userMessage = `DISCIPLINA: ${subjectName}
CURSO: ${courseName || "não informado"}${syllabus ? `\nEMENTA (baseie as questões nos tópicos reais listados aqui):\n${syllabus}` : ""}`;

  return runJsonPrompt<SubjectExerciseSet>(
    systemPrompt,
    userMessage,
    0.5,
    2200,
    undefined,
    undefined,
    "university_subject_exercises",
    "cerebras"
  );
}

export type SubjectStudyMaterial = {
  summary: string;
  topics: string[];
  keyPoints: string[];
};

/** Gera material de estudo (resumo + tópicos + pontos-chave) de uma disciplina
 * universitária — o "o que estudar e por onde começar", complementar à lista de
 * exercícios (que é prática) e ao insight de carreira (que é motivacional). */
export async function generateSubjectStudyMaterial(
  subjectName: string,
  courseName?: string,
  syllabus?: string
): Promise<SubjectStudyMaterial> {
  const systemPrompt = `Você é um professor universitário preparando material de estudo para uma disciplina de graduação.
${BASE_RULES}
Formato de resposta:
{
  "summary": string (resumo do conteúdo da disciplina em 3-5 frases, nível de graduação),
  "topics": string[] (4-8 tópicos/módulos de estudo, na ordem em que fazem sentido aprender),
  "keyPoints": string[] (4-6 pontos-chave ou conceitos que costumam cair em prova e o aluno não pode deixar de dominar)
}`;

  const userMessage = `DISCIPLINA: ${subjectName}
CURSO: ${courseName || "não informado"}${syllabus ? `\nEMENTA (use como base do conteúdo real da disciplina):\n${syllabus}` : ""}`;

  return runJsonPrompt<SubjectStudyMaterial>(
    systemPrompt,
    userMessage,
    0.4,
    2000,
    undefined,
    undefined,
    "university_subject_study_material",
    "cerebras"
  );
}

export type ExtractedCurriculumSubject = {
  name: string;
  syllabus: string;
};

/** Extrai a lista de disciplinas (com trecho de ementa, quando disponível) a partir do
 * texto de um PDF de grade curricular e/ou ementa enviado pelo aluno. */
export async function extractSubjectsFromCurriculumText(
  text: string,
  courseName?: string
): Promise<ExtractedCurriculumSubject[]> {
  const systemPrompt = `Você extrai a lista de disciplinas de um documento de grade curricular e/ou ementa de um curso de graduação brasileiro.
${BASE_RULES}
Formato de resposta:
{
  "subjects": [
    {
      "name": string (nome da disciplina, como aparece no documento, sem código/sigla),
      "syllabus": string (trecho da ementa dessa disciplina no documento — tópicos, conteúdo programático; "" se o documento não trouxer ementa, só o nome)
    }
  ]
}
Ignore linhas que não sejam disciplinas (carga horária isolada, cabeçalhos, rodapés, numeração de página). Não invente disciplinas que não estejam no texto.`;

  const userMessage = `CURSO: ${courseName || "não informado"}
TEXTO DO DOCUMENTO:
${text}`;

  const result = await runJsonPrompt<{ subjects: ExtractedCurriculumSubject[] }>(
    systemPrompt,
    userMessage,
    0.2,
    4000,
    undefined,
    undefined,
    "university_curriculum_pdf_extract",
    "cerebras"
  );

  return result.subjects.filter((s) => typeof s.name === "string" && s.name.trim().length > 0);
}
