import { NextResponse } from "next/server";
import { z } from "zod";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";

const schema = z.object({
  reason: z.enum(["closed", "broken_link", "suspicious", "incorrect"]),
  details: z.string().trim().max(500).optional().default(""),
});

export async function POST(request: Request, context: { params: Promise<{ id: string }> }) {
  const session = await auth();
  const { id } = await context.params;
  const parsed = schema.safeParse(await request.json());
  if (!parsed.success) return NextResponse.json({ error: "Denúncia inválida." }, { status: 400 });
  await prisma.opportunityReport.create({
    data: { opportunityId: id, userId: session?.user?.id ?? null, ...parsed.data },
  });
  return NextResponse.json({ ok: true }, { status: 201 });
}
