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

  // Permitido se ainda há triagem gratuita OU crédito comprado.
  const hasFreeScreening = company.screeningCount < FREE_SCREENING_LIMIT;
  const usesPaidCredit = !hasFreeScreening && company.screeningCredits > 0;
  if (!hasFreeScreening && !usesPaidCredit) {
    return NextResponse.json(
      { error: "Seus créditos de triagem acabaram. Compre um pacote para continuar.", code: "no_credits" },
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

  // Grava a triagem + candidatos e consome uma triagem (gratuita ou paga) de
  // forma atômica. Se usa crédito pago, decrementa com guarda de saldo > 0 para
  // evitar corrida que zere abaixo de zero.
  let job;
  try {
    job = await prisma.$transaction(async (tx) => {
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
              candidateName: scored?.candidateName || "",
            };
          }),
        },
      },
    });
    if (hasFreeScreening) {
      await tx.company.update({
        where: { id: company.id },
        data: { screeningCount: { increment: 1 } },
      });
    } else {
      const consumed = await tx.company.updateMany({
        where: { id: company.id, screeningCredits: { gt: 0 } },
        data: { screeningCredits: { decrement: 1 } },
      });
      if (consumed.count === 0) {
        throw new Error("no_credits");
      }
    }
    return created;
    });
  } catch (error) {
    if (error instanceof Error && error.message === "no_credits") {
      return NextResponse.json(
        { error: "Seus créditos de triagem acabaram. Compre um pacote para continuar.", code: "no_credits" },
        { status: 402 }
      );
    }
    throw error;
  }

  return NextResponse.json({ id: job.id });
}
