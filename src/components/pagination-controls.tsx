"use client";

import Link from "next/link";
import { ChevronLeft, ChevronRight } from "lucide-react";
import type { ReactNode } from "react";

type Props = {
  page: number;
  totalPages: number;
  totalItems?: number;
  pageSize?: number;
  basePath?: string;
  searchParams?: Record<string, string | undefined>;
  onPageChange?: (page: number) => void;
};

function pageNumbers(page: number, totalPages: number): (number | "ellipsis")[] {
  if (totalPages <= 7) return Array.from({ length: totalPages }, (_, index) => index + 1);
  const values: (number | "ellipsis")[] = [1];
  if (page > 3) values.push("ellipsis");
  for (let value = Math.max(2, page - 1); value <= Math.min(totalPages - 1, page + 1); value += 1) values.push(value);
  if (page < totalPages - 2) values.push("ellipsis");
  values.push(totalPages);
  return values;
}

export function PaginationControls({
  page,
  totalPages,
  totalItems,
  pageSize,
  basePath = "/feed",
  searchParams = {},
  onPageChange,
}: Props) {
  if (totalPages <= 1) return null;

  const isInteractive = Boolean(onPageChange);
  const safePage = Math.min(Math.max(page, 1), totalPages);
  const start = totalItems && pageSize ? (safePage - 1) * pageSize + 1 : undefined;
  const end = totalItems && pageSize ? Math.min(safePage * pageSize, totalItems) : undefined;

  function hrefFor(targetPage: number) {
    const params = new URLSearchParams();
    Object.entries(searchParams).forEach(([key, value]) => {
      if (key !== "page" && value) params.set(key, value);
    });
    params.set("page", String(targetPage));
    return `${basePath}?${params.toString()}`;
  }

  function renderAction(targetPage: number, children: ReactNode, ariaLabel: string) {
    const disabled = targetPage < 1 || targetPage > totalPages;
    const className = "inline-flex h-9 items-center gap-1.5 rounded-xl border border-neutral-200 bg-white px-3 text-xs font-semibold text-neutral-700 transition-colors hover:border-blue-300 hover:bg-blue-50 dark:border-neutral-800 dark:bg-neutral-950 dark:text-neutral-300 dark:hover:border-blue-800 dark:hover:bg-blue-950/30 disabled:pointer-events-none disabled:opacity-40";
    if (isInteractive) {
      return <button type="button" aria-label={ariaLabel} disabled={disabled} onClick={() => onPageChange?.(targetPage)} className={className}>{children}</button>;
    }
    return <Link aria-label={ariaLabel} aria-disabled={disabled} className={`${className} ${disabled ? "pointer-events-none opacity-40" : ""}`} href={hrefFor(targetPage)}>{children}</Link>;
  }

  return (
    <nav aria-label="Paginação" className="flex flex-col gap-3 border-t border-neutral-200/80 pt-4 dark:border-neutral-800 sm:flex-row sm:items-center sm:justify-between">
      <p className="text-xs text-neutral-500 dark:text-neutral-400">
        {start && end && totalItems ? <>Exibindo <strong className="text-neutral-800 dark:text-neutral-200">{start}-{end}</strong> de <strong className="text-neutral-800 dark:text-neutral-200">{totalItems}</strong></> : <>Página <strong className="text-neutral-800 dark:text-neutral-200">{safePage}</strong> de <strong className="text-neutral-800 dark:text-neutral-200">{totalPages}</strong></>}
      </p>
      <div className="flex items-center justify-center gap-1.5 sm:justify-end">
        {renderAction(safePage - 1, <><ChevronLeft className="h-4 w-4" /><span className="hidden sm:inline">Anterior</span></>, "Página anterior")}
        <div className="flex items-center gap-1">
          {pageNumbers(safePage, totalPages).map((value, index) => value === "ellipsis" ? <span key={`ellipsis-${index}`} className="px-1 text-xs text-neutral-400">…</span> : <span key={value}>{renderAction(value, <span className={`min-w-4 ${value === safePage ? "font-bold text-blue-600 dark:text-blue-400" : ""}`}>{value}</span>, `Ir para a página ${value}`)}</span>)}
        </div>
        {renderAction(safePage + 1, <><span className="hidden sm:inline">Próxima</span><ChevronRight className="h-4 w-4" /></>, "Próxima página")}
      </div>
    </nav>
  );
}
