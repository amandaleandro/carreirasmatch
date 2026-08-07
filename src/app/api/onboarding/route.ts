import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { isCareerSegment } from "@/lib/career-segments";

const RESUME_CHOICES = ["upload", "create", "skip"] as const;
const WORK_MODEL_PREFERENCES = ["remote", "local", "any"] as const;

export async function PATCH(req: NextRequest) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Não autenticado." }, { status: 401 });
  }

  const { careerSegment, professionalArea, objective, objectiveDeadline, onboardingResumeChoice, preferredWorkModel, city } =
    await req.json();

  if (typeof careerSegment !== "string" || !isCareerSegment(careerSegment)) {
    return NextResponse.json({ error: "Escolha o momento atual." }, { status: 400 });
  }
  if (typeof objective !== "string" || !objective.trim()) {
    return NextResponse.json({ error: "Escolha um objetivo." }, { status: 400 });
  }

  await prisma.user.update({
    where: { id: session.user.id },
    data: {
      careerSegment,
      objective: objective.trim(),
      objectiveDeadline: typeof objectiveDeadline === "string" && objectiveDeadline.trim() ? objectiveDeadline.trim() : null,
      ...(typeof professionalArea === "string" && professionalArea.trim()
        ? { professionalArea: professionalArea.trim(), targetProfessionalArea: professionalArea.trim() }
        : {}),
      ...(typeof onboardingResumeChoice === "string" && (RESUME_CHOICES as readonly string[]).includes(onboardingResumeChoice)
        ? { onboardingResumeChoice }
        : {}),
      ...(typeof preferredWorkModel === "string" && (WORK_MODEL_PREFERENCES as readonly string[]).includes(preferredWorkModel)
        ? { preferredWorkModel }
        : {}),
      ...(typeof city === "string" && city.trim() ? { city: city.trim() } : {}),
    },
  });

  return NextResponse.json({ ok: true });
}
