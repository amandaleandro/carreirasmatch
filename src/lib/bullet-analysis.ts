import type { StructuredResume } from "@/lib/groq";

/**
 * Diagnóstico determinístico das descrições de experiência (estilo Resume
 * Worded): cada experiência do currículo estruturado passa por checagens de
 * regra fixa — verbo de ação, métrica quantificada, tamanho e buzzwords — sem
 * custo de IA e com resultado estável entre execuções.
 */

export type BulletCheckStatus = "pass" | "warning" | "fail";

export type BulletCheck = {
  key: "action_verb" | "metrics" | "length" | "buzzwords";
  label: string;
  status: BulletCheckStatus;
  detail: string;
};

export type BulletDiagnostic = {
  role: string;
  company: string;
  checks: BulletCheck[];
};

export type BulletAnalysisSummary = {
  diagnostics: BulletDiagnostic[];
  /** 0-100: % de checagens "pass" sobre o total (warning conta metade). */
  score: number;
};

/** Verbos de ação comuns em currículos PT-BR (radicais, cobrem passado/presente/gerúndio). */
const ACTION_VERB_STEMS = [
  "lider", "gerenci", "coorden", "implement", "desenvolv", "cri", "constru",
  "otimiz", "reduz", "aument", "melhor", "automat", "organiz", "planej",
  "execut", "entreg", "conduz", "negoci", "vend", "atend", "trein", "capacit",
  "supervision", "administr", "analis", "elabor", "produz", "realiz", "oper",
  "mant", "manut", "instal", "config", "projet", "estrutur", "padroniz",
  "expand", "lanc", "conquist", "captur", "capt", "gerou", "ger", "apoi",
  "particip", "colabor", "audit", "fiscaliz", "inspecion", "control",
];

/** Aberturas fracas que não comunicam ação nem resultado. */
const WEAK_OPENINGS = [
  "responsavel por", "responsável por", "atuei", "atuacao", "atuação",
  "trabalhei", "auxilio", "auxílio", "ajudei", "encarregado de", "funcao",
  "função", "minhas atividades", "atividades de",
];

/** Buzzwords genéricas que recrutador ignora (e ATS não pontua). */
const BUZZWORDS = [
  "proativo", "proatividade", "dinâmico", "dinamico", "comprometido",
  "comprometimento", "esforçado", "esforcado", "dedicado", "dedicação",
  "pontual", "responsável e", "multitarefa", "sinergia", "visão sistêmica",
  "fora da caixa", "alta performance", "foco em resultados",
];

function normalize(text: string): string {
  return text
    .toLowerCase()
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .replace(/\s+/g, " ")
    .trim();
}

function startsWithActionVerb(description: string): boolean {
  // Considera o começo de cada frase/bullet da descrição, não só a primeira.
  const segments = description
    .split(/[\n;•·\-–]|\.\s+/)
    .map((s) => normalize(s))
    .filter((s) => s.length > 3);
  if (segments.length === 0) return false;
  let hits = 0;
  for (const seg of segments) {
    const firstWord = seg.split(" ")[0] ?? "";
    if (ACTION_VERB_STEMS.some((stem) => firstWord.startsWith(stem))) hits++;
  }
  return hits >= Math.ceil(segments.length / 2);
}

function hasWeakOpening(description: string): boolean {
  const norm = normalize(description);
  return WEAK_OPENINGS.some((w) => norm.startsWith(normalize(w)) || norm.includes(` ${normalize(w)}`));
}

function hasMetric(description: string): boolean {
  return /\d|R\$|%/.test(description);
}

function foundBuzzwords(description: string): string[] {
  const norm = normalize(description);
  return BUZZWORDS.filter((b) => norm.includes(normalize(b)));
}

function analyzeExperience(exp: { role: string; company: string; description: string }): BulletDiagnostic {
  const desc = exp.description ?? "";
  const wordCount = desc.trim() ? desc.trim().split(/\s+/).length : 0;
  const checks: BulletCheck[] = [];

  // 1. Verbo de ação
  if (wordCount === 0) {
    checks.push({
      key: "action_verb",
      label: "Verbos de ação",
      status: "fail",
      detail: "Sem descrição: liste o que você fez neste cargo.",
    });
  } else if (startsWithActionVerb(desc) && !hasWeakOpening(desc)) {
    checks.push({
      key: "action_verb",
      label: "Verbos de ação",
      status: "pass",
      detail: "As frases começam com verbos de ação.",
    });
  } else if (hasWeakOpening(desc)) {
    checks.push({
      key: "action_verb",
      label: "Verbos de ação",
      status: "fail",
      detail: 'Troque aberturas como "responsável por" por um verbo de ação (ex: "Gerenciei", "Implementei").',
    });
  } else {
    checks.push({
      key: "action_verb",
      label: "Verbos de ação",
      status: "warning",
      detail: "Comece cada frase com um verbo de ação no passado (ex: \"Reduzi\", \"Organizei\").",
    });
  }

  // 2. Métrica quantificada
  checks.push(
    hasMetric(desc)
      ? {
          key: "metrics",
          label: "Resultados quantificados",
          status: "pass",
          detail: "Há números/medidas na descrição.",
        }
      : {
          key: "metrics",
          label: "Resultados quantificados",
          status: wordCount === 0 ? "fail" : "warning",
          detail: "Nenhum número. Quantifique o impacto real (equipe, volume, %, prazo) — sem inventar.",
        }
  );

  // 3. Tamanho
  if (wordCount < 8) {
    checks.push({
      key: "length",
      label: "Tamanho da descrição",
      status: "fail",
      detail: `Muito curta (${wordCount} palavra${wordCount === 1 ? "" : "s"}): o recrutador não entende o que você fez.`,
    });
  } else if (wordCount > 70) {
    checks.push({
      key: "length",
      label: "Tamanho da descrição",
      status: "warning",
      detail: `Muito longa (${wordCount} palavras): corte para os 3-4 feitos mais relevantes.`,
    });
  } else {
    checks.push({
      key: "length",
      label: "Tamanho da descrição",
      status: "pass",
      detail: "Tamanho adequado para leitura rápida.",
    });
  }

  // 4. Buzzwords
  const buzz = foundBuzzwords(desc);
  checks.push(
    buzz.length > 0
      ? {
          key: "buzzwords",
          label: "Clichês/buzzwords",
          status: "warning",
          detail: `Corte termos vazios: ${buzz.join(", ")}. Substitua por fatos concretos.`,
        }
      : {
          key: "buzzwords",
          label: "Clichês/buzzwords",
          status: "pass",
          detail: "Sem clichês genéricos.",
        }
  );

  return { role: exp.role, company: exp.company, checks };
}

export function analyzeResumeBullets(resumeStructured: StructuredResume): BulletAnalysisSummary | null {
  const experiences = (resumeStructured.experiences ?? []).filter(
    (e) => (e.role ?? "").trim() || (e.description ?? "").trim()
  );
  if (experiences.length === 0) return null;

  const diagnostics = experiences.slice(0, 6).map(analyzeExperience);
  const allChecks = diagnostics.flatMap((d) => d.checks);
  const points = allChecks.reduce(
    (acc, c) => acc + (c.status === "pass" ? 1 : c.status === "warning" ? 0.5 : 0),
    0
  );
  const score = Math.round((points / allChecks.length) * 100);

  return { diagnostics, score };
}


