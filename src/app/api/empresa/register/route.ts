import { NextRequest, NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { prisma } from "@/lib/prisma";
import { checkRateLimit, getClientIp } from "@/lib/rate-limit";
import { isValidEmail, normalizeEmail } from "@/lib/email";

const REGISTER_LIMIT = { limit: 10, windowMs: 15 * 60 * 1000 };

export async function POST(req: NextRequest) {
  try {
    const rateLimit = checkRateLimit(`company-register:${getClientIp(req)}`, REGISTER_LIMIT);
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
    const city = typeof body.city === "string" ? body.city.trim() : "";
    const state = typeof body.state === "string" ? body.state.trim().toUpperCase() : "";

    if (name.length < 2 || name.length > 120) {
      return NextResponse.json({ error: "Informe o nome da empresa." }, { status: 400 });
    }
    if (!isValidEmail(email)) {
      return NextResponse.json({ error: "Informe um e-mail válido." }, { status: 400 });
    }
    if (typeof password !== "string" || password.length < 8) {
      return NextResponse.json({ error: "A senha precisa ter pelo menos 8 caracteres." }, { status: 400 });
    }
    if (state && !/^[A-Z]{2}$/.test(state)) {
      return NextResponse.json({ error: "UF inválida." }, { status: 400 });
    }

    const existing = await prisma.company.findUnique({ where: { email }, select: { id: true } });
    if (existing) {
      return NextResponse.json({ error: "Já existe uma empresa com este e-mail." }, { status: 409 });
    }

    const passwordHash = await bcrypt.hash(password, 10);
    await prisma.company.create({
      data: { name, email, passwordHash, cnpj, city, state },
    });

    return NextResponse.json({ ok: true });
  } catch (error) {
    console.error("Erro ao cadastrar empresa:", error);
    return NextResponse.json({ error: "Erro ao processar o cadastro. Tente novamente." }, { status: 500 });
  }
}
