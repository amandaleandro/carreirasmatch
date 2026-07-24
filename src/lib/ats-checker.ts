import { runJsonPrompt } from "@/lib/groq";
import { atsStandaloneSchema } from "@/lib/ai-schemas";

export type AtsFormattingIssue = {
  severity: "critical" | "warning" | "info";
  title: string;
  description: string;
  suggestion: string;
};

export type AtsQualityFix = {
  category: "verbs" | "metrics" | "summary" | "structure" | "repetition";
  issue: string;
  action: string;
  example: string;
};

export type AtsChecklistItemStandalone = {
  key: string;
  label: string;
  status: "pass" | "warning" | "fail";
  description: string;
};

export type AtsStandaloneAnalysis = {
  atsReadabilityScore: number;
  resumeQualityScore: number;
  summary: string;
  detectedContactInfo: {
    name: string;
    email: string;
    phone: string;
    location: string;
    linkedin: string;
    experiencesCount: number;
    skillsCount: number;
  };
  formattingIssues: AtsFormattingIssue[];
  qualityFixes: AtsQualityFix[];
  atsChecklist: AtsChecklistItemStandalone[];
  actionPlan: string[];
  extractedTextPreview?: string;
};

const ATS_STANDALONE_SYSTEM_PROMPT = `Especialista em ATS (Applicant Tracking Systems) e recrutador técnico brasileiro.
Sua missão: avaliar um currículo de forma AUTÔNOMA (sem vaga atribuída) em duas dimensões cruciais:

1. LEITURA PELO ATS (atsReadabilityScore, 0-100): O arquivo/texto pode ser interpretado por sistemas como Gupy, Sólides, Greenhouse e Workday sem perder contatos, datas ou experiências? Avalie colunas, caracteres, legibilidade, títulos de seções, identificação de contatos e ordem cronológica.
2. QUALIDADE DO CONTEÚDO (resumeQualityScore, 0-100): O currículo é persuasivo? Possui resumo claro, verbos de ação, resultados mensuráveis/métricas, uso de espaço adequado e sem repetições/erros?

REGRAS ESTREITAS:
- detectedContactInfo: Extraia nome, e-mail, telefone, localidade e LinkedIn se presentes (senão ""). Conte quantas experiências e skills você identificou no texto.
- formattingIssues: 2 a 5 problemas reais de estrutura/leitura (severity: "critical", "warning" ou "info").
- qualityFixes: 3 a 6 sugestões práticas de escrita e conteúdo (category: "verbs"|"metrics"|"summary"|"structure"|"repetition").
- atsChecklist: 6 itens fixos ("Formatação", "Dados de Contato", "Estrutura de Seções", "Linha do Tempo/Datas", "Verbos de Ação", "Métricas/Resultados") com status "pass"|"warning"|"fail" e descrição curta.
- actionPlan: 3 a 5 passos práticos para elevar os scores.
- Responda apenas com o JSON estrito.`;

export async function analyzeAtsStandalone(resumeText: string): Promise<AtsStandaloneAnalysis> {
  const jsonTemplate = `{
  "atsReadabilityScore": number (0-100),
  "resumeQualityScore": number (0-100),
  "summary": string (2-3 frases de avaliação geral),
  "detectedContactInfo": {
    "name": string, "email": string, "phone": string, "location": string, "linkedin": string,
    "experiencesCount": number, "skillsCount": number
  },
  "formattingIssues": [{ "severity": "critical"|"warning"|"info", "title": string, "description": string, "suggestion": string }],
  "qualityFixes": [{ "category": "verbs"|"metrics"|"summary"|"structure"|"repetition", "issue": string, "action": string, "example": string }],
  "atsChecklist": [{ "key": string, "label": string, "status": "pass"|"warning"|"fail", "description": string }],
  "actionPlan": string[]
}`;

  const userMessage = `CURRÍCULO DO CANDIDATO PARA ANÁLISE ATS:\n${resumeText}\n\nResponda SOMENTE com o JSON válido:\n${jsonTemplate}`;

  const result = await runJsonPrompt<AtsStandaloneAnalysis>(
    ATS_STANDALONE_SYSTEM_PROMPT,
    userMessage,
    0.1,
    4500,
    undefined,
    atsStandaloneSchema,
    "ats_standalone_analysis",
    "groq"
  );

  return {
    ...result,
    extractedTextPreview: resumeText.slice(0, 1500),
  };
}
