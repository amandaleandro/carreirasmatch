import { NextRequest, NextResponse } from "next/server";
import { PDFParse } from "pdf-parse";
import { prisma } from "@/lib/prisma";
import { requireCompanyApi, FREE_SCREENING_LIMIT } from "@/lib/company-auth";
import { rankCandidates, type CandidateInput } from "@/lib/tools";
import { checkRateLimit } from "@/lib/rate-limit";

const MAX_FILE_SIZE_BYTES = 5 * 1024 * 1024;
const MAX_FILES = 30;
const SCREENING_LIMIT = { limit: 5, windowMs: 10 * 60 * 1000 };

export async function POST(req: NextRequest) {
  const { company, response } = await requireCompanyApi();
  if (!company) return response;

  const rateLimit = checkRateLimit(`company-screening:${company.id}`, SCREENING_LIMIT);
  if (!rateLimit.allowed) {
    return NextResponse.json(
      { error: "Muitas triagens em sequência. Aguarde um momento e tente novamente." },
      { status: 429, headers: { "Retry-After": String(rateLimit.retryAfterSeconds) } }
    );
  }

  if (company.screeningCount >= FREE_SCREENING_LIMIT) {
    return NextResponse.json(
      { error: "Você atingiu o limite de triagens gratuitas. Fale com a gente para liberar mais." },
      { status: 402 }
    );
  }

  const formData = await req.formData();
  const title = String(formData.get("title") ?? "").trim();
  const description = String(formData.get("description") ?? "").trim();
  const files = formData.getAll("resumes").filter((f): f is File => f instanceof File);

  if (!title || !description) {
    return NextResponse.json({ error: "Informe o cargo e a descrição da vaga." }, { status: 400 });
  }
  if (files.length === 0) {
    return NextResponse.json({ error: "Envie ao menos um currículo em PDF." }, { status: 400 });
  }
  if (files.length > MAX_FILES) {
    return NextResponse.json({ error: `Envie no máximo ${MAX_FILES} currículos por triagem.` }, { status: 400 });
  }

  // Extrai texto de cada PDF; ignora os que falharem ou vierem vazios.
  const parsed: { fileName: string; rawText: string }[] = [];
  for (const file of files) {
    if (file.size > MAX_FILE_SIZE_BYTES) {
      return NextResponse.json({ error: `"${file.name}" passa de 5MB.` }, { status: 413 });
    }
    try {
      const buffer = Buffer.from(await file.arrayBuffer());
      const parser = new PDFParse({ data: buffer });
      const result = await parser.getText();
      await parser.destroy();
      const text = result.text.trim();
      if (text) parsed.push({ fileName: file.name, rawText: text });
    } catch (error) {
      console.error(`Falha ao ler PDF "${file.name}":`, error);
    }
  }

  if (parsed.length === 0) {
    return NextResponse.json(
      { error: "Não foi possível extrair texto de nenhum dos PDFs enviados." },
      { status: 422 }
    );
  }

  const candidates: CandidateInput[] = parsed.map((p, i) => ({
    id: String(i),
    label: p.fileName,
    resumeText: p.rawText,
  }));

  let ranking;
  try {
    ranking = await rankCandidates(title, description, candidates);
  } catch (error) {
    console.error("Falha ao ranquear candidatos:", error);
    return NextResponse.json(
      { error: "No momento a análise por IA está com muita demanda. Tente novamente em instantes." },
      { status: 429 }
    );
  }

  const scoreById = new Map(ranking.ranking.map((r) => [r.candidateId, r]));

  // Grava a triagem + candidatos e incrementa o contador de forma atômica.
  const job = await prisma.$transaction(async (tx) => {
    const created = await tx.companyJob.create({
      data: {
        companyId: company.id,
        title,
        description,
        recommendation: ranking.recommendation ?? "",
        candidates: {
          create: parsed.map((p, i) => {
            const scored = scoreById.get(String(i));
            return {
              fileName: p.fileName,
              rawText: p.rawText,
              fitScore: scored?.fitScore ?? 0,
              reason: scored?.reason ?? "",
            };
          }),
        },
      },
    });
    await tx.company.update({
      where: { id: company.id },
      data: { screeningCount: { increment: 1 } },
    });
    return created;
  });

  return NextResponse.json({ id: job.id });
}
