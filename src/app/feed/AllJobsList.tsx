import { deriveJobTags } from "@/lib/feed-tags";

type Job = {
  id: string;
  jobTitle: string;
  jobText: string;
  url: string;
  source: string;
  location?: string | null;
};

/**
 * Listagem simples de vagas para quem ainda NÃO enviou currículo: mostra todas as
 * vagas disponíveis (sem score de match), com link para a vaga original. As ações
 * personalizadas (análise completa, salvar no Kanban) exigem currículo e ficam no
 * FeedList/FeedCard, usados quando já existe um currículo.
 */
export function AllJobsList({ jobs }: { jobs: Job[] }) {
  if (jobs.length === 0) {
    return (
      <div className="rounded-2xl border border-neutral-200/80 dark:border-neutral-800 bg-white dark:bg-neutral-950 p-6 shadow-sm shadow-slate-900/5 text-center">
        <p className="text-sm text-neutral-600 dark:text-neutral-400">
          Ainda não há vagas disponíveis no momento. Volte em breve.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {jobs.map((job) => {
        const tags = deriveJobTags(job);
        const description = job.jobText.replace(/\s+/g, " ").trim().slice(0, 180);
        return (
          <div
            key={job.id}
            className="rounded-2xl border border-neutral-200/80 dark:border-neutral-800 bg-white dark:bg-neutral-950 p-5 shadow-sm shadow-slate-900/5 hover:shadow-md transition-shadow"
          >
            <a
              href={job.url}
              target="_blank"
              rel="noopener noreferrer"
              className="font-semibold text-base hover:underline"
            >
              {job.jobTitle}
            </a>
            <p className="text-sm text-neutral-500 dark:text-neutral-400 mt-0.5">
              {tags.company} · via {job.source}
            </p>
            {description && (
              <p className="text-sm text-neutral-600 dark:text-neutral-400 mt-2">{description}…</p>
            )}

            <div className="flex flex-wrap gap-2 mt-3">
              {tags.salary && (
                <span className="rounded-md bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-400 text-xs font-semibold px-2.5 py-1">
                  {tags.salary}
                </span>
              )}
              {[tags.contractType, tags.seniority, tags.workModel, tags.area, tags.location]
                .filter(Boolean)
                .map((tag) => (
                  <span
                    key={tag}
                    className="rounded-md bg-neutral-100 dark:bg-neutral-800 text-neutral-700 dark:text-neutral-300 text-xs font-medium px-2.5 py-1"
                  >
                    {tag}
                  </span>
                ))}
            </div>

            <a
              href={job.url}
              target="_blank"
              rel="noopener noreferrer"
              className="mt-4 inline-flex items-center gap-1 text-sm font-medium text-blue-600 hover:text-blue-700 dark:text-blue-400"
            >
              Ver vaga original
              <svg viewBox="0 0 24 24" fill="none" className="h-3.5 w-3.5">
                <path d="M7 17 17 7M9 7h8v8" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </a>
          </div>
        );
      })}
    </div>
  );
}
