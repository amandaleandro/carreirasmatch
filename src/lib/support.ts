/**
 * Suporte: o usuário abre um ticket numa "área" e conversa com o admin dentro
 * do sistema. As áreas existem para o admin triar a fila — e para o usuário
 * não precisar explicar do zero de que assunto se trata.
 */

export const SUPPORT_CATEGORIES = [
  "billing",
  "account",
  "analysis",
  "jobs",
  "suggestion",
  "other",
] as const;
export type SupportCategory = (typeof SUPPORT_CATEGORIES)[number];

export const SUPPORT_CATEGORY_LABELS: Record<SupportCategory, string> = {
  billing: "Pagamento e assinatura",
  account: "Conta e acesso",
  analysis: "Análises e ferramentas de IA",
  jobs: "Vagas e feed",
  suggestion: "Sugestão de melhoria",
  other: "Outro assunto",
};

export const SUPPORT_CATEGORY_DESCRIPTIONS: Record<SupportCategory, string> = {
  billing: "Cobrança, Pix, cartão, reembolso, plano ou cupom.",
  account: "Login, senha, e-mail, dados do perfil ou exclusão de conta.",
  analysis: "Erro ou resultado estranho em uma análise ou ferramenta.",
  jobs: "Vaga errada, link quebrado ou problema no feed.",
  suggestion: "Ideia de recurso ou algo que poderia ser melhor.",
  other: "Qualquer coisa que não se encaixa nas outras áreas.",
};

/**
 * `open` = aguardando resposta do admin; `pending` = admin respondeu e espera o
 * usuário; `resolved` = encerrado. Quem responde é que muda o status, então a
 * fila do admin é sempre "o que está em open".
 */
export const SUPPORT_STATUSES = ["open", "pending", "resolved"] as const;
export type SupportStatus = (typeof SUPPORT_STATUSES)[number];

export const SUPPORT_STATUS_LABELS: Record<SupportStatus, string> = {
  open: "Aguardando suporte",
  pending: "Aguardando você",
  resolved: "Resolvido",
};

export const SUPPORT_STATUS_ADMIN_LABELS: Record<SupportStatus, string> = {
  open: "Aguardando resposta",
  pending: "Aguardando usuário",
  resolved: "Resolvido",
};

export const MAX_SUPPORT_SUBJECT_LENGTH = 120;
export const MAX_SUPPORT_MESSAGE_LENGTH = 4000;

export function normalizeSupportCategory(value: unknown): SupportCategory {
  const raw = String(value ?? "").trim();
  return (SUPPORT_CATEGORIES as readonly string[]).includes(raw)
    ? (raw as SupportCategory)
    : "other";
}

export function normalizeSupportStatus(value: unknown): SupportStatus {
  const raw = String(value ?? "").trim();
  return (SUPPORT_STATUSES as readonly string[]).includes(raw)
    ? (raw as SupportStatus)
    : "open";
}

export function supportStatusBadgeClass(status: SupportStatus): string {
  if (status === "open") return "bg-amber-100 text-amber-800 dark:bg-amber-900/50 dark:text-amber-300";
  if (status === "pending") return "bg-blue-100 text-blue-800 dark:bg-blue-900/50 dark:text-blue-300";
  return "bg-emerald-100 text-emerald-800 dark:bg-emerald-900/50 dark:text-emerald-300";
}
