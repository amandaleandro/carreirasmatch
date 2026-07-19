import { runJsonPrompt, type StructuredResume } from "@/lib/groq";
import { asOptionalText, asScore, asStringArray, asText } from "@/lib/ai-shape";
import { VOCATION_AREAS, type VocationAreaConfig } from "@/lib/vocation-areas";
import {
  SOFT_SKILL_LABELS,
  PERSONALITY_TRAIT_LABELS,
  type SoftSkillDimension,
  type PersonalityTrait,
} from "@/lib/behavioral-test";

const BASE_RULES = `Responda SEMPRE em português do Brasil. Seja específico e baseie-se apenas em fatos fornecidos pelo usuário, nunca invente experiência, ferramentas ou resultados que não foram mencionados. Responda SOMENTE com um objeto JSON válido, sem texto antes ou depois.`;

function runToolJsonPrompt<T>(
  operation: string,
  systemPrompt: string,
  userMessage: string,
  temperature = 0.2,
  maxCompletionTokens = 3500
): Promise<T> {
  return runJsonPrompt<T>(
    systemPrompt,
    userMessage,
    temperature,
    maxCompletionTokens,
    undefined,
    undefined,
    operation
  );
}

// --- Transformar projeto em experiência ---

export type ProjectToExperienceResult = {
  title: string;
  bullets: string[];
};

export async function generateProjectExperience(
  projectDescription: string,
  targetArea: string
): Promise<ProjectToExperienceResult> {
  const systemPrompt = `Você é um especialista em currículos que transforma descrições informais de projetos (acadêmicos, pessoais, TCC, cursos, voluntariado, GitHub) em uma seção profissional de currículo, no estilo de experiência de trabalho.
${BASE_RULES}
Formato de resposta:
{
  "title": string (título curto para a seção, ex: "Projeto acadêmico, Sistema de controle de tarefas"),
  "bullets": string[] (3 a 5 bullets no estilo currículo, começando com verbo de ação, destacando tecnologias, decisões técnicas e organização/processo, SEM inventar métricas de impacto que não foram informadas)
}`;

  const userMessage = `ÁREA-ALVO (cargo/vaga que a pessoa busca): ${targetArea || "não informado"}

DESCRIÇÃO DO PROJETO (como a pessoa mesma descreveu, de forma informal):
${projectDescription}`;

  return runToolJsonPrompt<ProjectToExperienceResult>("project_to_experience", systemPrompt, userMessage);
}

// --- Vocação de carreira ---

export type VocationAnswers = {
  enjoysProblemSolving: string;
  prefersPeopleOrSystems: string;
  interestAreas: string;
  workStylePreference: string;
  priorExperience: string;
};

export type VocationResult = {
  recommendedAreas: {
    area: string;
    fitReason: string;
    firstSteps: string[];
  }[];
  accessibleAreasFromResume: string[];
};

export async function analyzeVocationTest(
  area: VocationAreaConfig,
  answers: VocationAnswers,
  resumeText: string,
  alreadyEnrolled = false
): Promise<VocationResult> {
  const enrolledGuidance = alreadyEnrolled
    ? `\nA pessoa JÁ ESTÁ CURSANDO faculdade/técnico em ${area.label}, ela não está decidindo se quer entrar na área, e sim escolhendo sua especialização/caminho dentro do curso que já faz. Ajuste "firstSteps" para passos de quem já é aluno(a): matérias eletivas para priorizar, tipos de estágio para buscar, temas de TCC/projeto final, monitorias ou iniciação científica relacionadas, nunca passos de "como entrar na área".`
    : "";

  const systemPrompt = `Você é um orientador de carreira especializado em ${area.label}. Sua tarefa é, com base nas respostas de um quiz de interesses e (se disponível) no currículo da pessoa, recomendar os caminhos dentro de ${area.label} mais alinhados ao perfil dela.
${BASE_RULES}
Áreas possíveis incluem (mas não se limitam a): ${area.subareas.join(", ")}.${enrolledGuidance}
Formato de resposta:
{
  "recommendedAreas": [
    { "area": string, "fitReason": string (2-3 frases conectando as respostas do quiz a essa área), "firstSteps": string[] (2-3 primeiros passos práticos para começar nessa área) }
  ] (3 áreas, ordenadas da mais alinhada para a menos alinhada),
  "accessibleAreasFromResume": string[] (2-4 áreas onde o candidato, considerando SOMENTE o que já aparece no currículo abaixo, teria mais chance de entrada agora; array vazio se não houver currículo)
}`;

  const userMessage = `RESPOSTAS DO QUIZ:
- O que mais gosta de fazer: ${answers.enjoysProblemSolving}
- Prefere trabalhar mais com pessoas ou com sistemas/máquinas: ${answers.prefersPeopleOrSystems}
- Áreas de interesse dentro de ${area.label}: ${answers.interestAreas}
- Estilo de trabalho preferido: ${answers.workStylePreference}
- Experiência prévia relevante: ${answers.priorExperience}

CURRÍCULO (pode estar vazio se a pessoa não enviou):
${resumeText || "(não informado)"}`;

  return runToolJsonPrompt<VocationResult>("vocation_test", systemPrompt, userMessage);
}

// --- Descoberta de área ampla (Etapa 1) ---

export type DiscoveryAnswers = {
  enjoys: string;
  peopleOrSystems: string;
  workStyle: string;
  educationPreference: string;
};

export type DiscoveryResult = {
  recommendedAreas: {
    areaSlug: string;
    areaLabel: string;
    fitReason: string;
    suggestedPath: "faculdade" | "tecnico" | "ambos";
    pathReason: string;
  }[];
};

export async function analyzeCareerDiscovery(
  answers: DiscoveryAnswers,
  resumeText: string
): Promise<DiscoveryResult> {
  const areaCatalog = VOCATION_AREAS.map((a) => `- ${a.slug}: ${a.label}, ${a.description}`).join(
    "\n"
  );

  const systemPrompt = `Você é um orientador vocacional que ajuda pessoas que ainda não sabem qual área de carreira seguir. Sua tarefa é, com base nas respostas de um quiz de interesses e (se disponível) no currículo da pessoa, recomendar as áreas amplas mais alinhadas ao perfil dela, escolhendo SOMENTE entre as áreas do catálogo abaixo.
${BASE_RULES}
CATÁLOGO DE ÁREAS (use exatamente estes slugs):
${areaCatalog}
Além da área, para cada recomendação diga se o caminho ideal é faculdade, curso técnico ou ambos, considere a preferência informada pela pessoa (PREFERÊNCIA_EDUCACIONAL), mas seja honesto se a área normalmente exigir um caminho específico (ex: Medicina exige faculdade).
Formato de resposta:
{
  "recommendedAreas": [
    {
      "areaSlug": string (um dos slugs do catálogo),
      "areaLabel": string (o label correspondente do catálogo),
      "fitReason": string (2-3 frases conectando as respostas do quiz a essa área),
      "suggestedPath": "faculdade" | "tecnico" | "ambos",
      "pathReason": string (1-2 frases explicando essa sugestão de trilha educacional)
    }
  ] (3 áreas, ordenadas da mais alinhada para a menos alinhada)
}`;

  const userMessage = `RESPOSTAS DO QUIZ:
- O que mais gosta de fazer: ${answers.enjoys}
- Prefere trabalhar mais com pessoas ou com sistemas/máquinas: ${answers.peopleOrSystems}
- Estilo de trabalho preferido: ${answers.workStyle}
- Preferência educacional (PREFERÊNCIA_EDUCACIONAL): ${answers.educationPreference}

CURRÍCULO (pode estar vazio se a pessoa não enviou):
${resumeText || "(não informado)"}`;

  return runToolJsonPrompt<DiscoveryResult>("career_discovery", systemPrompt, userMessage);
}

// --- Área do dia ---

export type AreaOfTheDayResult = {
  whatItIs: string;
  dailyRoutine: string;
  educationPath: string;
  marketOutlook: string;
  funFact: string;
};

export async function generateAreaOfTheDayExplanation(
  area: VocationAreaConfig
): Promise<AreaOfTheDayResult> {
  const systemPrompt = `Você é um orientador vocacional que explica áreas profissionais de forma clara para estudantes do ensino médio que ainda não decidiram entre faculdade ou curso técnico.
${BASE_RULES}
Formato de resposta:
{
  "whatItIs": string (2-3 frases explicando o que é a área de ${area.label} e o que um profissional dela faz no dia a dia, em linguagem simples),
  "dailyRoutine": string (2-3 frases descrevendo uma rotina típica de trabalho nessa área),
  "educationPath": string (2-3 frases comparando o caminho de faculdade x curso técnico para entrar nessa área, honesto sobre tempo e exigências de cada um),
  "marketOutlook": string (2-3 frases sobre mercado de trabalho e perspectivas nessa área no Brasil),
  "funFact": string (1 curiosidade interessante e verdadeira sobre a área, 1-2 frases)
}`;

  const userMessage = `ÁREA: ${area.label}
Subáreas possíveis: ${area.subareas.join(", ")}`;

  return runToolJsonPrompt<AreaOfTheDayResult>("area_of_day", systemPrompt, userMessage);
}

// --- Mapa de estudos para ENEM/vestibular ---

export type ExamType = "enem" | "vestibular" | "ambos";

export type ExamMapAnswers = {
  examType: ExamType;
  timeUntilExam: string;
  weeklyStudyHours: string;
  subjectStrengths: string[];
  subjectWeaknesses: string[];
};

export type WeeklyScheduleBlock = {
  week: number;
  focus: string;
  tasks: string[];
};

export type ExamMapResult = {
  studyPlan: {
    essential: string[];
    niceToHave: string[];
    later: string[];
  };
  essayTips: string[];
  weeklySchedule: WeeklyScheduleBlock[];
  courseCutoffNote: string;
  motivationalNote: string;
};

const STUDY_CALENDAR_WEEKS = 6;

export async function generateExamMap(
  area: VocationAreaConfig,
  answers: ExamMapAnswers
): Promise<ExamMapResult> {
  const examLabel =
    answers.examType === "enem"
      ? "o ENEM"
      : answers.examType === "vestibular"
      ? "vestibulares tradicionais"
      : "o ENEM e vestibulares tradicionais";

  const systemPrompt = `Você é um orientador de estudos especializado em preparar estudantes do ensino médio para ${examLabel}, com foco em quem quer entrar no curso de ${area.label}.
${BASE_RULES}
Formato de resposta:
{
  "studyPlan": {
    "essential": string[] (2-4 matérias/tópicos indispensáveis para priorizar AGORA, considerando as fraquezas informadas e o peso típico dessas matérias para ${area.label}),
    "niceToHave": string[] (1-3 matérias/tópicos importantes mas que podem vir depois das essenciais),
    "later": string[] (0-2 matérias/tópicos que podem ficar para o final da preparação)
  },
  "essayTips": string[] (3-4 dicas práticas e específicas para a redação, considerando o tempo disponível informado),
  "weeklySchedule": [
    { "week": number (1 a ${STUDY_CALENDAR_WEEKS}), "focus": string (tema/matéria principal da semana), "tasks": string[] (2-4 tarefas concretas de estudo para essa semana) }
  ] (exatamente ${STUDY_CALENDAR_WEEKS} semanas, cobrindo as próximas ${STUDY_CALENDAR_WEEKS} semanas a partir de agora, priorizando as fraquezas informadas primeiro e distribuindo conforme as horas semanais disponíveis),
  "courseCutoffNote": string (2-3 frases explicando, de forma honesta e aproximada, o nível de concorrência/nota de corte que ${area.label} costuma exigir em relação a outros cursos, deixando claro que varia por instituição),
  "motivationalNote": string (1-2 frases encorajadoras e realistas, reconhecendo o tempo até a prova informado)
}`;

  const userMessage = `CURSO-ALVO: ${area.label}
PROVA(S): ${examLabel}
TEMPO ATÉ A PROVA: ${answers.timeUntilExam}
HORAS DE ESTUDO POR SEMANA: ${answers.weeklyStudyHours}
MATÉRIAS QUE MAIS DOMINA: ${answers.subjectStrengths.join(", ") || "não informado"}
MATÉRIAS COM MAIS DIFICULDADE: ${answers.subjectWeaknesses.join(", ") || "não informado"}`;

  return runToolJsonPrompt<ExamMapResult>("exam_map", systemPrompt, userMessage);
}

// --- Corretor de redação (ENEM) ---

export type EssayCompetencyScore = {
  competency: string;
  score: number;
  feedback: string;
};

export type EssayGradeResult = {
  competencyScores: EssayCompetencyScore[];
  totalScore: number;
  generalFeedback: string;
  topFixes: string[];
};

const ENEM_COMPETENCIES = [
  "Competência 1, Domínio da norma culta da língua escrita",
  "Competência 2, Compreensão do tema e uso de conhecimentos de outras áreas",
  "Competência 3, Seleção e organização de argumentos e informações",
  "Competência 4, Uso de mecanismos linguísticos de coesão",
  "Competência 5, Proposta de intervenção que respeite os direitos humanos",
];

export async function gradeEssay(essayText: string, theme: string): Promise<EssayGradeResult> {
  const systemPrompt = `Você é um corretor experiente de redações do ENEM. Avalie a redação abaixo segundo as 5 competências oficiais do ENEM, cada uma valendo de 0 a 200 pontos (múltiplos de 40: 0, 40, 80, 120, 160, 200), com rigor realista, não infle notas.
${BASE_RULES}
As 5 competências, na ordem exata em que devem aparecer no array "competencyScores":
${ENEM_COMPETENCIES.map((c, i) => `${i + 1}. ${c}`).join("\n")}
Formato de resposta:
{
  "competencyScores": [
    { "competency": string (nome exato da competência), "score": number (0-200, múltiplo de 40), "feedback": string (2-3 frases específicas citando trechos ou padrões reais do texto) }
  ] (exatamente 5 itens, na ordem acima),
  "totalScore": number (soma das 5 competências, 0-1000),
  "generalFeedback": string (3-4 frases resumindo o principal ponto forte e o principal ponto fraco do texto),
  "topFixes": string[] (3-5 correções prioritárias e concretas para a próxima versão do texto)
}`;

  const userMessage = `TEMA DA REDAÇÃO: ${theme || "não informado"}

TEXTO DA REDAÇÃO:
${essayText}`;

  return runToolJsonPrompt<EssayGradeResult>("essay_grading", systemPrompt, userMessage);
}

// --- Calculadora de chance no SISU / nota de corte ---

export type CutoffEstimateResult = {
  estimateLabel: string;
  reasoning: string;
  typicalCutoffRange: string;
  gapAnalysis: string;
  improvementTips: string[];
};

export async function estimateCutoffChance(
  area: VocationAreaConfig,
  userScore: number,
  targetInstitutionType: string
): Promise<CutoffEstimateResult> {
  const systemPrompt = `Você é um orientador especializado em SISU e processos seletivos de universidades brasileiras. Com base na nota informada e no curso-alvo, dê uma estimativa APROXIMADA e honesta de chance de aprovação, deixando claro que notas de corte variam por instituição, campus, turno e ano, e que isso é só uma referência geral (não uma garantia).
${BASE_RULES}
Formato de resposta:
{
  "estimateLabel": string (uma frase curta e direta classificando a chance, ex: "Chance alta em campi mais concorridos", "Chance baixa nos cursos mais disputados, mas viável em campi menos concorridos"),
  "reasoning": string (2-3 frases explicando o raciocínio por trás da estimativa, considerando o tipo de instituição informado),
  "typicalCutoffRange": string (1-2 frases descrevendo, de forma aproximada, a faixa de nota de corte que ${area.label} costuma exigir no tipo de instituição informado),
  "gapAnalysis": string (1-2 frases sobre quantos pontos aproximadamente faltam ou sobram em relação à faixa típica),
  "improvementTips": string[] (2-4 sugestões práticas para aumentar a nota ou a chance, se a nota informada estiver abaixo do típico; se já estiver bem posicionada, sugestões para não perder a vaga, como estratégia de inscrição no SISU)
}`;

  const userMessage = `CURSO-ALVO: ${area.label}
NOTA DO CANDIDATO (média ponderada estimada): ${userScore}
TIPO DE INSTITUIÇÃO-ALVO: ${targetInstitutionType}`;

  return runToolJsonPrompt<CutoffEstimateResult>("sisu_cutoff", systemPrompt, userMessage);
}

// --- Currículo do zero ---

export type ResumeFromScratchInput = {
  fullName: string;
  education: string;
  projects: string;
  skills: string;
  targetRole: string;
  jobTitle?: string;
  jobText?: string;
};

export type ResumeFromScratchResult = {
  summary: string;
  resumeStructured: StructuredResume;
};

const MAX_JOB_TEXT_FOR_SCRATCH_CHARS = 3000;

export async function generateResumeFromScratch(
  input: ResumeFromScratchInput
): Promise<ResumeFromScratchResult> {
  const hasJob = Boolean(input.jobTitle?.trim() || input.jobText?.trim());

  const systemPrompt = `Você é um especialista em currículos para quem está começando na carreira (estágio/primeiro emprego), sem experiência profissional formal. Monte um currículo completo e estruturado a partir das informações brutas fornecidas.
${BASE_RULES}${
    hasJob
      ? "\nUma vaga específica foi informada abaixo (VAGA-ALVO). Priorize, no resumo e na descrição de cada experiência, os termos, tecnologias e requisitos dessa vaga, mas SEM inventar nada que a pessoa não tenha informado sobre si mesma."
      : ""
  }
Formato de resposta:
{
  "summary": string (resumo profissional de 3-4 frases para o topo do currículo),
  "resumeStructured": {
    "contact": { "name": string (use o nome informado ou ""), "email": "", "phone": "", "location": "", "linkedin": "", "github": "", "portfolio": "" },
    "education": [ { "institution": string, "degree": string, "period": string } ] (a partir do que foi informado em FORMAÇÃO),
    "skills": string[] (habilidades técnicas organizadas, extraídas do que foi informado),
    "languages": [] (array vazio, a pessoa não informou idiomas),
    "certifications": [] (array vazio, a pessoa não informou certificações),
    "experiences": [ { "role": string (nome do projeto/curso/atividade, já que não há emprego formal), "company": string (instituição/contexto onde ocorreu, ou "" se não houver), "period": string (ou "" se não informado), "description": string (2-4 frases no estilo currículo, começando com verbo de ação) } ] (uma entrada por projeto/atividade informado em PROJETOS/ATIVIDADES)
  }
}`;

  const userMessage = `NOME: ${input.fullName || "não informado"}
CARGO-ALVO: ${input.targetRole || "não informado"}
${
    hasJob
      ? `\nVAGA-ALVO (cargo): ${input.jobTitle || "não informado"}\nDESCRIÇÃO DA VAGA:\n${truncate(
          input.jobText || "",
          MAX_JOB_TEXT_FOR_SCRATCH_CHARS
        )}\n`
      : ""
  }
FORMAÇÃO:
${input.education}

PROJETOS/ATIVIDADES (acadêmicos, pessoais, cursos, voluntariado, etc):
${input.projects}

HABILIDADES/TECNOLOGIAS:
${input.skills}`;

  return runToolJsonPrompt<ResumeFromScratchResult>("resume_from_scratch", systemPrompt, userMessage);
}

// --- Análise de LinkedIn ---

export type LinkedInReviewResult = {
  overallImpression: string;
  suggestedHeadline: string;
  suggestedAbout: string;
  fixes: string[];
};

export async function analyzeLinkedIn(
  linkedInText: string,
  targetRole: string
): Promise<LinkedInReviewResult> {
  const systemPrompt = `Você é um especialista em otimização de perfis do LinkedIn para busca de emprego. Adapte a linguagem à área do cargo-alvo (saúde, vendas, logística, educação, tecnologia...) e nunca assuma que a pessoa é da área de tecnologia.
${BASE_RULES}
Formato de resposta:
{
  "overallImpression": string (2-3 frases, avaliação honesta e direta do perfil atual em relação ao objetivo informado),
  "suggestedHeadline": string (headline otimizada sugerida, com base apenas em fatos reais do perfil),
  "suggestedAbout": string (seção "sobre" sugerida, 4-6 frases, baseada apenas em fatos reais do perfil),
  "fixes": string[] (3 a 6 ações concretas para melhorar o perfil)
}`;

  const userMessage = `CARGO-ALVO: ${targetRole || "não informado"}

CONTEÚDO ATUAL DO PERFIL DO LINKEDIN (headline, sobre, experiências, colado pelo usuário):
${linkedInText}`;

  const result = await runToolJsonPrompt<LinkedInReviewResult>("linkedin_review", systemPrompt, userMessage);

  return {
    overallImpression: asText(result?.overallImpression),
    suggestedHeadline: asText(result?.suggestedHeadline),
    suggestedAbout: asText(result?.suggestedAbout),
    fixes: asStringArray(result?.fixes, 6),
  };
}

// --- Análise de GitHub ---

// --- Simulador de entrevista ---

/** Perguntas por simulação. Curto o bastante para a pessoa terminar numa sentada. */
export const INTERVIEW_SIMULATION_QUESTIONS = 5;

export type InterviewTurn = { question: string; answer: string };

export type InterviewSimulatorInput = {
  targetRole: string;
  area: string;
  seniority: string;
  history: InterviewTurn[];
};

export type InterviewQuestionResult = { question: string };

export type InterviewAnswerResult = {
  score: number;
  strengths: string[];
  gaps: string[];
  improvedAnswer: string;
  nextQuestion: string | null;
};

function interviewContext({ targetRole, area, seniority }: InterviewSimulatorInput): string {
  return `CARGO-ALVO: ${targetRole}
ÁREA: ${area || "não informada"}
NÍVEL: ${seniority || "não informado"}`;
}

// A entrevista roda para QUALQUER área (saúde, vendas, logística, tecnologia...),
// então o prompt proíbe explicitamente o viés de puxar tudo para tecnologia.
const INTERVIEWER_ROLE = `Você é um entrevistador experiente conduzindo uma entrevista de emprego real para a área e o cargo informados. Faça perguntas que um entrevistador DAQUELA área realmente faria - se a área for saúde, pergunte sobre plantão, protocolo e paciente; se for vendas, sobre meta, objeção e carteira; se for logística, sobre rota, estoque e prazo. NUNCA transforme a entrevista em uma entrevista de tecnologia se a área não for de tecnologia.`;

export async function startInterviewSimulation(
  input: InterviewSimulatorInput
): Promise<InterviewQuestionResult> {
  const systemPrompt = `${INTERVIEWER_ROLE}
${BASE_RULES}
Faça a PRIMEIRA pergunta da entrevista. Deve ser uma pergunta de abertura realista, aberta e específica do cargo/área - nunca genérica como "fale sobre você".
Formato de resposta:
{
  "question": string (a pergunta, em uma ou duas frases, como o entrevistador falaria em voz alta)
}`;

  const result = await runToolJsonPrompt<InterviewQuestionResult>(
    "interview_question",
    systemPrompt,
    interviewContext(input),
    0.7
  );

  const question = asText(result?.question);
  if (!question) {
    throw new Error("A IA não devolveu a primeira pergunta da entrevista.");
  }

  return { question };
}

export async function evaluateInterviewAnswer(
  input: InterviewSimulatorInput
): Promise<InterviewAnswerResult> {
  const answered = input.history.length;
  const isLast = answered >= INTERVIEW_SIMULATION_QUESTIONS;

  const systemPrompt = `${INTERVIEWER_ROLE}
${BASE_RULES}
Avalie a ÚLTIMA resposta do candidato com honestidade - se ela foi vaga, curta ou não respondeu à pergunta, diga isso e dê nota baixa. Não elogie por elogiar.
Ao reescrever a resposta, use SOMENTE fatos que o candidato mencionou; se faltou um dado importante (como um resultado concreto), aponte em "gaps" e deixe um espaço marcado como [preencha com seu número] em vez de inventar.
Formato de resposta:
{
  "score": number (0 a 10 para a última resposta),
  "strengths": string[] (1 a 3 pontos concretos que a resposta acertou; array vazio se não houver),
  "gaps": string[] (1 a 3 pontos concretos que faltaram),
  "improvedAnswer": string (a resposta do candidato reescrita de forma mais forte, mantendo os fatos dele),
  "nextQuestion": ${isLast ? "null (a entrevista terminou; use exatamente null)" : "string (a próxima pergunta da entrevista, seguindo o fio do que ele respondeu)"}
}`;

  const transcript = input.history
    .map((turn, index) => `PERGUNTA ${index + 1}: ${turn.question}\nRESPOSTA ${index + 1}: ${turn.answer}`)
    .join("\n\n");

  const userMessage = `${interviewContext(input)}

TRANSCRIÇÃO DA ENTREVISTA ATÉ AQUI (avalie apenas a RESPOSTA ${answered}):
${transcript}`;

  const result = await runToolJsonPrompt<InterviewAnswerResult>(
    "interview_answer", systemPrompt, userMessage, 0.6
  );

  const nextQuestion = asOptionalText(result?.nextQuestion);
  if (!isLast && !nextQuestion) {
    throw new Error("A IA não devolveu a próxima pergunta da entrevista.");
  }

  return {
    score: asScore(result?.score, 0, 10),
    strengths: asStringArray(result?.strengths, 3),
    gaps: asStringArray(result?.gaps, 3),
    improvedAnswer: asText(result?.improvedAnswer),
    // O modelo às vezes devolve uma pergunta mesmo no último turno; a contagem
    // de perguntas é decisão nossa, não dele.
    nextQuestion: isLast ? null : nextQuestion,
  };
}

export type GithubReviewResult = {
  overallImpression: string;
  strongestRepos: string[];
  fixes: string[];
};

export async function analyzeGithub(
  githubText: string,
  targetRole: string
): Promise<GithubReviewResult> {
  const systemPrompt = `Você é um recrutador técnico avaliando o perfil do GitHub de um candidato como parte do processo seletivo.
${BASE_RULES}
Formato de resposta:
{
  "overallImpression": string (2-3 frases sobre a impressão geral do GitHub em relação ao objetivo informado),
  "strongestRepos": string[] (nomes dos repositórios/projetos, citados pelo usuário, que mais valem a pena destacar no currículo, array vazio se nenhum se destacar),
  "fixes": string[] (3 a 6 ações concretas para melhorar o GitHub: READMEs, nomes de repositórios, descrições, pin de projetos, etc)
}`;

  const userMessage = `CARGO-ALVO: ${targetRole || "não informado"}

CONTEÚDO DO GITHUB (lista de repositórios, descrições, READMEs, colado pelo usuário):
${githubText}`;

  const result = await runToolJsonPrompt<GithubReviewResult>("github_review", systemPrompt, userMessage);

  return {
    overallImpression: asText(result?.overallImpression),
    strongestRepos: asStringArray(result?.strongestRepos, 10),
    fixes: asStringArray(result?.fixes, 6),
  };
}

// --- Perfil do zero (LinkedIn/GitHub para quem ainda não tem) ---

export type ProfileFromScratchInput = {
  education: string;
  projects: string;
  skills: string;
  targetRole: string;
};

export type ProfileFromScratchResult = {
  suggestedHeadline: string;
  suggestedAbout: string;
  suggestedGithubBio: string;
  projectHighlights: string[];
  nextSteps: string[];
};

export async function generateProfileFromScratch(
  input: ProfileFromScratchInput
): Promise<ProfileFromScratchResult> {
  const systemPrompt = `Você é um especialista em carreira ajudando alguém que ainda NÃO tem perfil no LinkedIn nem no GitHub a criar os dois do zero, a partir de formação, projetos e habilidades informados.
${BASE_RULES}
Formato de resposta:
{
  "suggestedHeadline": string (headline de LinkedIn pronta para usar, curta e objetiva),
  "suggestedAbout": string (texto para a seção "sobre" do LinkedIn, 3-5 frases),
  "suggestedGithubBio": string (bio curta de perfil do GitHub, 1-2 frases),
  "projectHighlights": string[] (2-5 sugestões de como nomear/descrever os projetos informados como repositórios do GitHub, um item por projeto),
  "nextSteps": string[] (3-5 passos práticos para criar as contas e publicar o conteúdo, ex: "crie a conta em linkedin.com e cole a headline sugerida")
}`;

  const userMessage = `CARGO-ALVO: ${input.targetRole || "não informado"}

FORMAÇÃO:
${input.education}

PROJETOS/ATIVIDADES (acadêmicos, pessoais, cursos, voluntariado, etc):
${input.projects}

HABILIDADES/TECNOLOGIAS:
${input.skills}`;

  return runToolJsonPrompt<ProfileFromScratchResult>("profile_from_scratch", systemPrompt, userMessage);
}

// --- Comparador de vagas ---

export type JobType = "estagio" | "trainee" | "junior" | "pleno" | "outro";

export type JobComparisonInput = {
  id: string;
  jobTitle: string;
  jobText: string;
  jobType?: JobType;
};

const JOB_TYPE_LABELS: Record<JobType, string> = {
  estagio: "Estágio",
  trainee: "Trainee",
  junior: "Júnior",
  pleno: "Pleno",
  outro: "Outro",
};

export type JobComparisonResult = {
  ranking: {
    jobId: string;
    jobTitle: string;
    fitScore: number;
    reason: string;
  }[];
  recommendation: string;
};

const MAX_RESUME_CHARS = 4000;
const MAX_JOB_TEXT_CHARS = 1500;

function truncate(text: string, maxChars: number): string {
  return text.length > maxChars ? `${text.slice(0, maxChars)}...` : text;
}

export async function compareJobs(
  resumeText: string,
  jobs: JobComparisonInput[]
): Promise<JobComparisonResult> {
  const hasJobType = jobs.some((j) => j.jobType);

  const systemPrompt = `Você é um recrutador técnico sênior. Compare o currículo de um candidato com MÚLTIPLAS vagas e diga qual faz mais sentido para ele aplicar agora.
${BASE_RULES}
No campo "jobId" da resposta, repita EXATAMENTE o valor de "ID DA VAGA" fornecido para cada vaga, sem adicionar prefixos, numeração ou qualquer texto extra. No campo "jobTitle", repita o "TÍTULO DA VAGA" correspondente.${
    hasJobType
      ? `\nAlgumas vagas informam um "TIPO DE VAGA" (estágio, trainee, júnior, pleno). Leve isso em conta na comparação: para estágio e trainee, priorize oportunidade de aprendizado, mentoria e abertura para quem tem pouca experiência; para júnior e pleno, priorize aderência técnica, senioridade exigida e remuneração/crescimento.`
      : ""
  }
Formato de resposta:
{
  "ranking": [ { "jobId": string, "jobTitle": string, "fitScore": number (0-100), "reason": string (1-2 frases explicando a nota) } ] (uma entrada por vaga informada, ordenadas da maior para a menor aderência),
  "recommendation": string (2-4 frases dizendo qual vaga é a melhor porta de entrada agora e por quê, comparando com as outras)
}`;

  const jobsBlock = jobs
    .map(
      (j) =>
        `ID DA VAGA: ${j.id}\nTÍTULO DA VAGA: ${j.jobTitle}${
          j.jobType ? `\nTIPO DE VAGA: ${JOB_TYPE_LABELS[j.jobType]}` : ""
        }\nDESCRIÇÃO:\n${truncate(j.jobText, MAX_JOB_TEXT_CHARS)}`
    )
    .join("\n\n---\n\n");

  const userMessage = `CURRÍCULO DO CANDIDATO:\n${truncate(resumeText, MAX_RESUME_CHARS)}\n\n${jobsBlock}`;

  return runToolJsonPrompt<JobComparisonResult>("job_comparison", systemPrompt, userMessage);
}

// --- Triagem de candidatos (uma vaga × muitos currículos) ---

export type CandidateInput = {
  id: string;
  label: string; // nome ou nome do arquivo, para o modelo repetir na resposta
  resumeText: string;
};

export type CandidateRankingResult = {
  ranking: {
    candidateId: string;
    fitScore: number;
    reason: string;
  }[];
  recommendation: string;
};

/**
 * Inverso do compareJobs: dada UMA vaga, ranqueia MÚLTIPLOS currículos por
 * aderência. Uma única chamada de IA para o lote todo.
 */
export async function rankCandidates(
  jobTitle: string,
  jobText: string,
  candidates: CandidateInput[]
): Promise<CandidateRankingResult> {
  const systemPrompt = `Você é um recrutador técnico sênior. Avalie MÚLTIPLOS candidatos para UMA vaga e ranqueie-os pela aderência real do currículo aos requisitos.
${BASE_RULES}
No campo "candidateId" da resposta, repita EXATAMENTE o valor de "ID DO CANDIDATO" fornecido, sem prefixos, numeração ou texto extra. Baseie a nota apenas no que o currículo demonstra frente aos requisitos da vaga; não invente qualificações.
Formato de resposta:
{
  "ranking": [ { "candidateId": string, "fitScore": number (0-100), "reason": string (1-2 frases explicando a nota, citando pontos fortes e lacunas frente à vaga) } ] (uma entrada por candidato informado, ordenadas da maior para a menor aderência),
  "recommendation": string (2-4 frases dizendo quais candidatos chamar primeiro para entrevista e por quê)
}`;

  const candidatesBlock = candidates
    .map(
      (c) =>
        `ID DO CANDIDATO: ${c.id}\nIDENTIFICAÇÃO: ${c.label}\nCURRÍCULO:\n${truncate(c.resumeText, MAX_RESUME_CHARS)}`
    )
    .join("\n\n---\n\n");

  const userMessage = `VAGA: ${jobTitle}\n\nDESCRIÇÃO DA VAGA:\n${truncate(jobText, MAX_JOB_TEXT_CHARS)}\n\nCANDIDATOS:\n\n${candidatesBlock}`;

  return runToolJsonPrompt<CandidateRankingResult>("candidate_ranking", systemPrompt, userMessage);
}

// --- Palavras-chave de busca de vaga (a partir do currículo) ---

export type JobSearchKeywords = {
  titleEn: string;
  titlePt: string;
  keywords: string[];
};

export async function extractJobSearchKeywords(resumeText: string): Promise<JobSearchKeywords> {
  const systemPrompt = `Você é um especialista em recrutamento técnico. A partir de um currículo, identifique o cargo mais adequado para essa pessoa buscar agora e as principais palavras-chave técnicas, para usar como termos de busca em APIs de vagas.
${BASE_RULES}
Formato de resposta:
{
  "titleEn": string (o cargo mais adequado, em inglês, curto e comum em portais de vaga internacionais, ex: "Backend Developer", "Data Analyst"),
  "titlePt": string (o mesmo cargo, em português, como apareceria em portais de vaga brasileiros, ex: "Desenvolvedor Backend", "Analista de Dados"),
  "keywords": string[] (3 a 6 tecnologias/skills técnicas centrais do currículo, em inglês, como aparecem em vagas, ex: ["Python", "SQL", "AWS"])
}`;

  const userMessage = `CURRÍCULO:\n${truncate(resumeText, MAX_RESUME_CHARS)}`;

  return runToolJsonPrompt<JobSearchKeywords>("job_search_keywords", systemPrompt, userMessage);
}

// --- Simulado de entrevista (feedback por resposta) ---

export type InterviewFeedbackResult = {
  feedback: string;
  strongPoints: string[];
  improvementTips: string[];
  clarity: number;
  technicalDepth: number;
  confidence: number;
};

export async function getInterviewFeedback(
  question: string,
  answer: string,
  jobTitle: string
): Promise<InterviewFeedbackResult> {
  const [result] = await getInterviewFeedbackBatch([{ question, answer }], jobTitle);
  return result;
}

export async function getInterviewFeedbackBatch(
  qas: { question: string; answer: string }[],
  jobTitle: string
): Promise<InterviewFeedbackResult[]> {
  const systemPrompt = `Você é um treinador de entrevistas de emprego para vagas de tecnologia, direto e construtivo. Você vai avaliar várias respostas de uma mesma simulação de entrevista de uma vez só.
${BASE_RULES}
Formato de resposta:
{
  "results": [
    {
      "feedback": string (2-4 frases de feedback direto sobre a resposta: clareza, profundidade, se respondeu de fato a pergunta),
      "strongPoints": string[] (0-3 pontos fortes da resposta, array vazio se não houver nenhum),
      "improvementTips": string[] (2-4 dicas concretas de como melhorar essa resposta especificamente),
      "clarity": number (0-100, quão clara e bem estruturada foi a resposta),
      "technicalDepth": number (0-100, quão profunda e específica foi a resposta tecnicamente; se a pergunta não for técnica, avalie a profundidade do raciocínio/exemplo),
      "confidence": number (0-100, quão segura e assertiva a resposta parece, com base na forma como foi escrita)
    }
  ]
}
O array "results" deve ter EXATAMENTE o mesmo número de itens que perguntas foram enviadas, na mesma ordem.`;

  const userMessage = `VAGA: ${jobTitle || "não informado"}

Avalie cada uma das ${qas.length} perguntas e respostas abaixo, na ordem em que aparecem:

${qas
  .map(
    (qa, i) => `${i + 1}) PERGUNTA: ${qa.question}
RESPOSTA DO CANDIDATO: ${qa.answer || "(não respondida)"}`
  )
  .join("\n\n")}`;

  const { results } = await runToolJsonPrompt<{ results: InterviewFeedbackResult[] }>(
    "interview_feedback",
    systemPrompt,
    userMessage
  );
  return results;
}

// --- Geração de novas perguntas de entrevista (aleatórias, por vaga + senioridade) ---

const INTERVIEW_FOCUS_POOL = [
  "arquitetura e decisões técnicas",
  "debugging e resolução de problemas",
  "trabalho em equipe e colaboração",
  "comunicação com stakeholders não técnicos",
  "priorização e gestão de tempo",
  "aprendizado contínuo e atualização técnica",
  "lidar com falhas ou erros no trabalho",
  "tomada de decisão sob incerteza",
  "boas práticas de código e qualidade",
  "performance e escalabilidade",
];

function pickRandomFocuses(count: number): string[] {
  const shuffled = [...INTERVIEW_FOCUS_POOL].sort(() => Math.random() - 0.5);
  return shuffled.slice(0, count);
}

export async function generateInterviewQuestions(
  jobTitle: string,
  jobText: string
): Promise<string[]> {
  const focuses = pickRandomFocuses(3);

  const systemPrompt = `Você é um entrevistador técnico sênior que cria perguntas de entrevista de emprego para vagas de tecnologia.
${BASE_RULES}
Antes de gerar as perguntas, identifique o nível de senioridade pedido pela vaga (estágio, júnior, pleno, sênior, especialista/staff etc.) a partir do cargo e da descrição. Calibre a profundidade das perguntas de acordo:
- Estágio/júnior: fundamentos, potencial de aprendizado, projetos acadêmicos/pessoais, situações simples do dia a dia.
- Pleno: experiência aplicada, decisões técnicas reais, trade-offs em projetos que já executou.
- Sênior/especialista: arquitetura, liderança técnica, mentoria, decisões de alto impacto, trade-offs complexos.
Gere um conjunto DIFERENTE de perguntas a cada chamada, mesmo para a mesma vaga, varie o enunciado, os tópicos e o ângulo (nunca repita literalmente um banco fixo de perguntas). Dê ênfase especial, em pelo menos 2 das perguntas, aos seguintes temas: ${focuses.join(", ")}.
Formato de resposta:
{
  "questions": string[] (5 a 8 perguntas prováveis, misturando técnicas e comportamentais, baseadas nos requisitos e na senioridade da vaga)
}`;

  const userMessage = `CARGO: ${jobTitle}\n\nDESCRIÇÃO DA VAGA:\n${jobText || "não informada"}`;

  const { questions } = await runToolJsonPrompt<{ questions: string[] }>(
    "interview_questions",
    systemPrompt,
    userMessage,
    0.9
  );
  return questions;
}

// --- Carta de apresentação ---

export type CoverLetterTone = "formal" | "direto" | "entusiasmado";

const COVER_LETTER_TONE_LABELS: Record<CoverLetterTone, string> = {
  formal: "formal e institucional",
  direto: "direto e objetivo",
  entusiasmado: "entusiasmado e pessoal, mas ainda profissional",
};

export type CoverLetterResult = {
  coverLetter: string;
  tips: string[];
};

export async function generateCoverLetter(
  resumeText: string,
  jobTitle: string,
  jobText: string,
  tone: CoverLetterTone
): Promise<CoverLetterResult> {
  const systemPrompt = `Você é um especialista em redigir cartas de apresentação (cover letters) para vagas de emprego no Brasil. Escreva SOMENTE com base em fatos reais presentes no currículo, nunca invente experiência, ferramentas ou resultados que não foram mencionados.
${BASE_RULES}
O tom da carta deve ser ${COVER_LETTER_TONE_LABELS[tone]}.
Formato de resposta:
{
  "coverLetter": string (carta de apresentação completa, 3 a 5 parágrafos curtos, pronta para enviar, conectando o perfil do candidato aos requisitos da vaga, SEM saudação genérica tipo "Prezados" seguida de placeholder, use "Olá," ou algo natural no início e assine apenas com o nome se ele aparecer no currículo, senão sem assinatura),
  "tips": string[] (3-5 dicas de como personalizar ainda mais essa carta antes de enviar, ex: adicionar o nome do recrutador, citar um projeto específico da empresa)
}`;

  const userMessage = `CARGO-ALVO: ${jobTitle || "não informado"}

DESCRIÇÃO DA VAGA:
${jobText || "não informada"}

CURRÍCULO DO CANDIDATO:
${truncate(resumeText, MAX_RESUME_CHARS)}`;

  return runToolJsonPrompt<CoverLetterResult>("cover_letter", systemPrompt, userMessage);
}

// --- Teste comportamental (soft skills + personalidade) ---

export type BehavioralSummaryResult = {
  profileSummary: string;
  strengths: string[];
  growthAreas: string[];
  interviewTip: string;
};

export async function generateBehavioralSummary(
  skillScores: Record<SoftSkillDimension, number>,
  personalityScores: Record<PersonalityTrait, number>,
  dominantTrait: PersonalityTrait,
  targetRole: string
): Promise<BehavioralSummaryResult> {
  const skillLines = (Object.entries(skillScores) as [SoftSkillDimension, number][])
    .map(([dim, score]) => `${SOFT_SKILL_LABELS[dim]}: ${score}/100`)
    .join("\n");
  const traitLines = (Object.entries(personalityScores) as [PersonalityTrait, number][])
    .map(([trait, score]) => `${PERSONALITY_TRAIT_LABELS[trait]}: ${score}/100`)
    .join("\n");

  const systemPrompt = `Você é um psicólogo organizacional que interpreta resultados de um teste comportamental de soft skills e personalidade (estilo DISC) para ajudar a pessoa a se preparar para entrevistas de emprego.
${BASE_RULES}
Baseie-se SOMENTE nas pontuações informadas abaixo, sem inventar informações que não podem ser deduzidas delas.
Formato de resposta:
{
  "profileSummary": string (3-4 frases resumindo o perfil comportamental da pessoa, conectando o traço de personalidade dominante com as pontuações de soft skills),
  "strengths": string[] (2-4 pontos fortes do perfil, priorizando as maiores pontuações),
  "growthAreas": string[] (2-3 pontos de atenção/desenvolvimento, priorizando as menores pontuações, com sugestão prática de como trabalhar cada um),
  "interviewTip": string (1-2 frases com uma dica específica de como usar esse perfil a favor em uma entrevista para a vaga-alvo informada)
}`;

  const userMessage = `CARGO-ALVO: ${targetRole || "não informado"}
TRAÇO DE PERSONALIDADE DOMINANTE: ${PERSONALITY_TRAIT_LABELS[dominantTrait]}

PONTUAÇÕES DE SOFT SKILLS (0-100):
${skillLines}

PONTUAÇÕES DE PERSONALIDADE (0-100):
${traitLines}`;

  return runToolJsonPrompt<BehavioralSummaryResult>("behavioral_summary", systemPrompt, userMessage);
}

// --- Simulado a partir de provas anteriores ---

export type MockExamQuestion = {
  question: string;
  options: string[];
  correctIndex: number;
  explanation: string;
};

export type MockExamResult = {
  questions: MockExamQuestion[];
};

export async function generateMockExamQuestions(
  examText: string,
  sourceLabel: string
): Promise<MockExamResult> {
  const systemPrompt = `Você é um professor que cria simulados de múltipla escolha a partir do texto de provas reais. Você receberá o texto extraído (via OCR/parsing) de uma prova real: ${sourceLabel}. O texto pode ter formatação imperfeita.
${BASE_RULES}
Crie questões de múltipla escolha ORIGINAIS inspiradas nos temas, conteúdos e estilo das questões reais encontradas no texto (não é necessário copiar literalmente uma questão da prova, mas mantenha o mesmo nível de dificuldade e os mesmos assuntos identificados no texto).
Formato de resposta:
{
  "questions": [
    {
      "question": string (enunciado completo e autocontido, sem depender de imagens),
      "options": string[] (exatamente 5 alternativas, sem prefixo de letra),
      "correctIndex": number (índice 0-4 da alternativa correta),
      "explanation": string (1-2 frases explicando por que a alternativa está correta)
    }
  ] (6 a 8 questões, cobrindo assuntos variados identificados no texto)
}`;

  const userMessage = `TEXTO EXTRAÍDO DA PROVA (${sourceLabel}):
${examText}`;

  return runToolJsonPrompt<MockExamResult>("mock_exam", systemPrompt, userMessage, 0.7);
}

// --- Concurso público / OAB: plano de estudo por edital ---

export type ConcursoStudyPlanInput = {
  cargo: string;
  banca: string;
  disciplinas: string;
  weeklyStudyHours: string;
  timeUntilExam: string;
};

export type ConcursoStudyPlanResult = {
  bancaProfile: string;
  studyPlan: {
    essential: string[];
    niceToHave: string[];
    later: string[];
  };
  weeklySchedule: WeeklyScheduleBlock[];
  reviewTips: string[];
  cutoffNote: string;
  motivationalNote: string;
};

const CONCURSO_SCHEDULE_WEEKS = 6;

export async function generateConcursoStudyPlan(
  input: ConcursoStudyPlanInput
): Promise<ConcursoStudyPlanResult> {
  const systemPrompt = `Você é um orientador de estudos especializado em concursos públicos e no Exame da OAB no Brasil. A partir do cargo/exame, da banca e das disciplinas do edital, monte um plano de estudo realista, priorizando por PESO e INCIDÊNCIA das matérias (o que mais cai e vale mais ponto), não pela ordem do edital.
${BASE_RULES}
Formato de resposta:
{
  "bancaProfile": string (2-3 frases sobre o estilo da banca informada e como isso muda a forma de estudar, ex: CESPE/Cebraspe usa certo/errado com pegadinhas; FGV cobra literalidade e jurisprudência; FCC é detalhista em lei seca),
  "studyPlan": {
    "essential": string[] (2-4 disciplinas/tópicos indispensáveis para priorizar AGORA, pelo peso típico e pela banca),
    "niceToHave": string[] (1-3 disciplinas/tópicos importantes mas que podem vir depois),
    "later": string[] (0-2 disciplinas/tópicos de menor peso, para o final)
  },
  "weeklySchedule": [
    { "week": number (1 a ${CONCURSO_SCHEDULE_WEEKS}), "focus": string (disciplina/tema principal da semana), "tasks": string[] (2-4 tarefas concretas: teoria, lei seca, resolução de questões, revisão) }
  ] (exatamente ${CONCURSO_SCHEDULE_WEEKS} semanas, priorizando as disciplinas de maior peso primeiro e distribuindo conforme as horas semanais disponíveis, sempre incluindo resolução de questões e revisão),
  "reviewTips": string[] (3-4 dicas práticas de revisão e resolução de questões específicas para a banca informada),
  "cutoffNote": string (2-3 frases, honestas e aproximadas, sobre nível de concorrência/nota de corte que esse cargo/exame costuma exigir, deixando claro que varia por edital e região),
  "motivationalNote": string (1-2 frases encorajadoras e realistas, reconhecendo o tempo até a prova informado)
}`;

  const userMessage = `CARGO/EXAME-ALVO: ${input.cargo || "não informado"}
BANCA: ${input.banca || "não informada"}
DISCIPLINAS DO EDITAL (com pesos, se informados):
${input.disciplinas || "não informado"}
TEMPO ATÉ A PROVA: ${input.timeUntilExam || "não informado"}
HORAS DE ESTUDO POR SEMANA: ${input.weeklyStudyHours || "não informado"}`;

  return runToolJsonPrompt<ConcursoStudyPlanResult>("concurso_study_plan", systemPrompt, userMessage);
}

// --- Concurso público / OAB 1ª fase: simulado por banca e disciplina ---

export type ConcursoMockExamInput = {
  cargo: string;
  banca: string;
  disciplina: string;
};

export async function generateConcursoMockExam(
  input: ConcursoMockExamInput
): Promise<MockExamResult> {
  const systemPrompt = `Você é um professor de cursos preparatórios que cria simulados de concurso público e do Exame da OAB, no estilo da banca informada.
${BASE_RULES}
Adapte o FORMATO das questões à banca informada:
- CESPE/Cebraspe: itens de certo/errado. Nesse caso, "options" deve ter EXATAMENTE 2 alternativas: ["Certo", "Errado"].
- FGV (inclui o Exame da OAB): múltipla escolha com EXATAMENTE 4 alternativas (A a D), estilo literal e com jurisprudência quando couber.
- FCC, Vunesp, Cesgranrio e demais: múltipla escolha com EXATAMENTE 5 alternativas (A a E), detalhista em lei seca.
Crie questões ORIGINAIS, no nível de dificuldade e nos assuntos típicos da disciplina e da banca informadas.
Formato de resposta:
{
  "questions": [
    {
      "question": string (enunciado completo e autocontido, sem depender de imagens),
      "options": string[] (2, 4 ou 5 alternativas conforme a banca, sem prefixo de letra),
      "correctIndex": number (índice 0-based da alternativa correta),
      "explanation": string (1-2 frases com a fundamentação legal/doutrinária da resposta correta)
    }
  ] (6 a 8 questões, cobrindo assuntos variados da disciplina)
}`;

  const userMessage = `CARGO/EXAME: ${input.cargo || "não informado"}
BANCA: ${input.banca || "não informada"}
DISCIPLINA: ${input.disciplina || "não informada"}`;

  return runToolJsonPrompt<MockExamResult>("concurso_mock_exam", systemPrompt, userMessage, 0.7);
}

// --- Concurso público: estimativa de nota de corte ---

export type ConcursoCutoffInput = {
  cargo: string;
  banca: string;
  regiao: string;
  userScore: number;
};

export async function estimateConcursoCutoff(
  input: ConcursoCutoffInput
): Promise<CutoffEstimateResult> {
  const systemPrompt = `Você é um orientador especializado em concursos públicos brasileiros. Com base no cargo/concurso, na banca, na região e na pontuação estimada informada (percentual de acerto ou nota), dê uma estimativa APROXIMADA e honesta de chance de aprovação, deixando claro que notas de corte variam muito por edital, número de vagas, região e ano, e que isso é só uma referência (não uma garantia).
${BASE_RULES}
Formato de resposta:
{
  "estimateLabel": string (frase curta classificando a chance, ex: "Chance boa para ampla concorrência", "Abaixo do corte típico nos concursos mais disputados"),
  "reasoning": string (2-3 frases explicando o raciocínio, considerando cargo, banca e região),
  "typicalCutoffRange": string (1-2 frases sobre a faixa de nota de corte que esse tipo de cargo costuma exigir),
  "gapAnalysis": string (1-2 frases sobre quantos pontos aproximadamente faltam ou sobram em relação à faixa típica),
  "improvementTips": string[] (2-4 sugestões práticas: se abaixo do típico, como subir a nota; se já bem posicionado, como não perder a vaga)
}`;

  const userMessage = `CARGO/CONCURSO-ALVO: ${input.cargo || "não informado"}
BANCA: ${input.banca || "não informada"}
REGIÃO/ESTADO: ${input.regiao || "não informado"}
PONTUAÇÃO ESTIMADA DO CANDIDATO (percentual de acerto ou nota): ${input.userScore}`;

  return runToolJsonPrompt<CutoffEstimateResult>("concurso_cutoff", systemPrompt, userMessage);
}

// --- OAB 2ª fase: corretor de peça prático-profissional e discursivas ---

export type OabSecondPhaseCriterionScore = {
  criterion: string;
  score: number;
  maxScore: number;
  feedback: string;
};

export type OabSecondPhaseResult = {
  criterionScores: OabSecondPhaseCriterionScore[];
  totalScore: number;
  generalFeedback: string;
  missingArguments: string[];
  topFixes: string[];
};

const OAB_SECOND_PHASE_CRITERIA = [
  "Cabimento e estrutura da peça (endereçamento, tipo de peça, requisitos formais)",
  "Fundamentação jurídica (dispositivos legais, súmulas e jurisprudência corretos)",
  "Análise do caso concreto (uso dos fatos do enunciado, teses adequadas)",
  "Pedidos (completos, corretos e coerentes com a peça)",
  "Técnica e linguagem jurídica (clareza, coesão, norma culta)",
];

export async function gradeOabSecondPhase(
  area: string,
  pecaText: string
): Promise<OabSecondPhaseResult> {
  const systemPrompt = `Você é um examinador experiente da 2ª fase do Exame da OAB (banca FGV), especializado em ${area || "Direito"}. Avalie a peça prático-profissional ou a resposta discursiva abaixo com o rigor da FGV. A peça vale até 5,0 pontos no total; distribua a pontuação entre os 5 critérios oficiais abaixo, sem inflar notas.
${BASE_RULES}
Os 5 critérios, na ordem exata em que devem aparecer no array "criterionScores":
${OAB_SECOND_PHASE_CRITERIA.map((c, i) => `${i + 1}. ${c}`).join("\n")}
Formato de resposta:
{
  "criterionScores": [
    { "criterion": string (nome do critério), "score": number (nota atribuída, uma casa decimal), "maxScore": number (pontuação máxima do critério), "feedback": string (2-3 frases específicas citando trechos ou omissões reais do texto) }
  ] (exatamente 5 itens, na ordem acima; a soma dos maxScore deve ser 5.0),
  "totalScore": number (soma dos "score", 0 a 5.0, uma casa decimal),
  "generalFeedback": string (3-4 frases resumindo o principal acerto e a principal falha da peça),
  "missingArguments": string[] (2-5 teses, dispositivos legais, súmulas ou pedidos que faltaram e a FGV costuma exigir para este tipo de peça),
  "topFixes": string[] (3-5 correções prioritárias e concretas para a próxima tentativa)
}`;

  const userMessage = `ÁREA DA 2ª FASE: ${area || "não informada"}

TEXTO DA PEÇA / RESPOSTA DISCURSIVA DO CANDIDATO:
${pecaText}`;

  return runToolJsonPrompt<OabSecondPhaseResult>("oab_second_phase", systemPrompt, userMessage);
}
