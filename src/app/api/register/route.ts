import { NextRequest, NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { prisma } from "@/lib/prisma";
import { isCareerSegment } from "@/lib/career-segments";
import { checkRateLimit, getClientIp } from "@/lib/rate-limit";
import { isValidEmail, normalizeEmail } from "@/lib/email";
import { sendWelcomeEmail } from "@/lib/resend";

const REGISTER_LIMIT = { limit: 10, windowMs: 15 * 60 * 1000 };

export async function POST(req: NextRequest) {
  try {
    const rateLimit = checkRateLimit(`register:${getClientIp(req)}`, REGISTER_LIMIT);
    if (!rateLimit.allowed) {
      return NextResponse.json(
        { error: "Muitas tentativas de cadastro. Aguarde um momento e tente novamente." },
        { status: 429, headers: { "Retry-After": String(rateLimit.retryAfterSeconds) } }
      );
    }

    const { name, email, password, careerSegment, professionalArea } = await req.json();
    const normalizedEmail = normalizeEmail(email);

    if (!isValidEmail(normalizedEmail) || !password || password.length < 8) {
      return NextResponse.json(
        { error: "Informe um e-mail válido e uma senha com pelo menos 8 caracteres." },
        { status: 400 }
      );
    }

    if (typeof careerSegment !== "string" || !isCareerSegment(careerSegment)) {
      return NextResponse.json(
        { error: "Selecione qual é o seu momento de carreira." },
        { status: 400 }
      );
    }

    const existing = await prisma.user.findUnique({
      where: { email: normalizedEmail },
      select: { id: true, passwordHash: true },
    });
    if (existing?.passwordHash) {
      return NextResponse.json(
        { error: "Já existe uma conta com este e-mail." },
        { status: 409 }
      );
    }

    const passwordHash = await bcrypt.hash(password, 10);

    const data = {
      name: name ?? null,
      passwordHash,
      careerSegment,
      professionalArea: typeof professionalArea === "string" && professionalArea.trim()
        ? professionalArea.trim()
        : null,
    };

    if (existing) {
      await prisma.user.update({ where: { id: existing.id }, data });
    } else {
      await prisma.user.create({ data: { ...data, email: normalizedEmail } });
      // Fire-and-forget: nunca bloqueia o cadastro se o e-mail falhar.
      void sendWelcomeEmail(normalizedEmail, data.name);
    }

    return NextResponse.json({ ok: true });
  } catch (error) {
    console.error("Erro ao cadastrar usuário:", error);
    // TEMP DIAGNÓSTICO: remover após identificar a causa do 500 em produção.
    if (req.nextUrl.searchParams.has("diag")) {
      return NextResponse.json(
        {
          error: "Erro ao processar o cadastro. Tente novamente.",
          diag: error instanceof Error ? error.message : String(error),
          stack: error instanceof Error ? error.stack?.split("\n").slice(0, 4) : undefined,
        },
        { status: 500 }
      );
    }
    return NextResponse.json(
      { error: "Erro ao processar o cadastro. Tente novamente." },
      { status: 500 }
    );
  }
}
