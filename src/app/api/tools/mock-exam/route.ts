import { NextRequest, NextResponse } from "next/server";
import path from "path";
import { readFile } from "fs/promises";
import { PDFParse } from "pdf-parse";
import { requireToolAccess } from "@/lib/require-auth";
import { generateMockExamQuestions } from "@/lib/tools";
import { EXAM_ARCHIVE } from "@/lib/exam-archive";

const MAX_EXAM_TEXT_CHARS = 15000;

function findExamFile(requestedPath: string) {
  for (const institution of EXAM_ARCHIVE) {
    for (const year of institution.years) {
      for (const file of year.files) {
        if (file.path === requestedPath) {
          return { institution, year: year.year, file };
        }
      }
    }
  }
  return null;
}

export async function POST(req: NextRequest) {
  try {
    const { session, response } = await requireToolAccess("/tools/vocation-test");
    if (!session) return response!;

    const { path: requestedPath } = await req.json();
    if (typeof requestedPath !== "string") {
      return NextResponse.json({ error: "Prova inválida." }, { status: 400 });
    }

    const match = findExamFile(requestedPath);
    if (!match) {
      return NextResponse.json({ error: "Prova não encontrada no acervo." }, { status: 400 });
    }

    if (match.file.label.toLowerCase().includes("gabarito")) {
      return NextResponse.json(
        { error: "Selecione uma prova, não um gabarito, para gerar o simulado." },
        { status: 400 }
      );
    }

    const absolutePath = path.join(process.cwd(), "public", match.file.path);
    const buffer = await readFile(absolutePath);

    const parser = new PDFParse({ data: buffer });
    const parsed = await parser.getText();
    await parser.destroy();

    const examText = parsed.text.trim().slice(0, MAX_EXAM_TEXT_CHARS);
    if (!examText) {
      return NextResponse.json(
        { error: "Não foi possível extrair texto dessa prova (pode ser um PDF escaneado)." },
        { status: 422 }
      );
    }

    const sourceLabel = `${match.institution.name} ${match.year}, ${match.file.label}`;
    const result = await generateMockExamQuestions(examText, sourceLabel);

    return NextResponse.json(result);
  } catch (error) {
    console.error("Erro ao gerar simulado:", error);
    return NextResponse.json(
      { error: "Erro ao processar. Tente novamente." },
      { status: 500 }
    );
  }
}
