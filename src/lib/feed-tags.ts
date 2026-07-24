import { parseBrazilLocation } from "@/lib/brazil-locations";
import { classifyArea } from "@/lib/area-taxonomy";

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
  [/remot[oae]|remote/i, "Remoto"],
  [/h[ií]brid[oa]|hybrid/i, "Hibrido"],
  [/presencial|on[- ]?site/i, "Presencial"],
];

// Regime de contratação. A ordem importa: aprendiz e estágio são regimes
// legais próprios e devem ganhar de CLT/PJ quando ambos aparecem no texto.
const CONTRACT_TYPE_PATTERNS: [RegExp, string][] = [
  [/menor aprendiz|jovem aprendiz|\baprendiz\b/i, "Aprendiz"],
  [/est[aá]gi[oó]|estagi[aá]ri[oa]/i, "Estagio"],
  [/\bpj\b|pessoa jur[ií]dica|prestador de servi[cç]o|contrato pj|regime pj/i, "PJ"],
  [/\bclt\b|carteira assinada|regime clt|efetiv[oa]|contrata[cç][aã]o clt/i, "CLT"],
  [/tempor[aá]ri[oa]|contrato tempor[aá]rio|contrato por prazo determinado|safra/i, "Temporario"],
];

export const CONTRACT_TYPE_OPTIONS = ["CLT", "PJ", "Estagio", "Aprendiz", "Temporario"];

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
  [/jornalis|comunica[cç][aã]o social|assessoria de imprensa|redator publicit[aá]rio|rela[cç][oõ]es p[uú]blicas/i, "Comunicacao"],
  [/arquitet[oôu]|urbanismo/i, "Arquitetura"],
  [/agronomi|agroneg[oó]cio|zootecni|engenheiro agr[oô]nomo/i, "Agronomia"],
  [/veterin[aá]ri/i, "Veterinaria"],
  [/audiovisual|artes c[eê]nicas|artes visuais|cinema\b|produ[cç][aã]o cultural|curador/i, "Artes"],
  [/turismo|hotelaria|gastronomia|chef de cozinha/i, "Turismo"],
  [/pol[ií]cia militar|pol[ií]cia civil|bombeiro|seguran[cç]a p[uú]blica|for[cç]as armadas|per[ií]cia criminal/i, "Seguranca Publica"],
  [/desenvolvedor|engenheiro de software|programador|sistemas|\bti\b|tecnologia/i, "Tecnologia"],
  [/engenheir|engenharia/i, "Engenharia"],
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

const KNOWN_COMPANY_NAMES: Record<string, string> = {
  rdstation: "RD Station",
  arcoeducacao: "Arco Educação",
  xpinc: "XP Inc",
  zupinnovation: "Zup Innovation",
  capco: "Capco",
  nubank: "Nubank",
  cloudwalk: "CloudWalk",
  quintoandar: "QuintoAndar",
  hotmart: "Hotmart",
  gympass: "Gympass",
  wellhub: "Wellhub",
  lojasrenner: "Lojas Renner",
  cacaushow: "Cacau Show",
  mdiasbranco: "M. Dias Branco",
  c6bank: "C6 Bank",
  picpay: "PicPay",
  fastshop: "Fast Shop",
  pagseguro: "PagSeguro",
  flashapp: "Flash",
  ciandt: "CI&T",
  pipefy: "Pipefy",
  ebanx: "EBANX",
  olist: "Olist",
  wildlife: "Wildlife Studios",
  assai: "Assaí Atacadista",
  localiza: "Localiza",
  petz: "Petz",
  riachuelo: "Riachuelo",
  grupoboticario: "Grupo Boticário",
  tenda: "Construtora Tenda",
  cyrela: "Cyrela",
  jsl: "JSL",
  atento: "Atento",
  americanas: "Americanas",
  raiadrogasil: "RaiaDrogasil",
  suzano: "Suzano",
  vibraenergia: "Vibra Energia",
  gpa: "Grupo Pão de Açúcar",
  vivo: "Vivo",
  stone: "Stone",
  vtex: "VTEX",
  monks: "Media.Monks",
  clara: "Clara",
  brex: "Brex",
  stripe: "Stripe",
  canonical: "Canonical",
  elastic: "Elastic",
  datadog: "Datadog",
  cloudflare: "Cloudflare",
  figma: "Figma",
  thoughtworks: "Thoughtworks",
  turing: "Turing",
  postman: "Postman",
  vercel: "Vercel",
  gitlab: "GitLab",
  grafanalabs: "Grafana Labs",
  mongodb: "MongoDB",
  checkr: "Checkr",
};

export function formatCompanyName(slug: string): string {
  if (!slug) return "Empresa";
  const norm = slug.trim().toLowerCase();
  if (KNOWN_COMPANY_NAMES[norm]) return KNOWN_COMPANY_NAMES[norm];

  return slug
    .replace(/[-_]+/g, " ")
    .replace(/([a-z])([A-Z])/g, "$1 $2")
    .split(" ")
    .map((w) =>
      w.length <= 3 && !["de", "da", "do", "dos", "das", "e"].includes(w.toLowerCase())
        ? w.toUpperCase()
        : w.charAt(0).toUpperCase() + w.slice(1).toLowerCase()
    )
    .join(" ");
}

export function extractCompanyFromUrl(urlStr: string): string {
  try {
    const url = new URL(urlStr);
    const hostname = url.hostname.toLowerCase().replace(/^www\./, "");
    const pathSegments = url.pathname.split("/").filter(Boolean);

    if (hostname.includes("greenhouse.io")) {
      const forParam = url.searchParams.get("for");
      if (forParam) return formatCompanyName(forParam);
      if (pathSegments.length > 0 && pathSegments[0] !== "embed" && pathSegments[0] !== "v1") {
        return formatCompanyName(pathSegments[0]);
      }
      if (pathSegments.length > 2 && pathSegments[0] === "v1" && pathSegments[1] === "boards") {
        return formatCompanyName(pathSegments[2]);
      }
    }

    if (hostname.includes("lever.co")) {
      if (pathSegments.length > 0) return formatCompanyName(pathSegments[0]);
    }

    if (hostname.includes("gupy.io") || hostname.includes("solides.jobs")) {
      const subdomain = hostname.split(".")[0];
      if (subdomain && !["job-boards", "jobs", "boards"].includes(subdomain)) {
        return formatCompanyName(subdomain);
      }
    }

    const parts = hostname.split(".");
    let mainLabel = parts[0];
    if (["job-boards", "boards", "jobs", "careers"].includes(mainLabel) && parts.length > 1) {
      mainLabel = parts[1];
    }
    return formatCompanyName(mainLabel);
  } catch {
    return "Empresa";
  }
}

export type JobTags = {
  seniority?: string;
  workModel?: string;
  area?: string;
  subarea?: string;
  location?: string;
  company: string;
  salary?: string;
  salaryValue?: number;
  contractType?: string;
};

export function deriveJobTags(job: {
  jobTitle: string;
  jobText: string;
  url: string;
  location?: string | null;
  company?: string | null;
}): JobTags {
  const haystack = `${job.jobTitle} ${job.jobText}`;

  let company = job.company?.trim() || "";
  const lowerComp = company.toLowerCase();
  if (!company || lowerComp === "job-boards" || lowerComp === "boards" || lowerComp === "jobs" || lowerComp === "empresa") {
    company = extractCompanyFromUrl(job.url);
  }

  const workModel = matchFirst(haystack, WORK_MODEL_PATTERNS);
  const salaryInfo = extractSalary(haystack);

  // Subárea vem direto do texto da vaga via classifyArea (VOCATION_AREAS),
  // independente de AREA_PATTERNS acima: os labels desse array são mais
  // antigos/grosseiros e não batem 1:1 com os slugs de VOCATION_AREAS, mas
  // servem bem como tag adicional de "área geral" já existente na UI/dados.
  const { subarea } = classifyArea(haystack);

  return {
    seniority: matchFirst(haystack, SENIORITY_PATTERNS),
    workModel,
    area: matchFirst(haystack, AREA_PATTERNS),
    subarea: subarea || undefined,
    location: job.location?.trim() || undefined,
    company,
    salary: salaryInfo?.label,
    salaryValue: salaryInfo?.value,
    contractType: matchFirst(haystack, CONTRACT_TYPE_PATTERNS),
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

export function classifyJobForStorage(job: {
  jobTitle: string;
  jobText: string;
  url: string;
  location?: string | null;
}): {
  company: string;
  area: string;
  subarea: string;
  seniority: string;
  workModel: string;
  contractType: string;
  entryLevel: boolean;
  salaryMin?: number;
  city: string;
  state: string;
} {
  const tags = deriveJobTags(job);
  const { city, state } = parseBrazilLocation(job.location);

  return {
    company: tags.company,
    area: tags.area ?? "",
    subarea: tags.subarea ?? "",
    seniority: tags.seniority ?? "",
    workModel: tags.workModel ?? "",
    contractType: tags.contractType ?? "",
    entryLevel: isEntryLevelJob(job),
    salaryMin: tags.salaryValue ? Math.round(tags.salaryValue) : undefined,
    city,
    state,
  };
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
