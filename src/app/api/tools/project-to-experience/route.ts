import { NextRequest, NextResponse } from "next/server";
import { requireToolAccess } from "@/lib/require-auth";
import { generateProjectExperience } from "@/lib/tools";

export async function POST(req: NextRequest) {
  try {
    const { session, response } = await requireToolAccess("/tools/project-to-experience");
    if (!session) return response!;

    const { projectDescription, targetArea } = await req.json();

    if (!projectDescription || !projectDescription.trim()) {
      return NextResponse.json(
        { error: "Descreva o projeto, curso ou atividade." },
        { status: 400 }
      );
    }

    const result = await generateProjectExperience(
      projectDescription,
      targetArea ?? ""
    );

    return NextResponse.json(result);
  } catch (error) {
    console.error("Erro ao transformar projeto em experiência:", error);
    return NextResponse.json(
      { error: "Erro ao processar. Tente novamente." },
      { status: 500 }
    );
  }
}
