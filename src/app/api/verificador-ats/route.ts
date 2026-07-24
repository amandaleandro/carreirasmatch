import { NextRequest, NextResponse } from "next/server";
import { analyzeAtsStandalone } from "@/lib/ats-checker";
import { checkRateLimit, getClientIp } from "@/lib/rate-limit";
import { PDFParse } from "pdf-parse";

const MAX_FILE_SIZE_BYTES = 5 * 1024 * 1024;
const RATE_LIMIT_CONFIG = { limit: 15, windowMs: 60 * 60 * 1000 };

export async function POST(req: NextRequest) {
  try {
    const rateLimit = checkRateLimit(`ats-verifier:${getClientIp(req)}`, RATE_LIMIT_CONFIG);
    if (!rateLimit.allowed) {
      return NextResponse.json(
        { error: "Limite de verificações atingido. Aguarde alguns instantes e tente novamente." },
        { status: 429, headers: { "Retry-After": String(rateLimit.retryAfterSeconds) } }
      );
    }

    const formData = await req.formData();
    const file = formData.get("resume") as File | null;
    const resumeTextRaw = formData.get("resumeText") as string | null;

    let resumeText = "";

    if (file) {
      if (file.size > MAX_FILE_SIZE_BYTES) {
        return NextResponse.json(
          { error: "O arquivo do currículo deve ter no máximo 5MB." },
          { status: 413 }
        );
      }
      const pdfBuffer = Buffer.from(await file.arrayBuffer());
      const parser = new PDFParse({ data: pdfBuffer });
      const parsed = await parser.getText();
      await parser.destroy();
      resumeText = parsed.text.trim();
    } else if (resumeTextRaw) {
      resumeText = resumeTextRaw.trim();
    }

    if (!resumeText) {
      return NextResponse.json(
        { error: "Envie um arquivo PDF válido ou cole o texto do seu currículo." },
        { status: 400 }
      );
    }

    const analysis = await analyzeAtsStandalone(resumeText);

    return NextResponse.json(analysis);
  } catch (error) {
    console.error("Erro ao verificar ATS:", error);
    return NextResponse.json(
      { error: "Não foi possível analisar o arquivo. Certifique-se de que é um PDF com texto selecionável." },
      { status: 500 }
    );
  }
}
