import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/auth";
import { analyzeVocationTest, VocationAnswers } from "@/lib/tools";
import { getVocationArea } from "@/lib/vocation-areas";
import { prisma } from "@/lib/prisma";
import { checkRateLimit, getClientIp } from "@/lib/rate-limit";
import { PDFParse } from "pdf-parse";
import { requireToolAccess } from "@/lib/require-auth";

const MAX_RESUME_FILE_SIZE_BYTES = 5 * 1024 * 1024;
const ANONYMOUS_LIMIT = { limit: 15, windowMs: 60 * 60 * 1000 };

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ area: string }> }
) {
  try {
    const { area: areaSlug } = await params;
    const area = getVocationArea(areaSlug);
    if (!area) {
      return NextResponse.json({ error: "Área inválida." }, { status: 400 });
    }

    const session = await auth();
    const userId = session?.user?.id ?? null;

    if (!userId) {
      const rateLimit = checkRateLimit(`anon-vocation:${getClientIp(req)}`, ANONYMOUS_LIMIT);
      if (!rateLimit.allowed) {
        return NextResponse.json(
          { error: "Muitas tentativas por aqui. Tente novamente mais tarde." },
          { status: 429, headers: { "Retry-After": String(rateLimit.retryAfterSeconds) } }
        );
      }
    }

    const formData = await req.formData();
    const file = formData.get("resume") as File | null;

    if (file && file.size > MAX_RESUME_FILE_SIZE_BYTES) {
      return NextResponse.json(
        { error: "O arquivo do currículo deve ter no máximo 5MB." },
        { status: 413 }
      );
    }

    const alreadyEnrolled = formData.get("alreadyEnrolled") === "true";
    if (alreadyEnrolled) {
      const { session: paidSession, response } = await requireToolAccess(
        "/tools/vocation-test",
        "internship"
      );
      if (!paidSession) return response!;
    }

    const answers: VocationAnswers = {
      enjoysProblemSolving: (formData.get("enjoysProblemSolving") as string) ?? "",
      prefersPeopleOrSystems: (formData.get("prefersPeopleOrSystems") as string) ?? "",
      interestAreas: (formData.get("interestAreas") as string) ?? "",
      workStylePreference: (formData.get("workStylePreference") as string) ?? "",
      priorExperience: (formData.get("priorExperience") as string) ?? "",
    };

    if (Object.values(answers).some((v) => !v.trim())) {
      return NextResponse.json(
        { error: "Responda todas as perguntas do quiz." },
        { status: 400 }
      );
    }

    let resumeText = "";
    if (file) {
      const buffer = Buffer.from(await file.arrayBuffer());
      const parser = new PDFParse({ data: buffer });
      const parsed = await parser.getText();
      await parser.destroy();
      resumeText = parsed.text.trim();
    }

    const result = await analyzeVocationTest(area, answers, resumeText, alreadyEnrolled);

    const saved = await prisma.vocationTestResult.create({
      data: {
        userId: userId ?? undefined,
        areaSlug: area.slug,
        answers: JSON.stringify({ ...answers, alreadyEnrolled }),
        result: JSON.stringify(result),
      },
    });

    return NextResponse.json({ ...result, resultId: saved.id });
  } catch (error) {
    console.error("Erro ao analisar teste vocacional:", error);
    return NextResponse.json(
      { error: "Erro ao processar. Tente novamente." },
      { status: 500 }
    );
  }
}
