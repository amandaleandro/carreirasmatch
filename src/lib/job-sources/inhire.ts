import { FetchedJob } from "./types";

// InHire (ATS) não tem busca agregada pública: cada empresa é um "tenant"
// isolado, sem lista pública de clientes. A API pública por tenant devolve
// um objeto com as vagas quando o slug existe, ou um array vazio quando não
// existe — funciona como oráculo pra validar slugs. A lista abaixo foi
// validada manualmente contra essa API (slugs reais, cobrindo bancos,
// varejo, saúde, tech, consultoria). Mesmo padrão de lista fixa usado em
// gupy.ts/greenhouse.ts; pode ser ampliada via env sem alterar código.
const API_URL = "https://api.inhire.app/job-posts/public/pages";
const DEFAULT_TENANTS = [
  "aarin", "alelo", "algar", "alice", "alicerce", "amaro", "amcom", "avenue",
  "bancopine", "bemobi", "bionexo", "bradesco", "brq", "cerc", "cielo", "cobli",
  "contaazul", "contabilizei", "cora", "csu", "cubos", "db1", "deal", "digix",
  "dock", "dtidigital", "ecore", "elogroup", "enjoei", "exati", "fbiz",
  "grupoboticario", "harpia", "idwall", "instacarro", "involves", "iteris",
  "kpmg", "lastlink", "listo", "livelo", "loggi", "magazineluiza", "matera",
  "mazzatech", "mjv", "mundiale", "neogrid", "neoway", "nexaas", "nibo",
  "objective", "olist", "openlabs", "orizon", "paipe", "pitang",
  "platformbuilders", "pravaler", "radix", "rarolabs", "reclameaqui",
  "remessaonline", "samsung", "semantix", "skyone", "solutis", "superlogica",
  "techlead", "tempest", "tinnova", "tqi", "trinca", "turbi", "unico",
  "venturus", "vhsys", "warren", "winnin",
];

type InhireJobPost = {
  jobId: string;
  displayName: string;
  workplaceType?: string;
  location?: string;
  status?: string;
};

type InhireTenantResponse = {
  tenantName?: string;
  jobsPage?: InhireJobPost[];
};

export function isInhireConfigured(): boolean {
  return getInhireTenants().length > 0;
}

export function getInhireTenants(): string[] {
  const configured = (process.env.INHIRE_TENANTS ?? "")
    .split(",")
    .map((slug) => slug.trim())
    .filter(Boolean);

  return configured.length > 0 ? configured : DEFAULT_TENANTS;
}

function slugify(text: string): string {
  return text
    .normalize("NFD")
    .replace(/\p{Diacritic}/gu, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");
}

async function fetchTenantJobs(slug: string): Promise<FetchedJob[]> {
  const response = await fetch(API_URL, {
    headers: {
      "X-Inhire-Client": "web-inhire",
      "X-Tenant": slug,
      Accept: "application/json",
    },
    signal: AbortSignal.timeout(10000),
  });
  if (!response.ok) {
    throw new Error(`API da InHire (${slug}) retornou erro ${response.status}`);
  }

  const body = await response.json();
  // tenant inexistente responde com array vazio; tenant real responde objeto
  if (Array.isArray(body)) return [];

  const data = body as InhireTenantResponse;
  const jobs = data.jobsPage ?? [];

  return jobs
    .filter((job) => !job.status || job.status.toLowerCase() === "published")
    .map((job) => ({
      url: `https://${slug}.inhire.app/vagas/${job.jobId}/${slugify(job.displayName)}`,
      jobTitle: job.displayName,
      jobText: job.displayName,
      source: "inhire",
      company: data.tenantName ?? slug,
      location: job.location,
    }));
}

export async function fetchInhireJobs(
  keywords?: string[],
  tenants: string[] = getInhireTenants()
): Promise<FetchedJob[]> {
  if (tenants.length === 0) return [];

  const perTenant = await Promise.allSettled(tenants.map(fetchTenantJobs));
  const jobsByUrl = new Map<string, FetchedJob>();
  for (const result of perTenant) {
    if (result.status === "fulfilled") {
      for (const job of result.value) {
        if (!jobsByUrl.has(job.url)) jobsByUrl.set(job.url, job);
      }
    }
  }

  const lowerKeywords = keywords?.map((keyword) => keyword.toLowerCase());
  return [...jobsByUrl.values()].filter((job) => {
    if (!lowerKeywords || lowerKeywords.length === 0) return true;
    return lowerKeywords.some((keyword) => job.jobTitle.toLowerCase().includes(keyword));
  });
}
