export type FeedTier = "excellent" | "good" | "medium" | "low";

export function tierFromScore(score: number): FeedTier {
  if (score >= 85) return "excellent";
  if (score >= 65) return "good";
  if (score >= 50) return "medium";
  return "low";
}

export const TIER_LABEL: Record<FeedTier, string> = {
  excellent: "Excelente match",
  good: "Bom match",
  medium: "Match mediano",
  low: "Baixa aderencia",
};

export const TIER_RING_COLOR: Record<FeedTier, string> = {
  excellent: "#22c55e",
  good: "#22c55e",
  medium: "#f59e0b",
  low: "#ef4444",
};

export const TIER_TEXT_CLASS: Record<FeedTier, string> = {
  excellent: "text-emerald-600 dark:text-emerald-400",
  good: "text-emerald-600 dark:text-emerald-400",
  medium: "text-amber-600 dark:text-amber-400",
  low: "text-red-600 dark:text-red-400",
};

export const TIER_ICON_BG: Record<FeedTier, string> = {
  excellent: "bg-emerald-50 dark:bg-emerald-950/40 text-emerald-600 dark:text-emerald-400",
  good: "bg-emerald-50 dark:bg-emerald-950/40 text-emerald-600 dark:text-emerald-400",
  medium: "bg-amber-50 dark:bg-amber-950/40 text-amber-600 dark:text-amber-400",
  low: "bg-red-50 dark:bg-red-950/40 text-red-600 dark:text-red-400",
};

const SENIORITY_PATTERNS: [RegExp, string][] = [
  [/sem experi[eê]ncia|sem experiencia|n[aã]o exige experi[eê]ncia|nao exige experiencia|primeir[oa] emprego|entrada|entry[- ]?level|aprendiz|jovem aprendiz/i, "Sem experiencia"],
  [/est[aá]gi[oá]|estagi[aá]rio|trainee/i, "Estagio"],
  [/j[uú]nior|jr\.?\b/i, "Junior"],
  [/pleno/i, "Pleno"],
  [/s[eê]nior|sr\.?\b/i, "Senior"],
  [/especialista|principal|staff/i, "Especialista"],
];

export const ENTRY_LEVEL_SENIORITIES = new Set(["Sem experiencia", "Estagio", "Junior"]);

const WORK_MODEL_PATTERNS: [RegExp, string][] = [
  [/remot[oa]/i, "Remoto"],
  [/h[ií]brid[oa]/i, "Hibrido"],
  [/presencial/i, "Presencial"],
];

const AREA_PATTERNS: [RegExp, string][] = [
  [/produto/i, "Produto"],
  [/marketing/i, "Marketing"],
  [/suporte|atendimento ao cliente|help ?desk/i, "TI & Suporte"],
  [/recursos humanos|\brh\b|people ?ops|gente e gest[aã]o/i, "RH"],
  [/vendas|comercial/i, "Vendas"],
  [/financeiro|finan[cç]as/i, "Financeiro"],
  [/log[ií]stica|estoque|expedi[cç][aã]o/i, "Logistica"],
  [/administra[cç][aã]o|administrativo|escrit[oó]rio/i, "Administrativo"],
  [/educa[cç][aã]o|professor|ensino/i, "Educacao"],
  [/sa[uú]de|enfermagem|hospital|farm[aá]cia/i, "Saude"],
  [/jur[ií]dico|advogado|contratos/i, "Juridico"],
  [/design/i, "Design"],
  [/desenvolvedor|engenheiro de software|programador|sistemas|\bti\b|tecnologia/i, "Tecnologia"],
];

function matchFirst(text: string, patterns: [RegExp, string][]): string | undefined {
  for (const [pattern, label] of patterns) {
    if (pattern.test(text)) return label;
  }
  return undefined;
}

const SALARY_PATTERN = /r\$\s?(\d{1,3}(?:\.\d{3})*(?:,\d{2})?|\d+(?:,\d{2})?)/i;

function extractSalary(text: string): { label: string; value: number } | undefined {
  const match = text.match(SALARY_PATTERN);
  if (!match) return undefined;

  const raw = match[1];
  const normalized = raw.replace(/\./g, "").replace(",", ".");
  const value = Number(normalized);
  if (!Number.isFinite(value) || value <= 0) return undefined;

  return { label: `R$ ${raw}`, value };
}

export type JobTags = {
  seniority?: string;
  workModel?: string;
  area?: string;
  location?: string;
  company: string;
  salary?: string;
  salaryValue?: number;
};

export function deriveJobTags(job: {
  jobTitle: string;
  jobText: string;
  url: string;
  location?: string | null;
}): JobTags {
  const haystack = `${job.jobTitle} ${job.jobText}`;

  let company = "Empresa";
  try {
    const hostname = new URL(job.url).hostname.replace(/^www\./, "");
    const label = hostname.split(".")[0];
    if (label) company = label.charAt(0).toUpperCase() + label.slice(1);
  } catch {
    // keep fallback
  }

  const workModel = matchFirst(haystack, WORK_MODEL_PATTERNS);
  const salaryInfo = extractSalary(haystack);

  return {
    seniority: matchFirst(haystack, SENIORITY_PATTERNS),
    workModel,
    area: matchFirst(haystack, AREA_PATTERNS),
    location: job.location?.trim() || undefined,
    company,
    salary: salaryInfo?.label,
    salaryValue: salaryInfo?.value,
  };
}

export function isEntryLevelJob(job: {
  jobTitle: string;
  jobText: string;
  url: string;
  location?: string | null;
}): boolean {
  const tags = deriveJobTags(job);
  if (tags.seniority && ENTRY_LEVEL_SENIORITIES.has(tags.seniority)) return true;

  const haystack = `${job.jobTitle} ${job.jobText}`.toLowerCase();
  return [
    "sem experiência",
    "sem experiencia",
    "não exige experiência",
    "nao exige experiencia",
    "primeiro emprego",
    "primeira experiência",
    "primeira experiencia",
    "jovem aprendiz",
    "aprendiz",
    "estágio",
    "estagio",
    "estagiário",
    "estagiario",
    "trainee",
    "entry level",
    "entry-level",
  ].some((term) => haystack.includes(term));
}

export function bypassesLocationFilter(workModel?: string): boolean {
  return workModel === "Remoto" || workModel === "Hibrido";
}

const NEGATIVE_HINTS = [
  "nao",
  "não",
  "falta",
  "menor",
  "pouca",
  "pouco",
  "baixa",
  "diferente",
  "sem ",
  "distante",
  "desalinh",
  "nao alinhad",
  "não alinhad",
];

export type ReasonBullet = { text: string; kind: "positive" | "warning" | "negative" };

export function reasonBullets(reason: string, tier: FeedTier): ReasonBullet[] {
  const sentences = reason
    .split(/(?<=[.;])\s+/)
    .map((s) => s.trim())
    .filter(Boolean);

  const list = sentences.length > 0 ? sentences : [reason.trim()];

  return list.map((text) => {
    const isNegative = NEGATIVE_HINTS.some((hint) => text.toLowerCase().includes(hint));

    let kind: ReasonBullet["kind"];
    if (tier === "low") kind = "negative";
    else if (tier === "excellent") kind = "positive";
    else kind = isNegative ? "warning" : "positive";

    return { text, kind };
  });
}
