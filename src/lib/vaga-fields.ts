// Opções controladas dos campos de vaga, reusadas em formulários e exibição.

export const APPLICATION_STATUSES = [
  { value: "new", label: "Novo" },
  { value: "reviewing", label: "Em análise" },
  { value: "interview", label: "Entrevista" },
  { value: "approved", label: "Aprovado" },
  { value: "rejected", label: "Reprovado" },
] as const;

export const APPLICATION_STATUS_VALUES = APPLICATION_STATUSES.map((s) => s.value);

export function applicationStatusLabel(value: string): string {
  return APPLICATION_STATUSES.find((s) => s.value === value)?.label ?? "Novo";
}

export const WORK_MODELS = [
  { value: "presencial", label: "Presencial" },
  { value: "hibrido", label: "Híbrido" },
  { value: "remoto", label: "Remoto" },
] as const;

export const SENIORITIES = [
  { value: "estagio", label: "Estágio" },
  { value: "junior", label: "Júnior" },
  { value: "pleno", label: "Pleno" },
  { value: "senior", label: "Sênior" },
] as const;

export const JOB_TYPES = [
  { value: "clt", label: "CLT" },
  { value: "pj", label: "PJ" },
  { value: "estagio", label: "Estágio" },
  { value: "temporario", label: "Temporário" },
] as const;

function labelFrom(list: readonly { value: string; label: string }[], value: string): string {
  return list.find((o) => o.value === value)?.label ?? "";
}

export const workModelLabel = (v: string) => labelFrom(WORK_MODELS, v);
export const seniorityLabel = (v: string) => labelFrom(SENIORITIES, v);
export const jobTypeLabel = (v: string) => labelFrom(JOB_TYPES, v);

export function isEntryLevelVaga(seniority: string, jobType: string): boolean {
  return seniority === "estagio" || seniority === "junior" || jobType === "estagio";
}

/** Formata um piso salarial (em reais inteiros) como texto curto. */
export function formatSalaryMin(salaryMin: number | null | undefined): string {
  if (!salaryMin || salaryMin <= 0) return "";
  return `A partir de R$ ${salaryMin.toLocaleString("pt-BR")}`;
}

/** Chips de rótulos legíveis a partir dos campos de uma vaga. */
export function vagaAttributeChips(v: {
  workModel: string;
  seniority: string;
  jobType: string;
  salaryMin: number | null;
}): string[] {
  return [
    workModelLabel(v.workModel),
    seniorityLabel(v.seniority),
    jobTypeLabel(v.jobType),
    formatSalaryMin(v.salaryMin),
  ].filter(Boolean);
}
