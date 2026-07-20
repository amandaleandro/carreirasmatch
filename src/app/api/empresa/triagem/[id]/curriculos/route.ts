import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireCompanyApi } from "@/lib/company-auth";
import { rankCandidates, type CandidateInput } from "@/lib/tools";
import { parseResumeFiles } from "@/lib/company-screening";
import { checkRateLimit } from "@/lib/rate-limit";

const APPEND_LIMIT = { limit: 5, windowMs: 10 * 60 * 1000 };

// Adiciona novos currículos a uma triagem existente, ranqueando-os contra a
// mesma vaga. Não consome crédito (é a mesma triagem). Os candidatos já
// existentes mantêm suas notas; a lista reordena por aderência.
export async function POST(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { company, response } = await requireCompanyApi();
  if (!company) return response;

  const { id } = await params;
  const job = await prisma.companyJob.findFirst({
    where: { id, companyId: company.id },
    select: { id: true, title: true, description: true },
  });
  if (!job) return NextResponse.json({ error: "Triagem não encontrada." }, { status: 404 });

  const rateLimit = checkRateLimit(`company-screening-append:${company.id}`, APPEND_LIMIT);
  if (!rateLimit.allowed) {
    return NextResponse.json(
      { error: "Muitas adições em sequência. Aguarde um momento." },
      { status: 429, headers: { "Retry-After": String(rateLimit.retryAfterSeconds) } }
    );
  }

  const formData = await req.formData();
  const files = formData.getAll("resumes").filter((f): f is File => f instanceof File);

  const parseResult = await parseResumeFiles(files);
  if (!parseResult.ok) {
    return NextResponse.json({ error: parseResult.error }, { status: parseResult.status });
  }

  const candidates: CandidateInput[] = parseResult.parsed.map((p, i) => ({
    id: String(i),
    label: p.fileName,
    resumeText: p.rawText,
  }));

  let ranking;
  try {
    ranking = await rankCandidates(job.title, job.description, candidates);
  } catch (error) {
    console.error("Falha ao ranquear currículos adicionais:", error);
    return NextResponse.json(
      { error: "A análise por IA está com muita demanda. Tente novamente em instantes." },
      { status: 429 }
    );
  }

  const scoreById = new Map(ranking.ranking.map((r) => [r.candidateId, r]));

  await prisma.companyCandidate.createMany({
    data: parseResult.parsed.map((p, i) => {
      const scored = scoreById.get(String(i));
      return {
        jobId: job.id,
        fileName: p.fileName,
        rawText: p.rawText,
        fitScore: scored?.fitScore ?? 0,
        reason: scored?.reason ?? "",
      };
    }),
  });

  return NextResponse.json({ added: parseResult.parsed.length });
}
