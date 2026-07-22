import { NextRequest, NextResponse } from "next/server";
import { requireAuth } from "@/lib/require-auth";
import { prisma } from "@/lib/prisma";

const VALID_STATUSES = new Set(["pending", "in_progress", "done"]);

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { session, response } = await requireAuth();
  if (!session) return response!;

  const { id } = await params;
  const body = await req.json();
  const status = body.status;

  if (typeof status !== "string" || !VALID_STATUSES.has(status)) {
    return NextResponse.json({ error: "Status inválido." }, { status: 400 });
  }

  const suggestion = await prisma.profileSuggestion.findUnique({ where: { id } });
  if (!suggestion || suggestion.userId !== session.user.id) {
    return NextResponse.json({ error: "Sugestão não encontrada." }, { status: 404 });
  }

  const updated = await prisma.profileSuggestion.update({
    where: { id },
    data: { status },
  });

  return NextResponse.json({ status: updated.status });
}
