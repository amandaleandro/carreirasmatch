import { NextRequest, NextResponse } from "next/server";
import { generateCoverLetter, type CoverLetterTone } from "@/lib/tools";
import { authorizeFreeAiTool, releaseFreeAiToolUsage } from "@/lib/free-tool-access";

const VALID_TONES: CoverLetterTone[] = ["formal", "direto", "entusiasmado"];

export async function POST(req: NextRequest) {
  let freeUserId: string | null = null;
  try {
    const { session, response, subscriber } = await authorizeFreeAiTool("cover-letter", true);
    if (!session) return response!;
    if (!subscriber) freeUserId = session.user.id;

    const { resumeText, jobTitle, jobText, tone } = await req.json();

    if (!resumeText?.trim() || !jobTitle?.trim()) {
      return NextResponse.json(
        { error: "Cole seu currículo e informe o cargo da vaga." },
        { status: 400 }
      );
    }

    const resolvedTone: CoverLetterTone = VALID_TONES.includes(tone) ? tone : "formal";

    const result = await generateCoverLetter(resumeText, jobTitle, jobText ?? "", resolvedTone);
    return NextResponse.json(result);
  } catch (error) {
    if (freeUserId) await releaseFreeAiToolUsage(freeUserId, "cover-letter");
    console.error("Erro ao gerar carta de apresentação:", error);
    return NextResponse.json(
      { error: "Erro ao processar. Tente novamente." },
      { status: 500 }
    );
  }
}
