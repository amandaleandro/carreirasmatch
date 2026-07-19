import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { checkRateLimit, getClientIp } from "@/lib/rate-limit";
import { validateContact } from "@/lib/contact-validation";

const LEAD_LIMIT = { limit: 20, windowMs: 60 * 60 * 1000 };
const VALID_SOURCES = ["vocation_test", "resume_analysis"] as const;
type LeadSource = (typeof VALID_SOURCES)[number];

export async function POST(req: NextRequest) {
  const rateLimit = checkRateLimit(`lead:${getClientIp(req)}`, LEAD_LIMIT);
  if (!rateLimit.allowed) {
    return NextResponse.json(
      { error: "Muitas tentativas. Tente novamente em alguns minutos." },
      { status: 429, headers: { "Retry-After": String(rateLimit.retryAfterSeconds) } }
    );
  }

  const body = await req.json().catch(() => null);
  const contact = validateContact({ name: body?.name, email: body?.email, phone: body?.phone });
  const { name, email, phone } = contact.data;
  const source = body?.source as LeadSource | undefined;
  const analysisId = typeof body?.analysisId === "string" ? body.analysisId : null;
  const vocationTestResultId =
    typeof body?.vocationTestResultId === "string" ? body.vocationTestResultId : null;
  const attribution = body?.attribution;
  const tracking = {
    sessionId: typeof attribution?.sessionId === "string" ? attribution.sessionId.slice(0, 100) : "",
    attributionSource: typeof attribution?.source === "string" ? attribution.source.slice(0, 120) : "",
    medium: typeof attribution?.medium === "string" ? attribution.medium.slice(0, 120) : "",
    campaign: typeof attribution?.campaign === "string" ? attribution.campaign.slice(0, 200) : "",
    content: typeof attribution?.content === "string" ? attribution.content.slice(0, 200) : "",
  };

  if (!source || !VALID_SOURCES.includes(source)) {
    return NextResponse.json(
      { error: "Preencha nome, email e telefone." },
      { status: 400 }
    );
  }

  if (!contact.success) {
    return NextResponse.json({ error: contact.errors[0], errors: contact.errors }, { status: 400 });
  }

  const lead = await prisma.lead.create({
    data: { name, email, phone, source, ...tracking },
  });

  if (analysisId) {
    await prisma.analysis.update({
      where: { id: analysisId },
      data: { leadId: lead.id },
    }).catch(() => {
      // Analysis may not exist / not applicable; lead capture itself already succeeded.
    });
  }

  if (vocationTestResultId) {
    await prisma.vocationTestResult.update({
      where: { id: vocationTestResultId },
      data: { leadId: lead.id },
    }).catch(() => {
      // Result may not exist / not applicable; lead capture itself already succeeded.
    });
  }

  return NextResponse.json({ id: lead.id });
}
