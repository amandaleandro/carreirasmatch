import { NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { checkRateLimit, getClientIp } from "@/lib/rate-limit";

const SUBMISSION_LIMIT = { limit: 5, windowMs: 60 * 60 * 1000 };

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
  const rateLimit = checkRateLimit(`partner-submission:${getClientIp(request)}`, SUBMISSION_LIMIT);
  if (!rateLimit.allowed) {
    return NextResponse.json(
      { error: "Muitas solicitações. Tente novamente mais tarde." },
      { status: 429, headers: { "Retry-After": String(rateLimit.retryAfterSeconds) } },
    );
  }

  const body = await request.json().catch(() => null);
  const parsed = schema.safeParse(body);
  if (!parsed.success) return NextResponse.json({ error: "Revise os dados enviados." }, { status: 400 });
  await prisma.partnerSubmission.create({ data: parsed.data });
  return NextResponse.json({ ok: true }, { status: 201 });
}
