import Link from "next/link";

export function Pagination({
  page,
  totalPages,
  searchParams,
}: {
  page: number;
  totalPages: number;
  searchParams: Record<string, string | undefined>;
}) {
  if (totalPages <= 1) return null;

  const prevPage = Math.max(1, page - 1);
  const nextPage = Math.min(totalPages, page + 1);

  function hrefFor(targetPage: number) {
    const params = new URLSearchParams();
    for (const [key, value] of Object.entries(searchParams)) {
      if (key !== "page" && value) params.set(key, value);
    }
    params.set("page", String(targetPage));
    return `/feed?${params.toString()}`;
  }

  return (
    <div className="flex items-center justify-center gap-2">
      <Link
        href={hrefFor(prevPage)}
        aria-disabled={page === 1}
        className={`rounded-xl border border-neutral-200 dark:border-neutral-800 px-3 py-2 text-sm font-medium transition-colors ${
          page === 1
            ? "pointer-events-none opacity-40"
            : "hover:bg-neutral-50 dark:hover:bg-neutral-800"
        }`}
      >
        Anterior
      </Link>
      <span className="text-sm text-neutral-600 dark:text-neutral-400 px-2">
        Página {page} de {totalPages}
      </span>
      <Link
        href={hrefFor(nextPage)}
        aria-disabled={page === totalPages}
        className={`rounded-xl border border-neutral-200 dark:border-neutral-800 px-3 py-2 text-sm font-medium transition-colors ${
          page === totalPages
            ? "pointer-events-none opacity-40"
            : "hover:bg-neutral-50 dark:hover:bg-neutral-800"
        }`}
      >
        Próxima
      </Link>
    </div>
  );
}
