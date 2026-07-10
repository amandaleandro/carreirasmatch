import { NextRequest, NextResponse } from "next/server";
import { requireToolAccess } from "@/lib/require-auth";
import { compareJobs, JobComparisonInput } from "@/lib/tools";
import { PDFParse } from "pdf-parse";

const MAX_RESUME_FILE_SIZE_BYTES = 5 * 1024 * 1024;

export async function POST(req: NextRequest) {
  try {
    const { session, response } = await requireToolAccess("/tools/compare-jobs");
    if (!session) return response!;

    const formData = await req.formData();
    const file = formData.get("resume") as File | null;
    const jobsRaw = formData.get("jobs") as string | null;

    if (!file) {
      return NextResponse.json(
        { error: "Envie o currículo (PDF)." },
        { status: 400 }
      );
    }

    if (file.size > MAX_RESUME_FILE_SIZE_BYTES) {
      return NextResponse.json(
        { error: "O arquivo do currículo deve ter no máximo 5MB." },
        { status: 413 }
      );
    }

    if (!jobsRaw) {
      return NextResponse.json(
        { error: "Informe pelo menos 2 vagas para comparar." },
        { status: 400 }
      );
    }

    let jobs: JobComparisonInput[];
    try {
      jobs = JSON.parse(jobsRaw) as JobComparisonInput[];
    } catch {
      return NextResponse.json(
        { error: "Não foi possível ler as vagas informadas." },
        { status: 400 }
      );
    }
    const validJobs = jobs
      .filter((j) => j.jobTitle.trim() && j.jobText.trim())
      .map((j, i) => ({ ...j, id: j.id ?? String(i) }));

    if (validJobs.length < 2) {
      return NextResponse.json(
        { error: "Informe pelo menos 2 vagas com cargo e descrição preenchidos." },
        { status: 400 }
      );
    }

    const buffer = Buffer.from(await file.arrayBuffer());
    const parser = new PDFParse({ data: buffer });
    const parsed = await parser.getText();
    await parser.destroy();
    const resumeText = parsed.text.trim();

    if (!resumeText) {
      return NextResponse.json(
        { error: "Não foi possível extrair texto do PDF enviado." },
        { status: 422 }
      );
    }

    const result = await compareJobs(resumeText, validJobs);
    return NextResponse.json(result);
  } catch (error) {
    console.error("Erro ao comparar vagas:", error);
    return NextResponse.json(
      { error: "Erro ao processar. Tente novamente." },
      { status: 500 }
    );
  }
}
