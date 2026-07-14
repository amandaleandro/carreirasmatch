import { NextResponse } from "next/server";
import { requireAdminApi } from "@/lib/admin";
import { backfillJobTags } from "@/lib/backfill-job-tags";

export const dynamic = "force-dynamic";

export async function GET() {
  const { session, response } = await requireAdminApi();
  if (!session) return response!;

  const result = await backfillJobTags();
  return NextResponse.json({ ok: true, ...result });
}
