import { NextRequest, NextResponse } from "next/server";
import { requireToolSegmentAccess } from "@/lib/require-auth";
import { reserveFeatureForSession } from "@/lib/feature-access";
import { COMMERCIAL_FEATURE_KEYS } from "@/lib/commercial-plan-catalog";
import { generateProjectExperience } from "@/lib/tools";

export async function POST(req: NextRequest) {
  const { session, response: authResponse } = await requireToolSegmentAccess("/tools/project-to-experience");
  if (!session) return authResponse!;

  const { allowed, response: quotaResponse, release } = await reserveFeatureForSession(
    session.user.id,
    COMMERCIAL_FEATURE_KEYS.aiSimpleAction
  );
  if (!allowed) return quotaResponse!;

  try {
    const { projectDescription, targetArea } = await req.json();

    if (!projectDescription || !projectDescription.trim()) {
      await release.cancel();
      return NextResponse.json(
        { error: "Descreva o projeto, curso ou atividade." },
        { status: 400 }
      );
    }

    const result = await generateProjectExperience(
      projectDescription,
      targetArea ?? ""
    );

    await release.confirm();
    return NextResponse.json(result);
  } catch (error) {
    await release.cancel();
    console.error("Erro ao transformar projeto em experiência:", error);
    return NextResponse.json(
      { error: "Erro ao processar. Tente novamente." },
      { status: 500 }
    );
  }
}
