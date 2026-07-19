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
      <div className="rounded-2xl border border-neutral-200/80 dark:border-neutral-800 bg-white dark:bg-neutral-950 p-6 text-center">
        <p className="text-sm text-neutral-600 dark:text-neutral-400">{emptyLabel}</p>
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
          className="block rounded-2xl border border-neutral-200/80 dark:border-neutral-800 bg-white dark:bg-neutral-950 p-5 shadow-sm shadow-slate-900/5 hover:border-blue-300 hover:shadow-md transition-all"
        >
          <div className="flex items-center gap-2 text-xs text-neutral-500">
            <span className="font-semibold text-blue-600 dark:text-blue-400">{item.source}</span>
            {item.publishedAt && (
              <>
                <span aria-hidden="true">·</span>
                <span>{formatDate(item.publishedAt)}</span>
              </>
            )}
          </div>
          <h2 className="mt-1.5 font-bold leading-snug">{item.title}</h2>
          {item.summary && (
            <p className="mt-2 text-sm text-neutral-600 dark:text-neutral-400 line-clamp-2">{item.summary}</p>
          )}
          <span className="mt-3 inline-flex items-center gap-1 text-sm font-medium text-blue-600 dark:text-blue-400">
            Ver na fonte
            <svg viewBox="0 0 24 24" fill="none" className="h-3.5 w-3.5">
              <path d="M7 17 17 7M9 7h8v8" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </span>
        </a>
      ))}
    </div>
  );
}
