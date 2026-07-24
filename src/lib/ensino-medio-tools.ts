import { runJsonAcrossProviders } from "@/lib/ai-providers";

// --- 1. Redação ENEM ---
export interface EnemEssayEvaluation {
  totalScore: number;
  competencies: Array<{
    number: number;
    name: string;
    score: number; // 0 to 200
    feedback: string;
  }>;
  overallFeedback: string;
  strengths: string[];
  improvements: string[];
  repertoireSuggestions: string[];
}

export async function evaluateEnemEssay(
  topic: string,
  essayText: string
): Promise<EnemEssayEvaluation> {
  const systemPrompt = `Você é um corretor oficial de redações do ENEM (Exame Nacional do Ensino Médio).
Sua missão é avaliar a redação do aluno sobre o tema "${topic}" de acordo com as 5 Competências oficiais do ENEM:
- Competência 1: Domínio da norma culta da língua escrita.
- Competência 2: Compreender a proposta e aplicar conceitos de várias áreas (repertório).
- Competência 3: Selecionar, relacionar, organizar e interpretar informações em defesa de um ponto de vista.
- Competência 4: Demonstração de conhecimento dos mecanismos linguísticos (coesão e conectivos).
- Competência 5: Elaboração de proposta de intervenção para o problema abordado (com 5 elementos: agente, ação, meio/modo, efeito e detalhamento).

A pontuação de cada competência deve ser obrigatoriamente um múltiplo de 40 (0, 40, 80, 120, 160, 200). A nota total é a soma das 5 (0 a 1000).

Retorne EXATAMENTE um objeto JSON válido no formato:
{
  "totalScore": 840,
  "competencies": [
    { "number": 1, "name": "Norma Culta", "score": 160, "feedback": "Análise detalhada..." },
    { "number": 2, "name": "Repertório Sociocultural", "score": 160, "feedback": "Análise detalhada..." },
    { "number": 3, "name": "Projeto de Texto e Argumentação", "score": 160, "feedback": "Análise detalhada..." },
    { "number": 4, "name": "Coesão Linguística", "score": 160, "feedback": "Análise detalhada..." },
    { "number": 5, "name": "Proposta de Intervenção", "score": 200, "feedback": "Análise detalhada..." }
  ],
  "overallFeedback": "Parecer geral encorajador e construtivo sobre o texto",
  "strengths": ["Ponto forte 1", "Ponto forte 2"],
  "improvements": ["Onde melhorar 1", "Onde melhorar 2"],
  "repertoireSuggestions": ["Sugestão de citação de autor/filósofo ou dado histórico"]
}`;

  const userMessage = `Tema: ${topic}\n\nRedação do aluno:\n"""\n${essayText}\n"""`;

  const rawJson = await runJsonAcrossProviders(
    systemPrompt,
    userMessage,
    0.5,
    3000,
    "llama-3.3-70b-versatile",
    undefined,
    "enem_essay_evaluation",
    "gemini"
  );

  return JSON.parse(rawJson) as EnemEssayEvaluation;
}

// --- 2. Cronograma de Estudos ---
export interface StudyScheduleInput {
  availableHoursPerDay: number;
  availableDays: string[]; // ex: ["Segunda", "Terça", "Quarta", "Quinta", "Sexta", "Sábado"]
  subjectLevels: Record<string, "fraco" | "medio" | "forte">;
  goal: string; // ex: "ENEM / Medicina", "Passar de ano no Ensino Médio", "Vestibular FUVEST"
}

export interface GeneratedStudySchedule {
  title: string;
  totalWeeklyHours: number;
  weeklyPlan: Array<{
    day: string;
    slots: Array<{
      time: string;
      subject: string;
      activity: string; // "Teoria", "Exercícios", "Revisão por Flashcards", "Simulado"
      tip: string;
    }>;
  }>;
  weeklyRecommendations: string[];
}

export async function generateStudySchedule(
  input: StudyScheduleInput
): Promise<GeneratedStudySchedule> {
  const systemPrompt = `Você é um mentor especialista em organização de estudos para vestibulares e Ensino Médio no Brasil.
Monte um cronograma semanal realista, focado e de alta performance com base nas informações do aluno.

Retorne EXATAMENTE um objeto JSON no formato:
{
  "title": "Plano de Estudos Personalizado para Foco em ENEM",
  "totalWeeklyHours": 15,
  "weeklyPlan": [
    {
      "day": "Segunda-feira",
      "slots": [
        { "time": "08:00 - 09:00", "subject": "Matemática", "activity": "Teoria & Resumos", "tip": "Focar em Geometria Plana" },
        { "time": "09:15 - 10:15", "subject": "Física", "activity": "Exercícios Práticos", "tip": "Resolver 10 questões de Mecânica" }
      ]
    }
  ],
  "weeklyRecommendations": ["Dica 1 para não acumular matéria", "Dica 2 para desanso ativo"]
}`;

  const userMessage = `Horas/dia: ${input.availableHoursPerDay}\nDias: ${input.availableDays.join(", ")}\nObjetivo: ${input.goal}\nNíveis por matéria: ${JSON.stringify(input.subjectLevels)}`;

  const rawJson = await runJsonAcrossProviders(
    systemPrompt,
    userMessage,
    0.7,
    3500,
    "llama-3.3-70b-versatile",
    undefined,
    "study_schedule_generation",
    "gemini"
  );

  return JSON.parse(rawJson) as GeneratedStudySchedule;
}

// --- 3. Comparador SISU / PROUNI (Faculdade vs Técnico) ---
export interface CourseComparison {
  query: string;
  summary: string;
  collegePath: {
    title: string;
    degreeType: "Bacharelado" | "Licenciatura" | "Tecnólogo";
    averageDurationYears: number;
    sisuCutoffScoreEstimate: string;
    monthlyFeeRange: string;
    pros: string[];
    cons: string[];
    typicalJobs: string[];
  };
  technicalPath: {
    title: string;
    averageDurationYears: number;
    entryRequirements: string;
    pros: string[];
    cons: string[];
    typicalJobs: string[];
    initialSalaryEstimate: string;
  };
  verdict: string;
}

export async function compareCollegeVsTechnical(
  query: string
): Promise<CourseComparison> {
  const systemPrompt = `Você é um orientador de carreiras especialista no ensino brasileiro.
Compare de forma imparcial e detalhada as opções de **Faculdade (Graduação)** vs **Curso Técnico** para a área ou curso buscado pelo aluno: "${query}".

Retorne EXATAMENTE um objeto JSON no formato:
{
  "query": "${query}",
  "summary": "Resumo executivo comparativo",
  "collegePath": {
    "title": "Engenharia de Software / Ciência da Computação",
    "degreeType": "Bacharelado",
    "averageDurationYears": 4,
    "sisuCutoffScoreEstimate": "720 - 780 pontos",
    "monthlyFeeRange": "R$ 800 a R$ 2.500",
    "pros": ["Maior teto salarial no longo prazo", "Acesso a cargos de liderança/pesquisa"],
    "cons": ["Duração mais longa", "Grade teórica extensa"],
    "typicalJobs": ["Engenheiro de Software Senior", "Arquiteto de Sistemas"]
  },
  "technicalPath": {
    "title": "Técnico em Desenvolvimento de Sistemas",
    "averageDurationYears": 1.5,
    "entryRequirements": "Ensino Médio cursando ou concluído",
    "pros": ["Entrada rápida no mercado de trabalho", "Foco 100% prático"],
    "cons": ["Menor teto inicial sem especialização"],
    "typicalJobs": ["Desenvolvedor Junior", "Suporte Técnico", "Programador Web"],
    "initialSalaryEstimate": "R$ 2.500 - R$ 4.000"
  },
  "verdict": "Recomendação personalizada dependendo se o aluno precisa trabalhar rápido ou busca carreira de longo prazo"
}`;

  const userMessage = `Compare Faculdade vs Técnico para a área ou curso: "${query}".`;

  const rawJson = await runJsonAcrossProviders(
    systemPrompt,
    userMessage,
    0.6,
    3000,
    "llama-3.3-70b-versatile",
    undefined,
    "course_comparison",
    "gemini"
  );

  return JSON.parse(rawJson) as CourseComparison;
}

// --- 4. Tutor Virtual (Monitoria Chat) ---
export interface TutorChatMessage {
  role: "user" | "assistant";
  content: string;
}

export interface TutorResponse {
  message: string;
  suggestedFollowUps: string[];
}

export async function askVirtualTutor(
  messages: TutorChatMessage[],
  subject?: string
): Promise<TutorResponse> {
  const systemPrompt = `Você é o "Tutor IA", um professor de monitoria escolar extremamente amigável, didático e encorajador para alunos do Ensino Médio no Brasil.
${subject ? `Seu foco nesta conversa é a matéria de ${subject}.` : ""}
Sua missão é ajudar o aluno a entender qualquer conceito, tirar dúvidas de dever de casa ou resolver problemas passo a passo.
Importante: não dê apenas a resposta final do problema, explique o raciocínio de forma pedagógica!

Retorne EXATAMENTE um objeto JSON no formato:
{
  "message": "Sua resposta didática e estruturada...",
  "suggestedFollowUps": ["Quer ver um exemplo prático?", "Ficou com dúvida sobre o passo 2?"]
}`;

  const formattedHistory = messages
    .map((m) => `${m.role === "user" ? "Aluno" : "Tutor"}: ${m.content}`)
    .join("\n\n");

  const rawJson = await runJsonAcrossProviders(
    systemPrompt,
    formattedHistory,
    0.7,
    2500,
    "llama-3.3-70b-versatile",
    undefined,
    "tutor_chat",
    "gemini"
  );

  return JSON.parse(rawJson) as TutorResponse;
}

// --- 5. Questão do Dia ---
export interface DailyQuestion {
  date: string;
  subject: string;
  topic: string;
  enemYearOrOrigin: string;
  question: string;
  options: string[];
  correctAnswerIndex: number;
  hint: string;
  explanation: string;
}

export async function getDailyQuestion(): Promise<DailyQuestion> {
  const todayStr = new Date().toISOString().slice(0, 10);

  const systemPrompt = `Você é um elaborador de questões do ENEM e vestibulares de elite (FUVEST, UNICAMP, UERJ).
Gere uma questão inédita e de excelente qualidade para o desafio do dia (${todayStr}) cobrindo uma matéria fundamental do Ensino Médio.

Retorne EXATAMENTE um objeto JSON no formato:
{
  "date": "${todayStr}",
  "subject": "Física",
  "topic": "Conservação de Energia Elétrica",
  "enemYearOrOrigin": "Estilo ENEM 2024",
  "question": "Um chuveiro elétrico de 4.400 W...",
  "options": ["A) 11 kWh", "B) 22 kWh", "C) 33 kWh", "D) 44 kWh"],
  "correctAnswerIndex": 1,
  "hint": "Lembre-se que Potência (kW) = Energia (kWh) / Tempo (h).",
  "explanation": "Resolução passo a passo mostrando a fórmula e substituição dos valores."
}`;

  const userMessage = `Gere a questão do dia para a data de hoje: ${todayStr}.`;

  const rawJson = await runJsonAcrossProviders(
    systemPrompt,
    userMessage,
    0.7,
    2500,
    "llama-3.3-70b-versatile",
    undefined,
    "daily_question",
    "gemini"
  );

  return JSON.parse(rawJson) as DailyQuestion;
}

// --- 6. Calculadora & Simulador ENEM ---
export interface EnemScoresInput {
  linguagens: number;
  humanas: number;
  natureza: number;
  matematica: number;
  redacao: number;
  targetCourse: string;
}

export interface EnemAnalysisResult {
  simpleAverage: number;
  weightedAverage: number;
  course: string;
  weightsUsed: {
    linguagens: number;
    humanas: number;
    natureza: number;
    matematica: number;
    redacao: number;
  };
  chancesAssessment: string;
  recommendations: string[];
  alternativeTechnicalCourses: string[];
}

export async function calculateEnemAnalysis(
  input: EnemScoresInput
): Promise<EnemAnalysisResult> {
  const systemPrompt = `Você é um especialista em SISU, PROUNI e TRI do ENEM.
Dado as 5 notas do aluno no ENEM e o curso desejado ("${input.targetCourse}"), analise o perfil de pontuação:
- Determine os pesos aproximados típicos exigidos para este curso nas universidades federais/estaduais.
- Calcule a média ponderada estimada.
- Avalie a competitividade (Baixa, Média, Alta, Excelente).
- Sugira alternativas de Cursos Técnicos de rápida inserção se o aluno quiser uma alternativa rápida.

Retorne EXATAMENTE um objeto JSON no formato:
{
  "simpleAverage": 710,
  "weightedAverage": 735,
  "course": "${input.targetCourse}",
  "weightsUsed": { "linguagens": 1, "humanas": 1, "natureza": 2, "matematica": 3, "redacao": 2 },
  "chancesAssessment": "Boa competitividade para universidades regionais e ótimas chances no PROUNI/FIES.",
  "recommendations": ["Aumentar a nota de Matemática para subir 25 pontos no ranking", "Manter a redação acima de 800"],
  "alternativeTechnicalCourses": ["Técnico em Análises Clínicas", "Técnico em Enfermagem"]
}`;

  const simpleAvg = Math.round(
    (input.linguagens + input.humanas + input.natureza + input.matematica + input.redacao) / 5
  );

  const userMessage = `Notas ENEM: Linguagens: ${input.linguagens}, Humanas: ${input.humanas}, Natureza: ${input.natureza}, Matemática: ${input.matematica}, Redação: ${input.redacao}. Média Simples: ${simpleAvg}. Curso Alvo: ${input.targetCourse}.`;

  const rawJson = await runJsonAcrossProviders(
    systemPrompt,
    userMessage,
    0.6,
    2500,
    "llama-3.3-70b-versatile",
    undefined,
    "enem_calculator_analysis",
    "gemini"
  );

  return JSON.parse(rawJson) as EnemAnalysisResult;
}
