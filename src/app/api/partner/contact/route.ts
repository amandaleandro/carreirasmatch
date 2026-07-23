import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { checkRateLimit, getClientIp } from "@/lib/rate-limit";
import { isValidEmail, normalizeEmail } from "@/lib/email";

const CONTACT_LIMIT = { limit: 5, windowMs: 15 * 60 * 1000 };

const contactSchema = z.object({
  organization: z.string().trim().min(2, "Informe o nome da sua instituição ou empresa.").max(160),
  organizationType: z.string().trim().min(1).max(50).default("course"),
  contactName: z.string().trim().min(2, "Informe o nome do responsável.").max(120),
  email: z.string().trim().email("Informe um e-mail válido.").max(200),
  phone: z.string().trim().min(8, "Informe um telefone ou WhatsApp válido.").max(30),
  volume: z.string().trim().max(100).optional().default(""),
  message: z.string().trim().max(2000).optional().default(""),
});

export async function POST(req: NextRequest) {
  try {
    const rateLimit = checkRateLimit(`partner-contact:${getClientIp(req)}`, CONTACT_LIMIT);
    if (!rateLimit.allowed) {
      return NextResponse.json(
        { error: "Muitas solicitações enviadas. Aguarde alguns minutos e tente novamente." },
        { status: 429, headers: { "Retry-After": String(rateLimit.retryAfterSeconds) } }
      );
    }

    const body = await req.json().catch(() => null);
    const parsed = contactSchema.safeParse(body);
    if (!parsed.success) {
      const issue = parsed.error.issues[0]?.message ?? "Verifique os dados informados.";
      return NextResponse.json({ error: issue }, { status: 400 });
    }

    const email = normalizeEmail(parsed.data.email);
    if (!isValidEmail(email)) {
      return NextResponse.json({ error: "Informe um e-mail válido." }, { status: 400 });
    }

    const descriptionParts = [];
    if (parsed.data.volume) descriptionParts.push(`Volume: ${parsed.data.volume}`);
    if (parsed.data.message) descriptionParts.push(`Mensagem: ${parsed.data.message}`);
    const description = descriptionParts.join(" | ") || "Contato consultivo via landing de parceiros.";

    await prisma.partnerSubmission.create({
      data: {
        organization: parsed.data.organization,
        organizationType: parsed.data.organizationType,
        contactName: parsed.data.contactName,
        email,
        phone: parsed.data.phone,
        title: "Contato B2B - Landing Parceiros",
        description,
        status: "pending",
      },
    });

    return NextResponse.json({ ok: true });
  } catch (error) {
    console.error("Erro ao registrar contato de parceiro:", error);
    return NextResponse.json({ error: "Erro ao enviar solicitação. Tente novamente." }, { status: 500 });
  }
}
