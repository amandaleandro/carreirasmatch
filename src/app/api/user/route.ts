import { NextRequest, NextResponse } from "next/server";
import { requireAuth } from "@/lib/require-auth";
import { prisma } from "@/lib/prisma";
import { isCareerSegment } from "@/lib/career-segments";

export async function PATCH(req: NextRequest) {
  const { session, response } = await requireAuth();
  if (!session) return response;

  const body = await req.json();
  const data: {
    name?: string | null;
    image?: string | null;
    careerSegment?: string | null;
    professionalArea?: string | null;
    hasFormalEducation?: boolean | null;
    interestedRoles?: string;
    themePreference?: string;
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

  if ("hasFormalEducation" in body) {
    const { hasFormalEducation } = body;
    if (hasFormalEducation !== null && typeof hasFormalEducation !== "boolean") {
      return NextResponse.json({ error: "Valor inválido para formação formal." }, { status: 400 });
    }
    data.hasFormalEducation = hasFormalEducation;
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

  return NextResponse.json({ ok: true });
}
