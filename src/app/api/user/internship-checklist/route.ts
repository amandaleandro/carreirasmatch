import { NextRequest, NextResponse } from "next/server";
import { requireAuth } from "@/lib/require-auth";
import { prisma } from "@/lib/prisma";

export async function PATCH(req: NextRequest) {
  const { session, response } = await requireAuth();
  if (!session) return response!;

  const body = await req.json();
  const checked: string[] = Array.isArray(body.checked) ? body.checked : [];

  const updated = await prisma.user.update({
    where: { id: session.user.id },
    data: { internshipChecklistProgress: JSON.stringify(checked) },
  });

  return NextResponse.json({ internshipChecklistProgress: updated.internshipChecklistProgress });
}
