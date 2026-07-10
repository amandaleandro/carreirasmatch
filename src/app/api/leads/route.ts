import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { checkRateLimit, getClientIp } from "@/lib/rate-limit";

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
  const name = typeof body?.name === "string" ? body.name.trim() : "";
  const email = typeof body?.email === "string" ? body.email.trim().toLowerCase() : "";
  const phone = typeof body?.phone === "string" ? body.phone.trim() : "";
  const source = body?.source as LeadSource | undefined;
  const analysisId = typeof body?.analysisId === "string" ? body.analysisId : null;
  const vocationTestResultId =
    typeof body?.vocationTestResultId === "string" ? body.vocationTestResultId : null;

  if (!name || !email || !phone || !source || !VALID_SOURCES.includes(source)) {
    return NextResponse.json(
      { error: "Preencha nome, email e telefone." },
      { status: 400 }
    );
  }

  if (!/^\S+@\S+\.\S+$/.test(email)) {
    return NextResponse.json({ error: "Informe um email válido." }, { status: 400 });
  }

  const lead = await prisma.lead.create({
    data: { name, email, phone, source },
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
