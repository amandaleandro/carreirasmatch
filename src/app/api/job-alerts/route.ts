import { NextResponse } from "next/server";
import { z } from "zod";
import { requireAuth } from "@/lib/require-auth";
import { prisma } from "@/lib/prisma";

const alertSchema = z.object({
  query: z.string().trim().max(120).default(""),
  city: z.string().trim().max(120).default(""),
  state: z.string().trim().toUpperCase().regex(/^[A-Z]{2}$/).or(z.literal("")).default(""),
  frequency: z.enum(["daily", "weekly"]).default("daily"),
});

export async function GET() {
  const { session, response } = await requireAuth();
  if (!session) return response!;
  const alerts = await prisma.jobAlert.findMany({ where: { userId: session.user.id }, orderBy: { createdAt: "desc" } });
  return NextResponse.json({ alerts });
}

export async function POST(request: Request) {
  const { session, response } = await requireAuth();
  if (!session) return response!;
  const parsed = alertSchema.safeParse(await request.json());
  if (!parsed.success || (!parsed.data.query && !parsed.data.city && !parsed.data.state)) {
    return NextResponse.json({ error: "Informe um cargo, cidade ou estado." }, { status: 400 });
  }
  const alert = await prisma.jobAlert.create({ data: { ...parsed.data, userId: session.user.id } });
  return NextResponse.json({ alert }, { status: 201 });
}
