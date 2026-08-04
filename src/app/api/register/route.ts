import { NextRequest, NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { prisma } from "@/lib/prisma";
import { isCareerSegment } from "@/lib/career-segments";
import { checkRateLimit, getClientIp } from "@/lib/rate-limit";
import { sendWelcomeEmail, notifyAdminNewSignup } from "@/lib/resend";
import { notifyAdminNewSignupWhatsapp } from "@/lib/evolution";
import { normalizePersonName, isValidFullName, normalizeBrazilPhone, isValidBrazilPhone } from "@/lib/contact-validation";
import { normalizeEmail, isValidEmail } from "@/lib/email";
import { normalizeCouponCode } from "@/lib/coupons";
import { claimLeadResumesForUser } from "@/lib/leads";

const REGISTER_LIMIT = { limit: 10, windowMs: 15 * 60 * 1000 };

/** Cria/atualiza a matrícula universitária do usuário a partir do curso escolhido no
 * cadastro (segmento "estágio"), pra /universidade já nascer preenchida em vez de
 * ficar órfã até o usuário preencher de novo lá. Curso fora do catálogo (sem
 * universityCourseId) ainda grava institution/courseName em texto livre. */
async function upsertUniversityEnrollmentFromSignup(
  userId: string,
  studyCourse: unknown,
  universityCourseId: unknown,
  universityName: unknown
) {
  if (typeof studyCourse !== "string" || !studyCourse.trim()) return;

  const linkedCourseId = typeof universityCourseId === "string" && universityCourseId.trim() ? universityCourseId.trim() : null;
  if (linkedCourseId) {
    const linkedCourse = await prisma.universityCourse.findUnique({ where: { id: linkedCourseId }, select: { id: true, active: true } });
    if (!linkedCourse?.active) return;
  }

  await prisma.universityEnrollment.upsert({
    where: { userId },
    create: {
      userId,
      institution: typeof universityName === "string" ? universityName.trim() : "",
      courseName: studyCourse.trim(),
      universityCourseId: linkedCourseId,
    },
    update: {
      ...(linkedCourseId ? { institution: typeof universityName === "string" ? universityName.trim() : "", universityCourseId: linkedCourseId } : {}),
      courseName: studyCourse.trim(),
    },
  });
}

export async function POST(req: NextRequest) {
  try {
    const rateLimit = checkRateLimit(`register:${getClientIp(req)}`, REGISTER_LIMIT);
    if (!rateLimit.allowed) {
      return NextResponse.json(
        { error: "Muitas tentativas de cadastro. Aguarde um momento e tente novamente." },
        { status: 429, headers: { "Retry-After": String(rateLimit.retryAfterSeconds) } }
      );
    }

    const {
      name,
      email,
      phone,
      password,
      careerSegment,
      professionalArea,
      currentProfessionalArea,
      targetProfessionalArea,
      studyCourse,
      universityCourseId,
      universityName,
      coupon,
      whatsappOptIn,
    } = await req.json();
    const normalizedName = normalizePersonName(name);
    const normalizedEmail = normalizeEmail(email);
    const normalizedPhone = normalizeBrazilPhone(phone);
    const whatsappMarketingOptIn = Boolean(normalizedPhone) && whatsappOptIn === true;

    if (!isValidFullName(normalizedName)) {
      return NextResponse.json({ error: "Informe seu nome e sobrenome completos." }, { status: 400 });
    }

    if (!isValidEmail(normalizedEmail)) {
      return NextResponse.json({ error: "Informe um e-mail válido." }, { status: 400 });
    }

    if (normalizedPhone && !isValidBrazilPhone(normalizedPhone)) {
      return NextResponse.json({ error: "Informe um telefone válido com DDD." }, { status: 400 });
    }

    if (typeof password !== "string" || password.length < 8) {
      return NextResponse.json(
        { error: "Informe um e-mail válido e uma senha com pelo menos 8 caracteres." },
        { status: 400 }
      );
    }

    const existing = await prisma.user.findUnique({
      where: { email: normalizedEmail },
      select: { id: true },
    });

    // Se a conta já existe, atualiza os dados e a nova senha informada
    if (existing) {
      const passwordHash = await bcrypt.hash(password, 10);
      await prisma.user.update({
        where: { id: existing.id },
        data: {
          name: normalizedName,
          passwordHash,
          ...(normalizedPhone ? { phone: normalizedPhone, whatsappMarketingOptIn } : {}),
          ...(typeof currentProfessionalArea === "string" ? { currentProfessionalArea: currentProfessionalArea.trim() || null } : {}),
          ...(typeof targetProfessionalArea === "string" ? { targetProfessionalArea: targetProfessionalArea.trim() || null } : {}),
          ...(typeof studyCourse === "string" ? { studyCourse: studyCourse.trim() || null } : {}),
        },
      });
      await upsertUniversityEnrollmentFromSignup(existing.id, studyCourse, universityCourseId, universityName);
      void claimLeadResumesForUser(normalizedEmail, existing.id);
      return NextResponse.json({ ok: true });
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

    const effectiveCareerSegment = (typeof careerSegment === "string" && isCareerSegment(careerSegment))
      ? careerSegment
      : "career_pro";

    const data = {
      name: normalizedName,
      phone: normalizedPhone,
      whatsappMarketingOptIn,
      passwordHash,
      careerSegment: effectiveCareerSegment,
      professionalArea: typeof professionalArea === "string" && professionalArea.trim()
        ? professionalArea.trim()
        : null,
      currentProfessionalArea: typeof currentProfessionalArea === "string" && currentProfessionalArea.trim()
        ? currentProfessionalArea.trim()
        : null,
      targetProfessionalArea: typeof targetProfessionalArea === "string" && targetProfessionalArea.trim()
        ? targetProfessionalArea.trim()
        : null,
      studyCourse: typeof studyCourse === "string" && studyCourse.trim() ? studyCourse.trim() : null,
      ...(signupCouponId ? { signupCouponId } : {}),
    };

    const createdUser = await prisma.user.create({ data: { ...data, email: normalizedEmail } });
    await upsertUniversityEnrollmentFromSignup(createdUser.id, studyCourse, universityCourseId, universityName);
    void claimLeadResumesForUser(normalizedEmail, createdUser.id);

    // Envio de e-mails e registro de lead sem bloquear a resposta principal
    void sendWelcomeEmail(normalizedEmail, data.name);
    void notifyAdminNewSignup({
      name: normalizedName,
      email: normalizedEmail,
      phone: normalizedPhone,
      segment: effectiveCareerSegment,
    });
    void notifyAdminNewSignupWhatsapp({
      name: normalizedName,
      email: normalizedEmail,
      phone: normalizedPhone,
      segment: effectiveCareerSegment,
    });

    try {
      await prisma.lead.create({
        data: { name: normalizedName, email: normalizedEmail, phone: normalizedPhone, source: "registration" },
      });
    } catch {
      // Ignora erro se lead duplicado
    }

    return NextResponse.json({ ok: true });
  } catch (error) {
    console.error("Erro ao cadastrar usuário:", error);
    return NextResponse.json(
      { error: "Erro ao processar o cadastro. Tente novamente." },
      { status: 500 }
    );
  }
}
