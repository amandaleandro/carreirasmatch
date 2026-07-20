// Domínio do marketplace freelancer. Helpers puros compartilhados entre
// server (API/páginas) e client (formulários). Nada aqui toca o banco.

export const FREELANCE_CATEGORIES = [
  { value: "design", label: "Design & Criação" },
  { value: "dev", label: "Programação & Tecnologia" },
  { value: "marketing", label: "Marketing Digital" },
  { value: "redacao", label: "Redação & Tradução" },
  { value: "video", label: "Vídeo & Animação" },
  { value: "audio", label: "Áudio & Música" },
  { value: "consultoria", label: "Consultoria & Negócios" },
  { value: "dados", label: "Dados & IA" },
  { value: "juridico", label: "Jurídico & Financeiro" },
  { value: "suporte", label: "Suporte & Administrativo" },
  { value: "outros", label: "Outros" },
] as const;

export const BUDGET_TYPES = [
  { value: "fixed", label: "Preço fechado" },
  { value: "hourly", label: "Por hora" },
] as const;

export const PROJECT_WORK_MODELS = [
  { value: "remoto", label: "Remoto" },
  { value: "presencial", label: "Presencial" },
  { value: "hibrido", label: "Híbrido" },
] as const;

export function categoryLabel(value: string): string {
  return FREELANCE_CATEGORIES.find((c) => c.value === value)?.label ?? value;
}

// --- Skills (persistidas como JSON string[]) ---------------------------------

/** Faz o parse tolerante de uma coluna JSON de skills para string[]. */
export function parseSkills(raw: string | null | undefined): string[] {
  if (!raw) return [];
  try {
    const parsed = JSON.parse(raw);
    if (!Array.isArray(parsed)) return [];
    return parsed.map((s) => String(s).trim()).filter(Boolean).slice(0, 30);
  } catch {
    return [];
  }
}

/** Normaliza uma lista de skills (dedupe case-insensitive, limite, trim). */
export function normalizeSkills(input: unknown): string[] {
  const arr = Array.isArray(input)
    ? input
    : typeof input === "string"
      ? input.split(",")
      : [];
  const seen = new Set<string>();
  const out: string[] = [];
  for (const item of arr) {
    const s = String(item).trim().slice(0, 40);
    if (!s) continue;
    const key = s.toLowerCase();
    if (seen.has(key)) continue;
    seen.add(key);
    out.push(s);
    if (out.length >= 30) break;
  }
  return out;
}

// --- Portfólio (persistido como JSON) ---------------------------------------

export interface PortfolioItem {
  title: string;
  url: string;
  imageUrl: string;
  description: string;
}

export function parsePortfolio(raw: string | null | undefined): PortfolioItem[] {
  if (!raw) return [];
  try {
    const parsed = JSON.parse(raw);
    if (!Array.isArray(parsed)) return [];
    return parsed
      .map((item) => ({
        title: String(item?.title ?? "").trim().slice(0, 120),
        url: String(item?.url ?? "").trim().slice(0, 500),
        imageUrl: String(item?.imageUrl ?? "").trim().slice(0, 500),
        description: String(item?.description ?? "").trim().slice(0, 500),
      }))
      .filter((item) => item.title || item.url)
      .slice(0, 12);
  } catch {
    return [];
  }
}

// --- Reputação --------------------------------------------------------------

/** Média de avaliação (0 quando ainda não há nenhuma). */
export function averageRating(ratingSum: number, ratingCount: number): number {
  if (ratingCount <= 0) return 0;
  return ratingSum / ratingCount;
}

// --- Valores em centavos ----------------------------------------------------

/** Converte um valor em reais (string do form) para centavos, ou null. */
export function reaisToCents(input: unknown): number | null {
  const n = Number(String(input ?? "").replace(",", "."));
  if (!Number.isFinite(n) || n <= 0) return null;
  return Math.round(n * 100);
}

/** Formata centavos como "R$ 1.234". Sem centavos quando redondo. */
export function formatCents(cents: number | null | undefined): string {
  if (cents == null) return "A combinar";
  const value = cents / 100;
  return value.toLocaleString("pt-BR", {
    style: "currency",
    currency: "BRL",
    minimumFractionDigits: Number.isInteger(value) ? 0 : 2,
    maximumFractionDigits: 2,
  });
}

/** Faixa de orçamento de um projeto em texto legível. */
export function formatBudget(
  budgetType: string,
  min: number | null | undefined,
  max: number | null | undefined
): string {
  const suffix = budgetType === "hourly" ? "/h" : "";
  if (min != null && max != null && min !== max) {
    return `${formatCents(min)} – ${formatCents(max)}${suffix}`;
  }
  const single = min ?? max;
  if (single != null) return `${formatCents(single)}${suffix}`;
  return "A combinar";
}
