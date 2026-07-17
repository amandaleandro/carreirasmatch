import { NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";

const schema = z.object({
  organization: z.string().trim().min(2).max(160),
  organizationType: z.enum(["company", "city_hall", "school", "course", "influencer", "other"]),
  contactName: z.string().trim().min(2).max(120),
  email: z.string().email().max(200),
  phone: z.string().trim().max(30).default(""),
  title: z.string().trim().min(3).max(200),
  description: z.string().trim().min(20).max(5000),
  url: z.string().url().max(2000).or(z.literal("")).default(""),
  state: z.string().trim().toUpperCase().regex(/^[A-Z]{2}$/).or(z.literal("")).default(""),
  city: z.string().trim().max(120).default(""),
});

export async function POST(request: Request) {
  const parsed = schema.safeParse(await request.json());
  if (!parsed.success) return NextResponse.json({ error: "Revise os dados enviados." }, { status: 400 });
  await prisma.partnerSubmission.create({ data: parsed.data });
  return NextResponse.json({ ok: true }, { status: 201 });
}
