import { NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";

const pageViewSchema = z.object({
  sessionId: z.string().uuid(),
  path: z.string().startsWith("/").max(500),
  referrer: z.string().max(2000).optional().default(""),
  source: z.string().max(120).optional().default(""),
  medium: z.string().max(120).optional().default(""),
  campaign: z.string().max(200).optional().default(""),
  content: z.string().max(200).optional().default(""),
  term: z.string().max(200).optional().default(""),
});

function referrerHost(value: string) {
  if (!value) return "";
  try {
    return new URL(value).hostname.slice(0, 253);
  } catch {
    return "";
  }
}

export async function POST(request: Request) {
  const userAgent = request.headers.get("user-agent") ?? "";
  if (/bot|crawler|spider|slurp|headless/i.test(userAgent)) {
    return new NextResponse(null, { status: 204 });
  }
  let payload: unknown;
  try {
    payload = await request.json();
  } catch {
    return NextResponse.json({ error: "invalid_json" }, { status: 400 });
  }

  const parsed = pageViewSchema.safeParse(payload);
  if (!parsed.success) {
    return NextResponse.json({ error: "invalid_page_view" }, { status: 400 });
  }

  const { referrer, ...data } = parsed.data;
  await prisma.pageView.create({ data: { ...data, referrerHost: referrerHost(referrer) } });
  return new NextResponse(null, { status: 204 });
}
