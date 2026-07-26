import { NextRequest, NextResponse } from "next/server";
import { requireAuth } from "@/lib/require-auth";
import { prisma } from "@/lib/prisma";
import { isCareerSegment } from "@/lib/career-segments";
import { normalizeBrazilPhone, isValidBrazilPhone } from "@/lib/contact-validation";

export async function PATCH(req: NextRequest) {
  const { session, response } = await requireAuth();
  if (!session) return response;

  const body = await req.json();
  const data: {
    name?: string | null;
    image?: string | null;
    careerSegment?: string | null;
    professionalArea?: string | null;
    currentProfessionalArea?: string | null;
    targetProfessionalArea?: string | null;
    studyCourse?: string | null;
    hasFormalEducation?: boolean | null;
    interestedRoles?: string;
    themePreference?: string;
    city?: string | null;
    state?: string | null;
    discoverable?: boolean;
    phone?: string | null;
    whatsappMarketingOptIn?: boolean;
  } = {};

  if ("name" in body) {
    const { name } = body;
    if (name !== null && typeof name !== "string") {
      return NextResponse.json({ error: "Nome inválido." }, { status: 400 });
    }
    const trimmed = name?.trim() || null;
    if (trimmed && trimmed.length > 120) {
      return NextResponse.json({ error: "Nome muito longo." }, { status: 400 });
    }
    data.name = trimmed;
  }

  if ("image" in body) {
    const { image } = body;
    if (image !== null && typeof image !== "string") {
      return NextResponse.json({ error: "Imagem inválida." }, { status: 400 });
    }
    if (image && !/^data:image\/(png|jpeg|jpg|webp);base64,/.test(image)) {
      return NextResponse.json({ error: "Formato de imagem inválido." }, { status: 400 });
    }
    if (image && image.length > 2_000_000) {
      return NextResponse.json({ error: "Imagem muito grande." }, { status: 400 });
    }
    data.image = image || null;
  }

  if ("careerSegment" in body) {
    const { careerSegment } = body;
    if (careerSegment !== null && !isCareerSegment(careerSegment)) {
      return NextResponse.json({ error: "Segmento de carreira inválido." }, { status: 400 });
    }
    data.careerSegment = careerSegment;
  }

  if ("professionalArea" in body) {
    const { professionalArea } = body;
    if (professionalArea !== null && typeof professionalArea !== "string") {
      return NextResponse.json({ error: "Área profissional inválida." }, { status: 400 });
    }
    data.professionalArea = professionalArea?.trim() || null;
  }

  for (const field of ["currentProfessionalArea", "targetProfessionalArea", "studyCourse"] as const) {
    if (field in body) {
      const value = body[field];
      if (value !== null && typeof value !== "string") {
        return NextResponse.json({ error: "Dados de carreira inválidos." }, { status: 400 });
      }
      if (typeof value === "string" && value.trim().length > 160) {
        return NextResponse.json({ error: "Dados de carreira muito longos." }, { status: 400 });
      }
      data[field] = typeof value === "string" ? value.trim() || null : null;
    }
  }

  if ("hasFormalEducation" in body) {
    const { hasFormalEducation } = body;
    if (hasFormalEducation !== null && typeof hasFormalEducation !== "boolean") {
      return NextResponse.json({ error: "Valor inválido para formação formal." }, { status: 400 });
    }
    data.hasFormalEducation = hasFormalEducation;
  }

  if ("state" in body) {
    const state = typeof body.state === "string" ? body.state.trim().toUpperCase() : "";
    if (state && !/^[A-Z]{2}$/.test(state)) return NextResponse.json({ error: "UF inválida." }, { status: 400 });
    data.state = state || null;
  }

  if ("city" in body) {
    const city = typeof body.city === "string" ? body.city.trim() : "";
    if (city.length > 120) return NextResponse.json({ error: "Cidade inválida." }, { status: 400 });
    data.city = city || null;
  }

  if ("interestedRoles" in body) {
    const { interestedRoles } = body;
    if (
      !Array.isArray(interestedRoles) ||
      interestedRoles.length > 20 ||
      !interestedRoles.every((role) => typeof role === "string" && role.trim().length > 0 && role.length <= 80)
    ) {
      return NextResponse.json({ error: "Cargos de interesse inválidos." }, { status: 400 });
    }
    const cleaned = [...new Set(interestedRoles.map((role: string) => role.trim()))];
    data.interestedRoles = JSON.stringify(cleaned);
  }

  if ("discoverable" in body) {
    const { discoverable } = body;
    if (typeof discoverable !== "boolean") {
      return NextResponse.json({ error: "Valor inválido." }, { status: 400 });
    }
    data.discoverable = discoverable;
  }

  if ("phone" in body) {
    const normalized = normalizeBrazilPhone(body.phone);
    if (normalized && !isValidBrazilPhone(normalized)) {
      return NextResponse.json({ error: "Telefone inválido." }, { status: 400 });
    }
    data.phone = normalized || null;
  }

  if ("whatsappMarketingOptIn" in body) {
    const { whatsappMarketingOptIn } = body;
    if (typeof whatsappMarketingOptIn !== "boolean") {
      return NextResponse.json({ error: "Valor inválido." }, { status: 400 });
    }
    if (whatsappMarketingOptIn) {
      const effectivePhone =
        "phone" in data
          ? data.phone
          : (await prisma.user.findUnique({ where: { id: session.user.id }, select: { phone: true } }))?.phone;
      if (!effectivePhone) {
        return NextResponse.json(
          { error: "Informe um telefone válido para ativar as mensagens por WhatsApp." },
          { status: 400 }
        );
      }
    }
    data.whatsappMarketingOptIn = whatsappMarketingOptIn;
  }

  if ("themePreference" in body) {
    const { themePreference } = body;
    if (themePreference !== "light" && themePreference !== "dark" && themePreference !== "system") {
      return NextResponse.json({ error: "Preferência de tema inválida." }, { status: 400 });
    }
    data.themePreference = themePreference;
  }

  await prisma.user.update({
    where: { id: session.user.id },
    data,
  });

  const shouldRefreshFeed = [
    "professionalArea",
    "targetProfessionalArea",
    "studyCourse",
    "interestedRoles",
  ].some((field) => field in body);
  if (shouldRefreshFeed) {
    // Mantém as vagas descartadas pelo usuário, mas força novo matching para
    // que alterações de área/cargo não continuem usando notas antigas.
    await prisma.jobMatch.deleteMany({
      where: { resume: { userId: session.user.id }, status: { not: "discarded" } },
    });
  }

  return NextResponse.json({ ok: true });
}
