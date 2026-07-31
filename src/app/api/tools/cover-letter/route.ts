import { NextRequest, NextResponse } from "next/server";
import { generateCoverLetter, type CoverLetterTone } from "@/lib/tools";
import { reserveFeatureForRoute } from "@/lib/feature-access";
import { COMMERCIAL_FEATURE_KEYS } from "@/lib/commercial-plan-catalog";

const VALID_TONES: CoverLetterTone[] = ["formal", "direto", "entusiasmado"];

export async function POST(req: NextRequest) {
  const { session, response, release } = await reserveFeatureForRoute(COMMERCIAL_FEATURE_KEYS.aiSimpleAction);
  if (!session) return response!;

  try {
    const { resumeText, jobTitle, jobText, tone } = await req.json();

    if (!resumeText?.trim() || !jobTitle?.trim()) {
      await release!.cancel();
      return NextResponse.json(
        { error: "Cole seu currículo e informe o cargo da vaga." },
        { status: 400 }
      );
    }

    const resolvedTone: CoverLetterTone = VALID_TONES.includes(tone) ? tone : "formal";

    const result = await generateCoverLetter(resumeText, jobTitle, jobText ?? "", resolvedTone);
    await release!.confirm();
    return NextResponse.json(result);
  } catch (error) {
    await release!.cancel();
    console.error("Erro ao gerar carta de apresentação:", error);
    return NextResponse.json(
      { error: "Erro ao processar. Tente novamente." },
      { status: 500 }
    );
  }
}
