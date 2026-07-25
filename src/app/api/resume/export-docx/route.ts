import { NextRequest, NextResponse } from "next/server";
import { Document, Packer, Paragraph, TextRun, HeadingLevel, AlignmentType } from "docx";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { title, summary, experienceSuggestions, keywordsFound } = body;

    const doc = new Document({
      sections: [
        {
          properties: {},
          children: [
            new Paragraph({
              text: title || "Currículo Otimizado — CarreirasMatch",
              heading: HeadingLevel.HEADING_1,
              alignment: AlignmentType.CENTER,
              spacing: { after: 300 },
            }),
            new Paragraph({
              text: "Resumo Profissional Otimizado",
              heading: HeadingLevel.HEADING_2,
              spacing: { before: 200, after: 100 },
            }),
            new Paragraph({
              children: [
                new TextRun({
                  text: summary || "Não informado",
                  size: 22,
                }),
              ],
              spacing: { after: 300 },
            }),
            ...(experienceSuggestions && experienceSuggestions.length > 0
              ? [
                  new Paragraph({
                    text: "Experiências Profissionais Reformuladas",
                    heading: HeadingLevel.HEADING_2,
                    spacing: { before: 200, after: 100 },
                  }),
                  ...experienceSuggestions.flatMap((exp: { role?: string; company?: string; suggested?: string }) => [
                    new Paragraph({
                      children: [
                        new TextRun({
                          text: `${exp.role || "Cargo"} — ${exp.company || "Empresa"}`,
                          bold: true,
                          size: 24,
                        }),
                      ],
                      spacing: { before: 150, after: 50 },
                    }),
                    new Paragraph({
                      children: [
                        new TextRun({
                          text: exp.suggested || "",
                          size: 22,
                        }),
                      ],
                      spacing: { after: 150 },
                    }),
                  ]),
                ]
              : []),
            ...(keywordsFound && keywordsFound.length > 0
              ? [
                  new Paragraph({
                    text: "Palavras-Chave de Destaque (ATS)",
                    heading: HeadingLevel.HEADING_2,
                    spacing: { before: 200, after: 100 },
                  }),
                  new Paragraph({
                    children: [
                      new TextRun({
                        text: keywordsFound.join(" • "),
                        italics: true,
                        size: 20,
                      }),
                    ],
                    spacing: { after: 200 },
                  }),
                ]
              : []),
          ],
        },
      ],
    });

    const buffer = await Packer.toBuffer(doc);

    return new NextResponse(new Uint8Array(buffer), {
      status: 200,
      headers: {
        "Content-Type": "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
        "Content-Disposition": `attachment; filename="curriculo-otimizado.docx"`,
      },
    });
  } catch (error) {
    console.error("Erro ao gerar DOCX:", error);
    return NextResponse.json({ error: "Falha ao gerar arquivo DOCX" }, { status: 500 });
  }
}
