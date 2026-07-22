import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { checkRateLimit, getClientIp } from "@/lib/rate-limit";

const INTEREST_LIMIT = { limit: 10, windowMs: 60 * 60 * 1000 };

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;

  const rateLimit = checkRateLimit(`course-interest:${getClientIp(req)}`, INTEREST_LIMIT);
  if (!rateLimit.allowed) {
    return NextResponse.json(
      { error: "Muitas solicitações. Tente novamente mais tarde." },
      { status: 429, headers: { "Retry-After": String(rateLimit.retryAfterSeconds) } },
    );
  }

  try {
    const body = await req.json();
    const name = typeof body.name === "string" ? body.name.trim() : "";
    const email = typeof body.email === "string" ? body.email.trim().toLowerCase() : "";
    const phone = typeof body.phone === "string" ? body.phone.trim() : "";

    if (!name || name.length > 120 || !email || email.length > 200 || phone.length > 30) {
      return NextResponse.json({ error: "Preencha o nome e o e-mail." }, { status: 400 });
    }

    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      return NextResponse.json({ error: "Informe um e-mail válido." }, { status: 400 });
    }

    const course = await prisma.externalCourse.findUnique({
      where: { id },
      select: { partnerId: true },
    });

    if (!course || !course.partnerId) {
      return NextResponse.json({ error: "Curso ou parceiro não encontrado." }, { status: 404 });
    }

    const lead = await prisma.partnerLead.create({
      data: {
        partnerId: course.partnerId,
        courseId: id,
        name,
        email,
        phone,
        status: "new",
      },
    });

    return NextResponse.json({ ok: true, id: lead.id });
  } catch (err) {
    console.error("Erro ao registrar interesse:", err);
    return NextResponse.json({ error: "Erro interno" }, { status: 500 });
  }
}
