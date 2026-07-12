import { NextRequest, NextResponse } from "next/server";
import crypto from "crypto";
import { prisma } from "@/lib/prisma";
import { isValidEmail, normalizeEmail } from "@/lib/email";
import { checkRateLimit, getClientIp } from "@/lib/rate-limit";
import { sendPasswordResetEmail } from "@/lib/resend";

const FORGOT_PASSWORD_LIMIT = { limit: 5, windowMs: 15 * 60 * 1000 };
const TOKEN_TTL_MS = 60 * 60 * 1000;

function genericResponse() {
  return NextResponse.json({
    ok: true,
    message: "Se existir uma conta com este e-mail, enviamos um link para redefinir a senha.",
  });
}

export async function POST(req: NextRequest) {
  try {
    const rateLimit = checkRateLimit(
      `forgot-password:${getClientIp(req)}`,
      FORGOT_PASSWORD_LIMIT
    );
    if (!rateLimit.allowed) {
      return NextResponse.json(
        { error: "Muitas tentativas. Aguarde um momento e tente novamente." },
        { status: 429, headers: { "Retry-After": String(rateLimit.retryAfterSeconds) } }
      );
    }

    const { email } = await req.json();
    const normalizedEmail = normalizeEmail(email);
    if (!isValidEmail(normalizedEmail)) {
      return NextResponse.json({ error: "Informe um e-mail válido." }, { status: 400 });
    }

    const user = await prisma.user.findUnique({
      where: { email: normalizedEmail },
      select: { id: true, passwordHash: true },
    });

    if (user?.passwordHash) {
      const token = crypto.randomBytes(32).toString("hex");
      await prisma.passwordResetToken.create({
        data: {
          userId: user.id,
          token,
          expires: new Date(Date.now() + TOKEN_TTL_MS),
        },
      });

      const appUrl = process.env.APP_URL ?? req.nextUrl.origin;
      const resetUrl = `${appUrl}/redefinir-senha?token=${token}`;

      await sendPasswordResetEmail(normalizedEmail, resetUrl);
    }

    return genericResponse();
  } catch (error) {
    console.error("Erro ao processar pedido de redefinição de senha:", error);
    return NextResponse.json(
      { error: "Erro ao processar o pedido. Tente novamente." },
      { status: 500 }
    );
  }
}
