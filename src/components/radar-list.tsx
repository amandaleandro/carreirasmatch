import { ExternalLink, Clock, Building2, Search } from "lucide-react";

type RadarItem = {
  id: string;
  title: string;
  url: string;
  source: string;
  summary: string;
  publishedAt: Date | null;
};

function formatDate(date: Date | null): string {
  if (!date) return "";
  return new Intl.DateTimeFormat("pt-BR", { day: "2-digit", month: "short", year: "numeric" }).format(date);
}

export function RadarList({ items, emptyLabel }: { items: RadarItem[]; emptyLabel: string }) {
  if (items.length === 0) {
    return (
      <div className="rounded-3xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900/60 p-10 text-center shadow-2xs space-y-3">
        <Search className="h-10 w-10 mx-auto text-slate-400" />
        <p className="text-sm font-semibold text-slate-700 dark:text-slate-300">{emptyLabel}</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {items.map((item) => (
        <a
          key={item.id}
          href={item.url}
          target="_blank"
          rel="noopener noreferrer"
          className="group block rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-5 sm:p-6 shadow-sm hover:border-blue-500/60 dark:hover:border-blue-500/60 hover:shadow-lg transition-all duration-200 space-y-3"
        >
          <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-3">
            <div className="min-w-0 space-y-1.5 flex-1">
              <div className="flex flex-wrap items-center gap-2 text-xs">
                <span className="inline-flex items-center gap-1 rounded-md bg-blue-500/10 text-blue-700 dark:text-blue-400 px-2.5 py-0.5 font-bold border border-blue-500/20">
                  <Building2 className="w-3.5 h-3.5" />
                  {item.source}
                </span>
                {item.publishedAt && (
                  <span className="inline-flex items-center gap-1 text-slate-400">
                    <Clock className="w-3.5 h-3.5 shrink-0" />
                    <span>{formatDate(item.publishedAt)}</span>
                  </span>
                )}
              </div>

              <h2 className="text-lg font-bold text-slate-900 dark:text-white group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors leading-snug">
                {item.title}
              </h2>
            </div>

            <span className="inline-flex items-center gap-1.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 px-3.5 py-1.5 text-xs font-semibold text-slate-700 dark:text-slate-200 group-hover:bg-blue-600 group-hover:text-white group-hover:border-blue-600 transition-colors shrink-0 self-start sm:self-center shadow-2xs">
              <span>Ver edital na fonte</span>
              <ExternalLink className="h-3.5 w-3.5" />
            </span>
          </div>

          {item.summary && (
            <p className="text-sm text-slate-600 dark:text-slate-300 line-clamp-2 leading-relaxed">
              {item.summary}
            </p>
          )}
        </a>
      ))}
    </div>
  );
}
