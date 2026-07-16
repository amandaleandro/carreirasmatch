import { getSetting } from "@/lib/app-settings";
import { GROQ_MODEL_SETTING_KEY } from "@/lib/groq-model-options";
import { runJsonAcrossProviders } from "@/lib/ai-providers";
import { profileSuggestionsSchema, resumeAnalysisSchema, structuredResumeSchema } from "@/lib/ai-schemas";
import type { ZodType } from "zod";

const DEFAULT_GROQ_MODEL = process.env.GROQ_MODEL || "llama-3.3-70b-versatile";

// Structured-resume extraction is literal transcription (no scoring/reasoning), so it doesn't
// need the stronger model the admin picks for analysis, a cheaper model is just as accurate
// here, independent of whichever model is configured for analyzeResumeAgainstJob.
// (qwen/qwen3-32b was tried first but this Groq account's on-demand tier caps it at 6K TPM,
// which a full resume extraction call alone can exceed, gpt-oss-120b has no such issue.)
const EXTRACTION_MODEL = "openai/gpt-oss-120b";

// Modelo preferido para a ANÁLISE: rápido (~6s) e com bom TPM (12K).
const PREFERRED_GROQ_MODEL = "llama-3.3-70b-versatile";

// Modelos a evitar COMO MODELO DE ANÁLISE (o de extração é fixo à parte):
// - qwen/qwen3-32b: TPM baixo demais (6K), estoura numa análise (~6,6K).
// - openai/gpt-oss-120b: muito lento na análise grande (~40s), mesmo sendo ok
//   na extração. Se vier do env/admin, trocamos pelo preferido sem depender de
//   configuração externa.
const ANALYSIS_AVOID_MODELS = new Set(["qwen/qwen3-32b", "openai/gpt-oss-120b"]);

let cachedModel: { value: string; expiresAt: number } | null = null;
const MODEL_CACHE_TTL_MS = 30_000;

async function getGroqModel(): Promise<string> {
  if (cachedModel && cachedModel.expiresAt > Date.now()) return cachedModel.value;
  const stored = await getSetting(GROQ_MODEL_SETTING_KEY);
  const configured = stored || DEFAULT_GROQ_MODEL;
  const value = ANALYSIS_AVOID_MODELS.has(configured) ? PREFERRED_GROQ_MODEL : configured;
  cachedModel = { value, expiresAt: Date.now() + MODEL_CACHE_TTL_MS };
  return value;
}

export async function runJsonPrompt<T>(
  systemPrompt: string,
  userMessage: string,
  temperature = 0.2,
  maxCompletionTokens = 3500,
  model?: string,
  schema?: ZodType<T>
): Promise<T> {
  // `model` (quando passado, ex.: extração) define o modelo do endpoint Groq;
  // os demais provedores usam seus próprios modelos. A camada multi-provedor
  // rotaciona entre os provedores configurados e cai para o próximo se um falhar.
  const groqModel = model ?? (await getGroqModel());
  const content = await runJsonAcrossProviders(
    systemPrompt,
    userMessage,
    temperature,
    maxCompletionTokens,
    groqModel,
    schema ? (value) => { schema.parse(value); } : undefined
  );
  // A resposta em JSON-mode é fechada em JSON sintaticamente válido mesmo quando
  // cortada por max_tokens, então um corte é logado na camada de provedores.
  const parsed: unknown = JSON.parse(content);
  return schema ? schema.parse(parsed) : parsed as T;
}

export type ApplicationStatus = "apply_now" | "adjust_first" | "deprioritize";

export type CareerTrack =
  | "internship"
  | "career_change"
  | "reemployment"
  | "growth"
  | "apprentice";

const TRACK_LABELS: Record<CareerTrack, string> = {
  internship: "Estágio, trainee ou primeiro emprego",
  career_change: "Transição de carreira",
  reemployment: "Recolocação",
  growth: "Vaga melhor / crescimento profissional",
  apprentice: "Jovem aprendiz (Lei da Aprendizagem)",
};

const TRACK_GUIDANCE: Record<CareerTrack, string> = {
  internship: `ESTÁGIO/PRIMEIRO EMPREGO:
  - Não penalize falta de experiência formal; TCC, cursos, projetos pessoais e GitHub contam.
  - experienceScore: potencial e base de aprendizado, não anos de empresa. Só penalize se não houver prática nenhuma.
  - seniorityScore: só avalie compatibilidade com estágio/júnior; vaga sênior = vaga errada (sinalize em applicationStatusReason), sem penalizar falta de liderança.
  - Se cursando: matérias, trabalhos em grupo, iniciação científica e monitoria contam como evidência técnica.
  - Tom generoso e encorajador, honesto sobre lacunas reais.`,
  career_change: `TRANSIÇÃO DE CARREIRA:
  - Procure habilidades TRANSFERÍVEIS da experiência anterior (organização, comunicação, gestão, tecnologia adjacente) como pontos fortes.
  - Não espere histórico extenso na nova área; foque em estudo ativo (cursos, certificações, projetos).
  - Profundidade técnica ausente reflete no technicalScore mas não é "currículo ruim", é trilha em construção.`,
  reemployment: `RECOLOCAÇÃO (já tem experiência prévia):
  - Seja rigoroso: senioridade, resultados quantificados, impacto claro, atualização técnica (tecnologia defasada pesa no score).
  - Falta de métricas reduz atsScore mais que para quem está começando.
  - Avalie se mira vagas compatíveis com a senioridade real.`,
  growth: `VAGA MELHOR/CRESCIMENTO (já empregado):
  - A vaga deve ser um passo à frente; se o currículo já está acima do nível da vaga, sinalize isso.
  - Rigor normal de mercado, compare como profissional pleno/sênior.`,
  apprentice: `JOVEM APRENDIZ (Lei da Aprendizagem, ~14-24 anos, sem experiência formal exigida):
  - Não penalize ausência de experiência/cursos/certificações. Ensino médio, cursos livres curtos e atividades escolares/comunitárias contam como evidência positiva.
  - experienceScore: avalie organização, comprometimento e disponibilidade, não histórico profissional.
  - seniorityScore: só compatibilidade com nível aprendiz, nunca compare com pleno/sênior.
  - Tom muito encorajador e didático, provável primeiro currículo do candidato.`,
};

export type StudyPlanPhased = {
  essential: string[];
  niceToHave: string[];
  later: string[];
};

export type ExperienceSuggestion = {
  role: string;
  company: string;
  current: string;
  suggested: string;
};

export type AtsChecklistStatus = "pass" | "warning" | "fail";

export type AtsChecklistItem = {
  key: "formatting" | "clarity" | "keywords" | "results" | "seniority" | "links";
  label: string;
  description: string;
  status: AtsChecklistStatus;
};

export type ResumeContact = {
  name: string;
  email: string;
  phone: string;
  location: string;
  linkedin: string;
  github: string;
  portfolio: string;
};

export type ResumeEducationEntry = {
  institution: string;
  degree: string;
  period: string;
};

export type ResumeLanguageEntry = {
  language: string;
  level: string;
};

export type ResumeExperienceEntry = {
  role: string;
  company: string;
  period: string;
  description: string;
};

export type StructuredResume = {
  contact: ResumeContact;
  education: ResumeEducationEntry[];
  skills: string[];
  languages: ResumeLanguageEntry[];
  certifications: string[];
  experiences: ResumeExperienceEntry[];
};

export type ResumeAnalysis = {
  overallScore: number;
  technicalScore: number;
  experienceScore: number;
  seniorityScore: number;
  atsScore: number;
  applicationStatus: ApplicationStatus;
  applicationStatusReason: string;
  keywordsFound: string[];
  keywordsMissing: string[];
  suggestedSummary: string;
  currentSummary: string;
  strengths: string[];
  weaknesses: string[];
  fixes: string[];
  interviewQuestions: string[];
  studyPlan: StudyPlanPhased;
  recruiterMessage: string;
  alternativeRoles: string[];
  experienceSuggestions: ExperienceSuggestion[];
  atsChecklist: AtsChecklistItem[];
  // Presentes apenas quando careerTrack === "internship"
  talkAboutYourselfAnswer?: string;
  // Presentes apenas quando careerTrack === "career_change"
  transferableSkills?: string[];
  transitionNarrative?: string;
  whyCareerChangeAnswer?: string;
  bridgeRoles?: string[];
  // Presentes apenas quando careerTrack === "reemployment"
  recruiterObjections?: string[];
  applicationStrategy?: string;
  weeklyApplicationPlan?: string[];
  // Presente apenas quando pastFeedback é informado
  feedbackAnalysis?: string;
};

type TrackExtraField = {
  name: string;
  jsonType: "string" | "string[]" | "object";
  description: string;
};

const TRACK_EXTRA_FIELDS: Record<CareerTrack, TrackExtraField[]> = {
  internship: [
    {
      name: "talkAboutYourselfAnswer",
      jsonType: "string",
      description:
        'Resposta pronta para a pergunta de entrevista "Fale sobre você", em português, 3-5 frases, tom humilde e focado em potencial/aprendizado, baseada apenas em fatos reais do currículo, mencionando o interesse na vaga.',
    },
  ],
  career_change: [
    {
      name: "transferableSkills",
      jsonType: "string[]",
      description:
        "3 a 6 habilidades da experiência profissional ANTERIOR do candidato (fora da área-alvo) que são transferíveis e relevantes para a vaga, citando de onde vêm (ex: 'Gestão de equipe (experiência anterior em varejo)').",
    },
    {
      name: "transitionNarrative",
      jsonType: "string",
      description:
        "Narrativa de transição de carreira pronta para LinkedIn ou entrevista, 3-5 frases, conectando a experiência anterior do candidato com o novo objetivo de forma coerente e honesta, sem inventar experiência que não existe.",
    },
    {
      name: "whyCareerChangeAnswer",
      jsonType: "string",
      description:
        'Resposta pronta para a pergunta "Por que você quer mudar de área?", 3-4 frases, honesta, estratégica e específica ao histórico do candidato.',
    },
    {
      name: "bridgeRoles",
      jsonType: "string[]",
      description:
        "2 a 4 cargos-ponte realistas para o candidato chegar até o objetivo final, ordenados do mais imediato/acessível ao mais próximo do objetivo (ex: ['Suporte Técnico N1', 'Analista de Infraestrutura Júnior', 'Cloud Support', 'DevOps Júnior']).",
    },
  ],
  reemployment: [
    {
      name: "recruiterObjections",
      jsonType: "string[]",
      description:
        "3 a 5 objeções prováveis que um recrutador teria sobre este candidato para esta vaga especificamente (ex: gap no currículo, mudança frequente de emprego, tecnologia desatualizada), baseadas em evidência real do currículo.",
    },
    {
      name: "applicationStrategy",
      jsonType: "string",
      description:
        "Estratégia de candidatura em 3-4 frases: como esse candidato deveria abordar essa candidatura (ex: destacar X, contornar objeção Y, se posicionar como Z).",
    },
    {
      name: "weeklyApplicationPlan",
      jsonType: "string[]",
      description:
        "4 a 5 ações concretas para uma semana de busca ativa por vagas similares a esta, em ordem (ex: 'Ajustar currículo com as palavras-chave desta vaga', 'Aplicar para 5 vagas similares no LinkedIn', 'Pedir 2 recomendações de ex-colegas').",
    },
  ],
  growth: [],
  apprentice: [
    {
      name: "talkAboutYourselfAnswer",
      jsonType: "string",
      description:
        'Resposta pronta para a pergunta de entrevista "Fale sobre você", em português, 3-5 frases, tom simples, animado e focado em vontade de aprender e disponibilidade, baseada apenas em fatos reais do currículo, mencionando o interesse no programa de aprendizagem.',
    },
  ],
};

const SYSTEM_PROMPT = `Recrutador sênior, cético e direto, para vagas de QUALQUER área (não assuma TI sem a vaga dizer). Notas REALISTAS, sem inflar. Frases curtas, sem repetição.

REGRAS DE PONTUAÇÃO:

1. Antes de pontuar, identifique (só do texto real da vaga, nunca invente skills de outra área): keywords/competências explícitas da vaga; quais aparecem CLARAS e ESPECÍFICAS no currículo (menção vaga não conta); requisitos ausentes.

2. technicalScore (0-100): % de skills técnicas da vaga comprovadas com evidência concreta. <40% presentes = <50. Todas com evidência forte = >85. 90+ só se quase nada faltar.

3. experienceScore (0-100): tempo/tipo de experiência vs exigido. Área correlata não idêntica = 50-65. Sem experiência prática relevante = <35.

4. seniorityScore (0-100): senioridade demonstrada (impacto, autonomia, liderança, complexidade) vs nível da vaga. Júnior em vaga pleno/sênior = <45, mesmo com skills técnicas batendo.

5. atsScore (0-100): estrutura, keywords da vaga presentes, clareza, métricas quantificadas, resumo direcionado. Genérico sem métricas/keywords = <55.

6. overallScore: média ponderada technicalScore(35%) + experienceScore(25%) + seniorityScore(20%) + atsScore(20%), ajustável ±5 por fator crítico (ex: requisito eliminatório ausente).

7. Nos textos, cite skills/palavras exatas da vaga que faltam ou estão fracas, nunca generalidades tipo "melhore seu currículo".

8. Nunca prometa contratação, fale em aderência/chance de entrevista.

9. keywordsFound / keywordsMissing: termos EXATOS da vaga (ferramenta, técnica, certificação, idioma, anos de experiência), separando comprovados de ausentes/vagos. Sem sinônimos duplicados.

10. applicationStatus (overallScore + requisitos eliminatórios ausentes: idioma, senioridade muito distante, certificação obrigatória, anos de experiência muito abaixo):
   - "apply_now": score>=70, sem requisito eliminatório crítico ausente.
   - "adjust_first": score 45-69, ou alto com 1-2 lacunas fáceis de corrigir.
   - "deprioritize": score<45, ou requisito eliminatório claramente ausente.
   applicationStatusReason: 1-2 frases citando o fator decisivo.

11. suggestedSummary: 3-4 frases em português, sem "Eu", só fatos reais do currículo, citando keywords que a pessoa realmente tem. Tom conforme momento profissional (mais humilde em estágio, mais direto/resultado em recolocação/crescimento).

12. studyPlan: {essential (1-3 indispensáveis), niceToHave (1-3, não bloqueia), later (0-2, baixa prioridade)}, baseado nas lacunas reais (keywordsMissing).

13. recruiterMessage: mensagem que O CANDIDATO envia AO recrutador (1ª pessoa: "Olá, tenho interesse na vaga..."), 3-4 frases, pronta para LinkedIn/e-mail, demonstrando interesse na vaga e citando 1-2 pontos fortes reais do próprio candidato ligados à vaga. NUNCA escreva do ponto de vista do recrutador (não é o recrutador chamando o candidato). Direto, não genérico.

14. alternativeRoles: só se applicationStatus="deprioritize" (ou vaga muito acima do nível do candidato): 2-4 cargos alternativos realistas, mesma área, nível mais júnior/adjacente. Senão [].

15. experienceSuggestions: 2-3 experiências/projetos REAIS do currículo, na ordem. "current" (descrição literal/resumida) e "suggested" (reescrita 1-2 frases, verbos de ação, só quantifica se o currículo já sugerir métrica plausível, nunca invente números).

16. atsChecklist: exatamente estas 6 categorias fixas, cada uma com status "pass"/"warning"/"fail" e descrição curta (3-8 palavras):
   - formatting/"Formatação": estrutura, seções, tamanho.
   - clarity/"Clareza": frases diretas, sem jargão/confusão.
   - keywords/"Palavras-chave": uso das keywords da vaga (via keywordsFound/Missing).
   - results/"Resultados": conquistas/impacto mensurável.
   - seniority/"Senioridade": nível comunicado claro e compatível.
   - links/"Links": contatos/links relevantes quando aplicável.

17. currentSummary: copie fielmente (ou resuma se muito longo) o resumo/objetivo já existente. Se não houver, escreva exatamente: "Nenhum resumo profissional encontrado no currículo.".`;

const JSON_ONLY_INSTRUCTION =
  "Responda SOMENTE com um objeto JSON válido, sem texto antes ou depois, seguindo exatamente este formato:";

const STRUCTURED_RESUME_SYSTEM_PROMPT = `Extrator de dados de currículos, preciso e literal. ÚNICA tarefa: transcrever o currículo para um JSON estruturado, FIEL e COMPLETO, sem inventar, sem resumir demais, sem julgar qualidade. Cada seção deve conter TUDO que existir no texto original, mesmo repetitivo ou extenso.

REGRAS:
- contact: nome, e-mail, telefone, cidade/UF, linkedin, github, portfolio. "" se ausente. Nunca invente.
- education: TODAS as formações (instituição, curso/grau, período), sem exceção. [] só se realmente não houver nenhuma.
- skills: TODAS as habilidades/ferramentas/tecnologias citadas em qualquer parte do currículo, não só de uma seção "Habilidades".
- languages: TODOS os idiomas com nível (ex: {"language":"Inglês","level":"Avançado"}). Sem nível explícito, use "".
- certifications: TODAS as certificações/cursos de certificação, lista simples de strings, sem exceção.
- experiences: TODAS as experiências profissionais e projetos relevantes, na ordem em que aparecem (cargo, empresa/projeto, período, descrição resumida mas completa).

Releia o currículo inteiro antes de responder, nunca deixe uma seção vazia por preguiça de procurar no texto.`;

export type CandidateContext = {
  professionalArea?: string | null;
  hasFormalEducation?: boolean | null;
  courses?: string[];
};

const MAX_RESUME_CHARS = 14000;
const MAX_JOB_TEXT_CHARS = 3000;

/** Collapses whitespace/duplicate blank lines and drops repeated consecutive lines (common PDF-extraction artifacts) before sending text to the model, to save tokens without losing content. */
function normalizeForPrompt(text: string, maxChars: number): string {
  const lines = text
    .replace(/\r\n/g, "\n")
    .split("\n")
    .map((line) => line.replace(/[ \t]+/g, " ").trim())
    .filter((line) => line.length > 0);

  const deduped: string[] = [];
  for (const line of lines) {
    if (deduped[deduped.length - 1] !== line) deduped.push(line);
  }

  const normalized = deduped.join("\n");
  if (normalized.length <= maxChars) return normalized;

  // Cut on a line boundary instead of mid-word/mid-sentence so truncation (when it still
  // happens for very long resumes) doesn't leave a broken fragment as the last visible entry.
  const truncatedLines: string[] = [];
  let length = 0;
  for (const line of deduped) {
    if (length + line.length + 1 > maxChars) break;
    truncatedLines.push(line);
    length += line.length + 1;
  }
  return truncatedLines.join("\n");
}

const NO_FORMAL_EDUCATION_GUIDANCE = `
O CANDIDATO INFORMOU QUE NÃO TEM FORMAÇÃO ACADÊMICA FORMAL NA ÁREA (sem diploma técnico ou de faculdade). Ajuste as regras assim:
- NÃO penalize a ausência de diploma, curso técnico ou faculdade em nenhum dos scores.
- Trate cursos livres, cursos profissionalizantes (mesmo curtos, gratuitos ou pagos), certificados e experiência prática/informal como evidência técnica válida e suficiente, no mesmo nível que se fossem formação formal.
- Se a lista CURSOS_DO_CANDIDATO for informada abaixo, considere-a como comprovação real de qualificação, mesmo que os cursos não estejam mencionados no texto do currículo colado.
- Só penalize technicalScore se faltar prática/comprovação real (nenhum curso, nenhuma experiência, nenhum projeto citado), nunca apenas por falta de diploma.`;

export async function analyzeResumeAgainstJob(
  resumeText: string,
  jobTitle: string,
  jobText: string,
  careerTrack: CareerTrack,
  pastFeedback?: string,
  candidateContext?: CandidateContext
): Promise<ResumeAnalysis> {
  resumeText = normalizeForPrompt(resumeText, MAX_RESUME_CHARS);
  jobText = normalizeForPrompt(jobText, MAX_JOB_TEXT_CHARS);
  if (pastFeedback) pastFeedback = normalizeForPrompt(pastFeedback, MAX_JOB_TEXT_CHARS);

  const extraFields = [...TRACK_EXTRA_FIELDS[careerTrack]];
  if (pastFeedback && pastFeedback.trim()) {
    extraFields.push({
      name: "feedbackAnalysis",
      jsonType: "string",
      description:
        "O candidato colou feedbacks reais que recebeu de entrevistas/recrutadores anteriores (texto abaixo, em PAST_FEEDBACK). Analise em 3-4 frases o que esses feedbacks revelam de padrão, e como isso se conecta (ou não) com a vaga atual.",
    });
  }

  const extraFieldsInstructions = extraFields
    .map((f, i) => `${12 + i}. ${f.name}: ${f.description}`)
    .join("\n\n");
  const extraFieldsJson = extraFields
    .map((f) => `  "${f.name}": ${f.jsonType} (ver instrução ${f.name} acima),`)
    .join("\n");

  const systemPrompt = `${SYSTEM_PROMPT}

MOMENTO PROFISSIONAL DO CANDIDATO: ${TRACK_LABELS[careerTrack]}.
${TRACK_GUIDANCE[careerTrack]}
${candidateContext?.hasFormalEducation === false ? NO_FORMAL_EDUCATION_GUIDANCE : ""}
${extraFieldsInstructions ? `\n${extraFieldsInstructions}\n\nInclua esses campos extras no JSON de resposta, além dos campos padrão.` : ""}`;

  const jsonTemplate = `{
  "overallScore": number, "technicalScore": number, "experienceScore": number, "seniorityScore": number, "atsScore": number,
  "applicationStatus": "apply_now" | "adjust_first" | "deprioritize",
  "applicationStatusReason": string,
  "keywordsFound": string[], "keywordsMissing": string[],
  "suggestedSummary": string, "currentSummary": string,
  "strengths": string[] (3-5, nunca vazio), "weaknesses": string[] (3-5, nunca vazio), "fixes": string[] (3-5, nunca vazio),
  "interviewQuestions": string[] (4-6, calibradas ao nível da vaga),
  "studyPlan": { "essential": string[], "niceToHave": string[], "later": string[] },
  "recruiterMessage": string,
  "alternativeRoles": string[] (só se deprioritize, senão []),
  "experienceSuggestions": [{ "role": string, "company": string, "current": string, "suggested": string }] (2-3 itens),
  "atsChecklist": [{ "key": "formatting"|"clarity"|"keywords"|"results"|"seniority"|"links", "label": string, "description": string, "status": "pass"|"warning"|"fail" }] (as 6 categorias fixas)${
    extraFieldsJson ? ",\n" + extraFieldsJson.replace(/,$/, "") : ""
  }
}`;

  const feedbackBlock =
    pastFeedback && pastFeedback.trim()
      ? `\n\nPAST_FEEDBACK (feedbacks recebidos em entrevistas anteriores):\n${pastFeedback}`
      : "";

  const areaBlock = candidateContext?.professionalArea
    ? `\n\nÁREA DE ATUAÇÃO DO CANDIDATO: ${candidateContext.professionalArea}`
    : "";

  const coursesBlock =
    candidateContext?.courses && candidateContext.courses.length > 0
      ? `\n\nCURSOS_DO_CANDIDATO (cadastrados no perfil, comprovados mesmo que não apareçam no currículo colado):\n- ${candidateContext.courses.join("\n- ")}`
      : "";

  const userMessage = `CARGO DESEJADO: ${jobTitle}\n\nDESCRIÇÃO DA VAGA:\n${jobText}\n\nCURRÍCULO DO CANDIDATO:\n${resumeText}${areaBlock}${coursesBlock}${feedbackBlock}\n\n${JSON_ONLY_INSTRUCTION}\n${jsonTemplate}`;

  return runJsonPrompt<ResumeAnalysis>(systemPrompt, userMessage, 0.15, 6000, undefined, resumeAnalysisSchema);
}

const STRUCTURED_RESUME_JSON_TEMPLATE = `{
  "contact": { "name": string, "email": string, "phone": string, "location": string, "linkedin": string, "github": string, "portfolio": string },
  "education": [{ "institution": string, "degree": string, "period": string }],
  "skills": string[],
  "languages": [{ "language": string, "level": string }],
  "certifications": string[],
  "experiences": [{ "role": string, "company": string, "period": string, "description": string }]
}`;

/** Dedicated, single-purpose extraction call, kept separate from analyzeResumeAgainstJob so a long
 * scoring/analysis response can't crowd out (and truncate) the full structured resume. */
export async function extractStructuredResume(resumeText: string): Promise<StructuredResume> {
  resumeText = normalizeForPrompt(resumeText, MAX_RESUME_CHARS);
  const userMessage = `CURRÍCULO DO CANDIDATO:\n${resumeText}\n\n${JSON_ONLY_INSTRUCTION}\n${STRUCTURED_RESUME_JSON_TEMPLATE}`;
  return runJsonPrompt<StructuredResume>(
    STRUCTURED_RESUME_SYSTEM_PROMPT,
    userMessage,
    0.1,
    6000,
    EXTRACTION_MODEL,
    structuredResumeSchema
  );
}

export type ProfileSuggestionType = "course" | "certification" | "book";

export type ProfileSuggestionItem = {
  type: ProfileSuggestionType;
  title: string;
  provider: string;
  priceLabel: string;
  impactScore: number;
  impactReason: string;
  url?: string;
};

export type ProfileSuggestionsResult = {
  suggestions: ProfileSuggestionItem[];
};

const PROFILE_SUGGESTIONS_SYSTEM_PROMPT = `Orientador de carreira brasileiro, experiente e direto, especializado em indicar cursos, certificações e livros que aumentam a empregabilidade.

REGRAS:
1. Gere 6 a 10 sugestões, misturando "course", "certification" e "book" (quantidade livre, priorize o que fizer mais sentido).
2. Baseie-se nas lacunas técnicas (LACUNAS_PRIORITARIAS) e na área/momento profissional. Não repita SKILLS_COMPROVADAS ou CURSOS_JA_FEITOS.
3. Priorize OPCOES_CURADAS compatíveis com a área (provedores reais e confiáveis no Brasil, como SENAI, SENAC, Sebrae). Fora isso, use provedores reais e reconhecidos (ex: Coursera, Alura, Udemy, Fundação Bradesco, Microsoft Learn, editoras conhecidas para livros).
4. "priceLabel": faixa estimada em reais (ex: "R$ 150 - R$ 300") ou "Gratuito". É uma ESTIMATIVA, não invente precisão que não tem.
5. "impactScore" (0-100): quanto o item, concluído, aumenta a aderência/empregabilidade nas lacunas identificadas. >80 só para itens que atacam diretamente uma lacuna prioritária e frequente.
6. "impactReason": 1 frase curta e específica citando a lacuna/objetivo que o item resolve. Nunca genérico como "melhora seu currículo".
7. Ordene "suggestions" por impactScore decrescente.
8. Responda apenas em português do Brasil.`;

export async function generateProfileSuggestions(input: {
  professionalArea?: string | null;
  careerSegment?: string | null;
  hasFormalEducation?: boolean | null;
  topSkillGaps: string[];
  knownSkills: string[];
  completedCourses: string[];
  curatedOptions: { title: string; provider: string; free: boolean }[];
}): Promise<ProfileSuggestionsResult> {
  const jsonTemplate = `{
  "suggestions": [
    {
      "type": "course" | "certification" | "book",
      "title": string,
      "provider": string,
      "priceLabel": string (faixa estimada em reais ou "Gratuito"),
      "impactScore": number (0-100),
      "impactReason": string (1 frase curta e específica),
      "url": string (opcional, só se você tiver certeza de que é uma URL real e estável, senão omita o campo)
    }
  ]
}`;

  const areaBlock = input.professionalArea
    ? `\n\nÁREA DE ATUAÇÃO DO CANDIDATO: ${input.professionalArea}`
    : "";
  const segmentBlock = input.careerSegment
    ? `\n\nMOMENTO PROFISSIONAL: ${input.careerSegment}`
    : "";
  const educationBlock =
    input.hasFormalEducation === false
      ? "\n\nO candidato não tem formação acadêmica formal na área, priorize cursos livres/profissionalizantes e certificações acessíveis, sem exigir pré-requisitos de diploma."
      : "";
  const gapsBlock =
    input.topSkillGaps.length > 0
      ? `\n\nLACUNAS_PRIORITARIAS (mais frequentes nas análises de vaga do candidato):\n- ${input.topSkillGaps.join("\n- ")}`
      : "";
  const knownBlock =
    input.knownSkills.length > 0
      ? `\n\nSKILLS_COMPROVADAS (já domina, não sugerir de novo):\n- ${input.knownSkills.join("\n- ")}`
      : "";
  const completedBlock =
    input.completedCourses.length > 0
      ? `\n\nCURSOS_JA_FEITOS (não repetir):\n- ${input.completedCourses.join("\n- ")}`
      : "";
  const curatedBlock =
    input.curatedOptions.length > 0
      ? `\n\nOPCOES_CURADAS (provedores reais para a área do candidato, priorize quando fizer sentido):\n- ${input.curatedOptions
          .map((c) => `${c.title} (${c.provider}${c.free ? ", gratuito" : ""})`)
          .join("\n- ")}`
      : "";

  const userMessage = `Gere sugestões de melhoria de perfil para este candidato.${areaBlock}${segmentBlock}${educationBlock}${gapsBlock}${knownBlock}${completedBlock}${curatedBlock}\n\n${JSON_ONLY_INSTRUCTION}\n${jsonTemplate}`;

  return runJsonPrompt<ProfileSuggestionsResult>(
    PROFILE_SUGGESTIONS_SYSTEM_PROMPT,
    userMessage,
    0.3,
    undefined,
    undefined,
    profileSuggestionsSchema
  );
}
