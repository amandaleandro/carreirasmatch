import { NextResponse } from "next/server";
import { z } from "zod";
import { requireAdminApi } from "@/lib/admin";
import { prisma } from "@/lib/prisma";

const updateSchema = z.object({
  active: z.boolean().optional(),
  name: z.string().trim().min(2).max(120).optional(),
  city: z.string().trim().max(120).optional(),
  state: z.string().trim().toUpperCase().regex(/^[A-Z]{2}$/).or(z.literal("")).optional(),
});

export async function PATCH(request: Request, context: { params: Promise<{ id: string }> }) {
  const { session, response } = await requireAdminApi();
  if (!session) return response!;
  const { id } = await context.params;
  const parsed = updateSchema.safeParse(await request.json());
  if (!parsed.success) return NextResponse.json({ error: "Alteração inválida." }, { status: 400 });
  const source = await prisma.opportunitySource.update({ where: { id }, data: parsed.data });
  return NextResponse.json({ source });
}

export async function DELETE(_: Request, context: { params: Promise<{ id: string }> }) {
  const { session, response } = await requireAdminApi();
  if (!session) return response!;
  const { id } = await context.params;
  await prisma.opportunitySource.delete({ where: { id } });
  return new NextResponse(null, { status: 204 });
}
