export const APPLICATION_STATUSES = [
  "saved",
  "tailor_resume",
  "applied",
  "interview",
  "technical_test",
  "offer",
  "rejected",
] as const;

export type ApplicationStatus = (typeof APPLICATION_STATUSES)[number];

export const APPLICATION_STATUS_CONFIG: Record<
  ApplicationStatus,
  { label: string; description: string; dot: string; column: string }
> = {
  saved: {
    label: "Salvas",
    description: "Vagas boas para acompanhar.",
    dot: "bg-sky-500",
    column: "border-sky-200 bg-sky-50/60 dark:border-sky-900/60 dark:bg-sky-950/20",
  },
  tailor_resume: {
    label: "Ajustar currículo",
    description: "Precisa adaptar antes de aplicar.",
    dot: "bg-amber-500",
    column: "border-amber-200 bg-amber-50/60 dark:border-amber-900/60 dark:bg-amber-950/20",
  },
  applied: {
    label: "Aplicadas",
    description: "Candidaturas enviadas.",
    dot: "bg-blue-500",
    column: "border-blue-200 bg-blue-50/60 dark:border-blue-900/60 dark:bg-blue-950/20",
  },
  interview: {
    label: "Entrevistas",
    description: "Conversas marcadas ou em andamento.",
    dot: "bg-violet-500",
    column: "border-violet-200 bg-violet-50/60 dark:border-violet-900/60 dark:bg-violet-950/20",
  },
  technical_test: {
    label: "Teste técnico",
    description: "Desafios, cases e provas.",
    dot: "bg-fuchsia-500",
    column: "border-fuchsia-200 bg-fuchsia-50/60 dark:border-fuchsia-900/60 dark:bg-fuchsia-950/20",
  },
  offer: {
    label: "Ofertas",
    description: "Propostas recebidas.",
    dot: "bg-emerald-500",
    column: "border-emerald-200 bg-emerald-50/60 dark:border-emerald-900/60 dark:bg-emerald-950/20",
  },
  rejected: {
    label: "Finalizadas",
    description: "Processos encerrados.",
    dot: "bg-neutral-500",
    column: "border-neutral-200 bg-neutral-50/60 dark:border-neutral-800 dark:bg-neutral-900/40",
  },
};

export function normalizeApplicationStatus(value: FormDataEntryValue | string | null) {
  return APPLICATION_STATUSES.includes(value as ApplicationStatus)
    ? (value as ApplicationStatus)
    : "saved";
}

export function getWeekStart(date = new Date()) {
  const weekStart = new Date(date);
  const day = weekStart.getDay();
  const diff = day === 0 ? -6 : 1 - day;
  weekStart.setDate(weekStart.getDate() + diff);
  weekStart.setHours(0, 0, 0, 0);
  return weekStart;
}

export type JourneyMetrics = {
  daysSearching: number | null;
  responseRate: number | null;
  rejectionRate: number | null;
};

/** Aggregate metrics for the "sua jornada de busca" widgets on /applications and /dashboard. */
export function computeJourneyMetrics(
  applications: { status: string; createdAt: Date }[],
  now = new Date()
): JourneyMetrics {
  if (applications.length === 0) {
    return { daysSearching: null, responseRate: null, rejectionRate: null };
  }

  const firstCreatedAt = applications.reduce(
    (earliest, item) => (item.createdAt < earliest ? item.createdAt : earliest),
    applications[0].createdAt
  );
  const daysSearching = Math.max(
    0,
    Math.floor((now.getTime() - firstCreatedAt.getTime()) / (1000 * 60 * 60 * 24))
  );

  const appliedOrLater = applications.filter((item) =>
    (["applied", "interview", "technical_test", "offer", "rejected"] as string[]).includes(item.status)
  ).length;
  const respondedBack = applications.filter((item) =>
    (["interview", "technical_test", "offer", "rejected"] as string[]).includes(item.status)
  ).length;
  const responseRate = appliedOrLater > 0 ? Math.round((respondedBack / appliedOrLater) * 100) : null;

  const rejected = applications.filter((item) => item.status === "rejected").length;
  const finalized = respondedBack;
  const rejectionRate = finalized > 0 ? Math.round((rejected / finalized) * 100) : null;

  return { daysSearching, responseRate, rejectionRate };
}
