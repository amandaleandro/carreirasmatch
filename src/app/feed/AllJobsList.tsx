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
      <div className="rounded-3xl border border-[#E2E8F0] dark:border-neutral-800 bg-[#FFFFFF] dark:bg-neutral-950 p-8 shadow-[0_8px_30px_rgb(0,0,0,0.01)] text-center">
        <p className="text-xs font-semibold text-[#64748B] dark:text-neutral-400">
          Ainda não há vagas disponíveis no momento. Volte em breve.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {jobs.map((job) => {
        const tags = deriveJobTags(job);
        const cleanedText = job.jobText
          .replace(/Copiar link|Erro ao copiar link|Compartilhar vaga|Link copiado|Ir para candidatura|Descrição da vaga|Responsável pelo atendimento/gi, " ")
          .replace(/\s+/g, " ")
          .trim();
        const description = cleanedText.slice(0, 150);
        return (
          <div
            key={job.id}
            className="rounded-3xl border border-[#E2E8F0] dark:border-neutral-800 bg-[#FFFFFF] dark:bg-neutral-900/40 p-5 shadow-[0_8px_30px_rgb(0,0,0,0.01)] hover:shadow-[0_8px_30px_rgb(0,0,0,0.03)] hover:-translate-y-[1px] transition-all duration-300 flex flex-col sm:flex-row items-start justify-between gap-4"
          >
            <div className="min-w-0 flex-1 space-y-3">
              <div>
                <a
                  href={job.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="font-title font-bold text-sm md:text-base text-[#071827] dark:text-white hover:text-[#2563EB] transition-colors leading-tight"
                >
                  {job.jobTitle}
                </a>
                <p className="text-xs text-[#64748B] dark:text-neutral-400 mt-1 font-semibold">
                  {tags.company} · via {job.source}
                </p>
              </div>

              {description && (
                <p className="text-xs text-[#64748B] dark:text-neutral-300 leading-relaxed font-medium line-clamp-2">
                  {description}…
                </p>
              )}

              {/* Badges de Tags */}
              <div className="flex flex-wrap gap-1.5">
                {tags.salary && (
                  <span className="rounded-lg bg-[#22C55E]/10 border border-[#22C55E]/20 text-[#22C55E] text-[10px] font-bold px-2.5 py-0.5">
                    {tags.salary}
                  </span>
                )}
                {[tags.contractType, tags.seniority, tags.workModel, tags.area, tags.location]
                  .filter(Boolean)
                  .map((tag, idx) => (
                    <span
                      key={`${tag}-${idx}`}
                      className="rounded-lg bg-[#F8FAFC] dark:bg-neutral-800 border border-[#E2E8F0] dark:border-neutral-700 text-[#64748B] dark:text-neutral-300 text-[10px] font-bold px-2.5 py-0.5"
                    >
                      {tag}
                    </span>
                  ))}
              </div>
            </div>

            <div className="shrink-0 pt-1">
              <a
                href={job.url}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1 rounded-xl border border-[#E2E8F0] hover:border-[#64748B] dark:border-neutral-700 bg-white dark:bg-neutral-900 text-[#071827] dark:text-white text-xs font-bold px-4 py-2 shadow-sm transition-all"
              >
                Ver vaga original
                <svg viewBox="0 0 24 24" fill="none" className="h-3.5 w-3.5">
                  <path d="M7 17 17 7M9 7h8v8" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              </a>
            </div>
          </div>
        );
      })}
    </div>
  );
}
