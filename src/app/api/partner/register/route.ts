import { NextRequest, NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { prisma } from "@/lib/prisma";
import { checkRateLimit, getClientIp } from "@/lib/rate-limit";
import { isValidEmail, normalizeEmail } from "@/lib/email";

const REGISTER_LIMIT = { limit: 10, windowMs: 15 * 60 * 1000 };

export async function POST(req: NextRequest) {
  try {
    const rateLimit = checkRateLimit(`partner-register:${getClientIp(req)}`, REGISTER_LIMIT);
    if (!rateLimit.allowed) {
      return NextResponse.json(
        { error: "Muitas tentativas de cadastro. Aguarde um momento e tente novamente." },
        { status: 429, headers: { "Retry-After": String(rateLimit.retryAfterSeconds) } }
      );
    }

    const body = await req.json();
    const name = typeof body.name === "string" ? body.name.trim() : "";
    const email = normalizeEmail(body.email);
    const password = body.password;
    const cnpj = typeof body.cnpj === "string" ? body.cnpj.trim() : "";
    const website = typeof body.website === "string" ? body.website.trim() : "";

    if (name.length < 2 || name.length > 120) {
      return NextResponse.json({ error: "Informe o nome da instituição ou parceiro." }, { status: 400 });
    }
    if (!isValidEmail(email)) {
      return NextResponse.json({ error: "Informe um e-mail válido." }, { status: 400 });
    }
    if (typeof password !== "string" || password.length < 8) {
      return NextResponse.json({ error: "A senha precisa ter pelo menos 8 caracteres." }, { status: 400 });
    }

    const existingPartner = await prisma.partner.findUnique({ where: { email }, select: { id: true } });
    if (existingPartner) {
      return NextResponse.json({ error: "Já existe um parceiro cadastrado com este e-mail." }, { status: 409 });
    }

    const passwordHash = await bcrypt.hash(password, 10);
    await prisma.partner.create({
      data: {
        name,
        email,
        passwordHash,
        cnpj,
        website,
        status: "active",
        credits: 0,
      },
    });

    return NextResponse.json({ ok: true });
  } catch (error) {
    console.error("Erro ao cadastrar parceiro:", error);
    return NextResponse.json({ error: "Erro ao processar o cadastro. Tente novamente." }, { status: 500 });
  }
}
