import { NextRequest, NextResponse } from "next/server";
import { requireToolSegmentAccess } from "@/lib/require-auth";
import { reserveFeatureForSession } from "@/lib/feature-access";
import { COMMERCIAL_FEATURE_KEYS } from "@/lib/commercial-plan-catalog";
import { generateProfileFromScratch } from "@/lib/tools";

export async function POST(req: NextRequest) {
  const { session, response: authResponse } = await requireToolSegmentAccess("/tools/profile-from-scratch");
  if (!session) return authResponse!;

  const { allowed, response: quotaResponse, release } = await reserveFeatureForSession(
    session.user.id,
    COMMERCIAL_FEATURE_KEYS.aiSimpleAction
  );
  if (!allowed) return quotaResponse!;

  try {
    const { education, projects, skills, targetRole } = await req.json();

    if (!education?.trim() && !projects?.trim() && !skills?.trim()) {
      await release.cancel();
      return NextResponse.json(
        { error: "Preencha ao menos formação, projetos ou habilidades." },
        { status: 400 }
      );
    }

    const result = await generateProfileFromScratch({
      education: education ?? "",
      projects: projects ?? "",
      skills: skills ?? "",
      targetRole: targetRole ?? "",
    });
    await release.confirm();
    return NextResponse.json(result);
  } catch (error) {
    await release.cancel();
    console.error("Erro ao gerar perfil do zero:", error);
    return NextResponse.json(
      { error: "Erro ao processar. Tente novamente." },
      { status: 500 }
    );
  }
}
