import { NextRequest, NextResponse } from "next/server";
import type { StructuredResume } from "@/lib/groq";
import { renderResumePdf } from "@/lib/resume-pdf";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json() as {
      title?: string;
      summary?: string;
      experienceSuggestions?: { role?: string; company?: string; suggested?: string }[];
      keywordsFound?: string[];
      resumeStructured?: StructuredResume | null;
      resumeText?: string;
    };
    const bytes = await renderResumePdf(body);
    return new NextResponse(new Uint8Array(bytes), {
      headers: {
        "Content-Type": "application/pdf",
        "Content-Disposition": `attachment; filename="curriculo-otimizado.pdf"`,
      },
    });
  } catch (error) {
    console.error("Erro ao gerar PDF:", error);
    return NextResponse.json({ error: "Falha ao gerar arquivo PDF" }, { status: 500 });
  }
}
