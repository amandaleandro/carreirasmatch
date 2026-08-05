import { NextRequest, NextResponse } from "next/server";
import path from "path";
import { readFile } from "fs/promises";
import { PDFParse } from "pdf-parse";
import { requireToolSegmentAccess } from "@/lib/require-auth";
import { reserveFeatureForSession } from "@/lib/feature-access";
import { COMMERCIAL_FEATURE_KEYS } from "@/lib/commercial-plan-catalog";
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
  const { session, response: authResponse } = await requireToolSegmentAccess("/tools/vocation-test");
  if (!session) return authResponse!;

  const { allowed, response: quotaResponse, release } = await reserveFeatureForSession(
    session.user.id,
    COMMERCIAL_FEATURE_KEYS.studyTool
  );
  if (!allowed) return quotaResponse!;

  try {
    const { path: requestedPath } = await req.json();
    if (typeof requestedPath !== "string") {
      await release.cancel();
      return NextResponse.json({ error: "Prova inválida." }, { status: 400 });
    }

    const match = findExamFile(requestedPath);
    if (!match) {
      await release.cancel();
      return NextResponse.json({ error: "Prova não encontrada no acervo." }, { status: 400 });
    }

    if (match.file.label.toLowerCase().includes("gabarito")) {
      await release.cancel();
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
      await release.cancel();
      return NextResponse.json(
        { error: "Não foi possível extrair texto dessa prova (pode ser um PDF escaneado)." },
        { status: 422 }
      );
    }

    const sourceLabel = `${match.institution.name} ${match.year}, ${match.file.label}`;
    const result = await generateMockExamQuestions(examText, sourceLabel);

    await release.confirm();
    return NextResponse.json(result);
  } catch (error) {
    await release.cancel();
    console.error("Erro ao gerar simulado:", error);
    return NextResponse.json(
      { error: "Erro ao processar. Tente novamente." },
      { status: 500 }
    );
  }
}
