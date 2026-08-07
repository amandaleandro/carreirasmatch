import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { extractSubjectsFromCurriculumText } from "@/lib/university";
import { reserveFeatureForRoute } from "@/lib/feature-access";
import { COMMERCIAL_FEATURE_KEYS } from "@/lib/commercial-plan-catalog";
import { PDFParse } from "pdf-parse";

const MAX_FILE_SIZE_BYTES = 8 * 1024 * 1024;
const MAX_EXTRACTED_TEXT_CHARS = 20000;

export async function POST(req: NextRequest) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Faça login para continuar." }, { status: 401 });
  }

  const enrollment = await prisma.universityEnrollment.findUnique({ where: { userId: session.user.id } });
  if (!enrollment) {
    return NextResponse.json({ error: "Cadastre seu curso antes de importar a grade." }, { status: 400 });
  }

  const formData = await req.formData();
  const file = formData.get("file");
  if (!(file instanceof File)) {
    return NextResponse.json({ error: "Envie um arquivo PDF." }, { status: 400 });
  }
  if (!file.type.includes("pdf") && !file.name.toLowerCase().endsWith(".pdf")) {
    return NextResponse.json({ error: "Envie um arquivo no formato PDF." }, { status: 400 });
  }
  if (file.size > MAX_FILE_SIZE_BYTES) {
    return NextResponse.json({ error: "Arquivo muito grande (máx. 8MB)." }, { status: 400 });
  }

  const { response, release } = await reserveFeatureForRoute(COMMERCIAL_FEATURE_KEYS.studyTool);
  if (response) return response;

  try {
    const buffer = Buffer.from(await file.arrayBuffer());
    const parser = new PDFParse({ data: buffer });
    const parsed = await parser.getText();
    await parser.destroy();
    const text = parsed.text.trim();

    if (!text) {
      await release!.cancel();
      return NextResponse.json({ error: "Não foi possível extrair texto do PDF enviado." }, { status: 422 });
    }

    const extracted = await extractSubjectsFromCurriculumText(text.slice(0, MAX_EXTRACTED_TEXT_CHARS), enrollment.courseName);
    if (extracted.length === 0) {
      await release!.cancel();
      return NextResponse.json({ error: "Não encontramos disciplinas nesse PDF." }, { status: 422 });
    }

    const existing = await prisma.universitySubject.findMany({
      where: { enrollmentId: enrollment.id },
      select: { id: true, name: true },
    });
    const existingByName = new Map(existing.map((s) => [s.name.trim().toLowerCase(), s.id]));

    const subjects = await prisma.$transaction(
      extracted.map((s) => {
        const name = s.name.trim().slice(0, 200);
        const syllabus = s.syllabus?.trim().slice(0, 4000) || null;
        const existingId = existingByName.get(name.toLowerCase());
        if (existingId) {
          return prisma.universitySubject.update({
            where: { id: existingId },
            data: syllabus ? { syllabus } : {},
          });
        }
        return prisma.universitySubject.create({
          data: { enrollmentId: enrollment.id, name, syllabus },
        });
      })
    );

    await release!.confirm();
    return NextResponse.json({ subjects });
  } catch (error) {
    await release!.cancel();
    console.error("Erro ao importar PDF de grade/ementa:", error);
    return NextResponse.json({ error: "Erro ao processar o PDF. Tente novamente." }, { status: 500 });
  }
}
