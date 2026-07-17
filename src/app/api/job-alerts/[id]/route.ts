import { NextResponse } from "next/server";
import { requireAuth } from "@/lib/require-auth";
import { prisma } from "@/lib/prisma";

export async function DELETE(_: Request, context: { params: Promise<{ id: string }> }) {
  const { session, response } = await requireAuth();
  if (!session) return response!;
  const { id } = await context.params;
  await prisma.jobAlert.deleteMany({ where: { id, userId: session.user.id } });
  return new NextResponse(null, { status: 204 });
}
