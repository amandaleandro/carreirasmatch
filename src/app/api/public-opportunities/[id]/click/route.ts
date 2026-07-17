import { NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";

const schema = z.object({
  sessionId: z.string().max(100).optional().default(""),
  campaign: z.string().max(200).optional().default(""),
});

export async function POST(request: Request, context: { params: Promise<{ id: string }> }) {
  const { id } = await context.params;
  const parsed = schema.safeParse(await request.json().catch(() => ({})));
  if (!parsed.success) return NextResponse.json({ error: "Dados inválidos." }, { status: 400 });
  await prisma.opportunityClick.create({ data: { opportunityId: id, ...parsed.data } });
  return new NextResponse(null, { status: 204 });
}
