import { NextRequest, NextResponse } from "next/server";
import { requireAuth } from "@/lib/require-auth";
import { prisma } from "@/lib/prisma";
import { PDFParse } from "pdf-parse";

const MAX_RESUME_FILE_SIZE_BYTES = 5 * 1024 * 1024;

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { session, response } = await requireAuth();
  if (!session) return response!;

  const { id } = await params;

  const analysis = await prisma.analysis.findUnique({
    where: { id },
    include: { resume: true },
  });

  if (!analysis || analysis.resume.userId !== session.user.id) {
    return NextResponse.json({ error: "Currículo não encontrado." }, { status: 404 });
  }

  if (!analysis.resume.pdfData) {
    return NextResponse.json({ error: "Nenhum PDF anexado a este currículo." }, { status: 404 });
  }

  return new NextResponse(new Uint8Array(analysis.resume.pdfData), {
    headers: {
      "Content-Type": "application/pdf",
      "Content-Disposition": `inline; filename="${analysis.resume.fileName || "curriculo.pdf"}"`,
    },
  });
}

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { session, response } = await requireAuth();
  if (!session) return response!;

  const { id } = await params;

  const analysis = await prisma.analysis.findUnique({
    where: { id },
    include: { resume: true },
  });

  if (!analysis || analysis.resume.userId !== session.user.id) {
    return NextResponse.json({ error: "Currículo não encontrado." }, { status: 404 });
  }

  const formData = await req.formData();
  const file = formData.get("file") as File | null;

  if (!file) {
    return NextResponse.json({ error: "Envie um arquivo PDF." }, { status: 400 });
  }

  if (file.type !== "application/pdf") {
    return NextResponse.json({ error: "O arquivo precisa ser um PDF." }, { status: 400 });
  }

  if (file.size > MAX_RESUME_FILE_SIZE_BYTES) {
    return NextResponse.json(
      { error: "O arquivo do currículo deve ter no máximo 5MB." },
      { status: 413 }
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

  await prisma.resume.update({
    where: { id: analysis.resume.id },
    data: { fileName: file.name, rawText: resumeText, pdfData: new Uint8Array(buffer) },
  });

  return NextResponse.json({ ok: true, fileName: file.name });
}
