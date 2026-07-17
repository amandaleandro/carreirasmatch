import { NextResponse } from "next/server";
import { requireAdminApi } from "@/lib/admin";
import { syncAllExternalSources } from "@/lib/external-source-sync";

export const dynamic = "force-dynamic";
export const maxDuration = 120;

export async function POST() {
  const { session, response } = await requireAdminApi();
  if (!session) return response!;
  const result = await syncAllExternalSources();
  return NextResponse.json(result, { status: result.errors.length ? 207 : 200 });
}
