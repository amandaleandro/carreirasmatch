import { PaginationControls } from "@/components/pagination-controls";

export function Pagination({
  page,
  totalPages,
  searchParams,
}: {
  page: number;
  totalPages: number;
  searchParams: Record<string, string | undefined>;
}) {
  return <PaginationControls page={page} totalPages={totalPages} searchParams={searchParams} />;
}
