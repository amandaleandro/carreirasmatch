import { NextRequest, NextResponse } from "next/server";
import { requireToolAccess } from "@/lib/require-auth";
import { analyzeGithub } from "@/lib/tools";

export async function POST(req: NextRequest) {
  try {
    const { session, response } = await requireToolAccess("/tools/github-review");
    if (!session) return response!;

    const { githubText, targetRole } = await req.json();

    if (!githubText?.trim()) {
      return NextResponse.json(
        { error: "Cole a lista de repositórios/descrições do seu GitHub." },
        { status: 400 }
      );
    }

    const result = await analyzeGithub(githubText, targetRole ?? "");
    return NextResponse.json(result);
  } catch (error) {
    console.error("Erro ao analisar GitHub:", error);
    return NextResponse.json(
      { error: "Erro ao processar. Tente novamente." },
      { status: 500 }
    );
  }
}
