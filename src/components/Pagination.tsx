import Link from "next/link";

export function Pagination({
  page,
  totalPages,
  basePath,
  searchParams = {},
}: {
  page: number;
  totalPages: number;
  basePath: string;
  searchParams?: Record<string, string | undefined>;
}) {
  if (totalPages <= 1) return null;

  const buildHref = (targetPage: number) => {
    const params = new URLSearchParams();
    for (const [key, value] of Object.entries(searchParams)) {
      if (value) params.set(key, value);
    }
    params.set("page", String(targetPage));
    return `${basePath}?${params.toString()}`;
  };

  const prevPage = Math.max(1, page - 1);
  const nextPage = Math.min(totalPages, page + 1);

  return (
    <div className="flex items-center justify-center gap-2">
      <Link
        href={buildHref(prevPage)}
        aria-disabled={page === 1}
        className={`rounded-md border border-neutral-300 dark:border-neutral-700 px-3 py-2 text-sm font-medium transition-colors ${
          page === 1
            ? "pointer-events-none opacity-40"
            : "hover:bg-neutral-100 dark:hover:bg-neutral-800"
        }`}
      >
        Anterior
      </Link>
      <span className="text-sm text-neutral-600 dark:text-neutral-400 px-2">
        Página {page} de {totalPages}
      </span>
      <Link
        href={buildHref(nextPage)}
        aria-disabled={page === totalPages}
        className={`rounded-md border border-neutral-300 dark:border-neutral-700 px-3 py-2 text-sm font-medium transition-colors ${
          page === totalPages
            ? "pointer-events-none opacity-40"
            : "hover:bg-neutral-100 dark:hover:bg-neutral-800"
        }`}
      >
        Próxima
      </Link>
    </div>
  );
}
