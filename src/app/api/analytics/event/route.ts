import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";
import { z } from "zod";
import { checkRateLimit, getClientIp } from "@/lib/rate-limit";

const allowedNames = [
  "analysis_started", "analysis_completed", "diagnostic_teaser_viewed",
  "unlock_clicked", "checkout_started", "checkout_failed", "payment_confirmed",
  "subscription_started", "subscription_confirmed", "signup_completed",
  "lead_captured", "tool_used", "pix_generated",
  "result_viewed", "card_shared", "resume_saved", "application_created",
  "interview_reported", "job_reported", "internship_reported", "promotion_reported",
] as const;

const schema = z.object({
  name: z.enum(allowedNames),
  sessionId: z.string().max(100).optional().default(""),
  source: z.string().max(120).optional().default(""),
  medium: z.string().max(120).optional().default(""),
  campaign: z.string().max(200).optional().default(""),
  content: z.string().max(200).optional().default(""),
  path: z.string().max(500).optional().default(""),
  properties: z.record(
    z.string().max(80),
    z.union([z.string().max(500), z.number(), z.boolean()])
  ).optional().default({}),
});

export async function POST(request: Request) {
  const rateLimit = checkRateLimit(`funnel-event:${getClientIp(request)}`, {
    limit: 240,
    windowMs: 60 * 60 * 1000,
  });
  if (!rateLimit.allowed) {
    return NextResponse.json({ error: "rate_limited" }, { status: 429 });
  }
  const parsed = schema.safeParse(await request.json().catch(() => null));
  if (!parsed.success) return NextResponse.json({ error: "invalid_event" }, { status: 400 });
  const session = await auth();
  const { properties, ...data } = parsed.data;
  const analysisId = typeof properties.analysisId === "string" ? properties.analysisId : null;
  const segment =
    typeof properties.segment === "string"
      ? properties.segment
      : typeof properties.careerTrack === "string"
        ? properties.careerTrack
        : "";
  await prisma.funnelEvent.create({
    data: {
      ...data,
      userId: session?.user?.id ?? null,
      analysisId,
      segment,
      properties: JSON.stringify(properties),
    },
  });
  return new NextResponse(null, { status: 204 });
}
