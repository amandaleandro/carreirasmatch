import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/auth";
import { analyzeCareerDiscovery, DiscoveryAnswers } from "@/lib/tools";
import { prisma } from "@/lib/prisma";
import { checkRateLimit, getClientIp } from "@/lib/rate-limit";
import { PDFParse } from "pdf-parse";

const MAX_RESUME_FILE_SIZE_BYTES = 5 * 1024 * 1024;
const DISCOVERY_AREA_SLUG = "discover";
const ANONYMOUS_LIMIT = { limit: 15, windowMs: 60 * 60 * 1000 };

export async function POST(req: NextRequest) {
  try {
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

    const answers: DiscoveryAnswers = {
      enjoys: (formData.get("enjoys") as string) ?? "",
      peopleOrSystems: (formData.get("peopleOrSystems") as string) ?? "",
      workStyle: (formData.get("workStyle") as string) ?? "",
      educationPreference: (formData.get("educationPreference") as string) ?? "",
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

    const result = await analyzeCareerDiscovery(answers, resumeText);

    const saved = await prisma.vocationTestResult.create({
      data: {
        userId: userId ?? undefined,
        areaSlug: DISCOVERY_AREA_SLUG,
        answers: JSON.stringify(answers),
        result: JSON.stringify(result),
      },
    });

    return NextResponse.json({ ...result, resultId: saved.id });
  } catch (error) {
    console.error("Erro ao analisar descoberta de área:", error);
    return NextResponse.json(
      { error: "Erro ao processar. Tente novamente." },
      { status: 500 }
    );
  }
}
