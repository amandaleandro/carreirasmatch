import { TOOLS_CATALOG } from "@/lib/tools-catalog";
import { normalizeCareerSegment, type CareerSegment } from "@/lib/career-segments";

export function hasToolAccess(
  segment: string | CareerSegment | null | undefined,
  href: string
): boolean {
  const tool = TOOLS_CATALOG.find((t) => t.href === href);
  if (!tool) return true;
  const normalizedSegment = normalizeCareerSegment(segment);
  if (!normalizedSegment) return false;
  return tool.segments.includes(normalizedSegment);
}
