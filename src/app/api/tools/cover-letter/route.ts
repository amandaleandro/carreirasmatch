import { NextRequest, NextResponse } from "next/server";
import { requireToolAccess } from "@/lib/require-auth";
import { generateCoverLetter, type CoverLetterTone } from "@/lib/tools";

const VALID_TONES: CoverLetterTone[] = ["formal", "direto", "entusiasmado"];

export async function POST(req: NextRequest) {
  try {
    const { session, response } = await requireToolAccess("/tools/cover-letter");
    if (!session) return response!;

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
    console.error("Erro ao gerar carta de apresentação:", error);
    return NextResponse.json(
      { error: "Erro ao processar. Tente novamente." },
      { status: 500 }
    );
  }
}
