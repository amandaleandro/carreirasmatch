import { NextResponse } from "next/server";
import { z } from "zod";
import { requireAdminApi } from "@/lib/admin";
import { prisma } from "@/lib/prisma";
import { assertPublicHttpUrl } from "@/lib/url-safety";

const sourceSchema = z.object({
  name: z.string().trim().min(2).max(120),
  url: z.string().url().max(2000),
  kind: z.enum(["job", "course"]).default("job"),
  parser: z.enum(["links"]).default("links"),
  state: z.string().trim().toUpperCase().regex(/^[A-Z]{2}$/).or(z.literal("")).default(""),
  city: z.string().trim().max(120).default(""),
  official: z.boolean().default(true),
});

export async function GET() {
  const { session, response } = await requireAdminApi();
  if (!session) return response!;
  const sources = await prisma.opportunitySource.findMany({ orderBy: [{ active: "desc" }, { name: "asc" }] });
  return NextResponse.json({ sources });
}

export async function POST(request: Request) {
  const { session, response } = await requireAdminApi();
  if (!session) return response!;
  const parsed = sourceSchema.safeParse(await request.json());
  if (!parsed.success) return NextResponse.json({ error: "Dados da fonte inválidos." }, { status: 400 });
  await assertPublicHttpUrl(parsed.data.url);
  const source = await prisma.opportunitySource.create({ data: parsed.data });
  return NextResponse.json({ source }, { status: 201 });
}
