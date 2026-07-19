import { NextRequest, NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { prisma } from "@/lib/prisma";
import { isCareerSegment } from "@/lib/career-segments";
import { checkRateLimit, getClientIp } from "@/lib/rate-limit";
import { sendWelcomeEmail, notifyAdminNewSignup } from "@/lib/resend";
import { validateContact } from "@/lib/contact-validation";
import { normalizeCouponCode } from "@/lib/coupons";

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

    const { name, email, phone, password, careerSegment, professionalArea, coupon } = await req.json();
    const contact = validateContact({ name, email, phone });
    const { name: normalizedName, email: normalizedEmail, phone: normalizedPhone } = contact.data;

    if (!contact.success) {
      return NextResponse.json({ error: contact.errors[0], errors: contact.errors }, { status: 400 });
    }

    if (typeof password !== "string" || password.length < 8) {
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

    // Cupom de indicação (link ou campo manual): grava só se for um cupom válido e
    // ativo, para o influenciador dono rastrear o cadastro. Cupom inválido é
    // silenciosamente ignorado, nunca bloqueia o cadastro.
    let signupCouponId: string | null = null;
    if (typeof coupon === "string" && coupon.trim()) {
      const matched = await prisma.coupon.findUnique({
        where: { code: normalizeCouponCode(coupon) },
        select: { id: true, active: true },
      });
      if (matched?.active) signupCouponId = matched.id;
    }

    const data = {
      name: normalizedName,
      phone: normalizedPhone,
      passwordHash,
      careerSegment,
      professionalArea: typeof professionalArea === "string" && professionalArea.trim()
        ? professionalArea.trim()
        : null,
      // Só define a atribuição de cadastro quando há cupom válido; não sobrescreve
      // uma atribuição anterior com null (caso de conta pré-existente sem senha).
      ...(signupCouponId ? { signupCouponId } : {}),
    };

    if (existing) {
      await prisma.user.update({ where: { id: existing.id }, data });
    } else {
      await prisma.user.create({ data: { ...data, email: normalizedEmail } });
      // Fire-and-forget: nunca bloqueia o cadastro se o e-mail falhar.
      void sendWelcomeEmail(normalizedEmail, data.name);
      void notifyAdminNewSignup({
        name: normalizedName,
        email: normalizedEmail,
        phone: normalizedPhone,
        segment: careerSegment,
      });
    }

    await prisma.lead.create({
      data: { name: normalizedName, email: normalizedEmail, phone: normalizedPhone, source: "registration" },
    });

    return NextResponse.json({ ok: true });
  } catch (error) {
    console.error("Erro ao cadastrar usuário:", error);
    return NextResponse.json(
      { error: "Erro ao processar o cadastro. Tente novamente." },
      { status: 500 }
    );
  }
}
