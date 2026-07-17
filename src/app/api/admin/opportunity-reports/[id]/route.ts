import { NextResponse } from "next/server";
import { z } from "zod";
import { requireAdminApi } from "@/lib/admin";
import { prisma } from "@/lib/prisma";

const schema = z.object({
  status: z.enum(["resolved", "dismissed"]),
  deactivate: z.boolean().default(false),
});

export async function PATCH(request: Request, context: { params: Promise<{ id: string }> }) {
  const { session, response } = await requireAdminApi();
  if (!session) return response!;
  const { id } = await context.params;
  const parsed = schema.safeParse(await request.json());
  if (!parsed.success) return NextResponse.json({ error: "Ação inválida." }, { status: 400 });
  const report = await prisma.opportunityReport.update({ where: { id }, data: { status: parsed.data.status } });
  if (parsed.data.deactivate) {
    await prisma.publicOpportunity.update({ where: { id: report.opportunityId }, data: { active: false } });
  }
  return NextResponse.json({ ok: true });
}
