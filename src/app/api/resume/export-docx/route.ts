import { NextRequest, NextResponse } from "next/server";
import { Document, Packer, Paragraph, TextRun, HeadingLevel, AlignmentType } from "docx";
import type { StructuredResume } from "@/lib/groq";

function heading(text: string) {
  return new Paragraph({ text, heading: HeadingLevel.HEADING_2, spacing: { before: 240, after: 100 } });
}

function text(text: string, after = 120) {
  return new Paragraph({ children: [new TextRun({ text, size: 22 })], spacing: { after } });
}

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
    const { title, summary, experienceSuggestions = [], keywordsFound = [], resumeStructured, resumeText } = body;
    const contact = resumeStructured?.contact;
    const suggestionFor = (role: string, company: string) =>
      experienceSuggestions.find((item) => item.role === role && item.company === company)?.suggested;

    const children = resumeStructured
      ? [
          ...(contact
            ? [text([contact.name, contact.email, contact.phone, contact.location, contact.linkedin, contact.github, contact.portfolio].filter(Boolean).join("  •  "), 220)]
            : []),
          ...(summary ? [heading("Resumo Profissional"), text(summary, 180)] : []),
          ...(resumeStructured.experiences?.length
            ? [
                heading("Experiência Profissional"),
                ...resumeStructured.experiences.flatMap((experience) => [
                  new Paragraph({
                    children: [new TextRun({ text: `${experience.role || "Cargo"} — ${experience.company || "Empresa"}`, bold: true, size: 24 })],
                    spacing: { before: 120, after: 40 },
                  }),
                  text(suggestionFor(experience.role, experience.company) || experience.description || "", 70),
                  ...(experience.period ? [text(experience.period, 120)] : []),
                ]),
              ]
            : []),
          ...(resumeStructured.education?.length
            ? [heading("Formação Acadêmica"), ...resumeStructured.education.flatMap((item) => [
                new Paragraph({ children: [new TextRun({ text: `${item.degree || "Formação"} — ${item.institution || "Instituição"}`, bold: true, size: 22 })], spacing: { after: 40 } }),
                ...(item.period ? [text(item.period, 100)] : []),
              ])]
            : []),
          ...(resumeStructured.skills?.length ? [heading("Competências e Habilidades"), text(resumeStructured.skills.join(" • "), 140)] : []),
          ...(resumeStructured.languages?.length ? [heading("Idiomas"), text(resumeStructured.languages.map((item) => `${item.language} (${item.level})`).join(" • "), 140)] : []),
          ...(resumeStructured.certifications?.length ? [heading("Certificações e Cursos"), text(resumeStructured.certifications.join(" • "), 140)] : []),
        ]
      : [
          ...(resumeText ? [heading("Currículo"), text(resumeText, 300)] : [heading("Resumo Profissional Otimizado"), text(summary || "Não informado", 300)]),
          ...(experienceSuggestions.length > 0
            ? [
                heading("Experiências Profissionais Reformuladas"),
                ...experienceSuggestions.flatMap((exp) => [
                  new Paragraph({ children: [new TextRun({ text: `${exp.role || "Cargo"} — ${exp.company || "Empresa"}`, bold: true, size: 24 })], spacing: { before: 150, after: 50 } }),
                  text(exp.suggested || "", 150),
                ]),
              ]
            : []),
        ];

    if (keywordsFound.length > 0) {
      children.push(heading("Palavras-Chave de Destaque (ATS)"), text(keywordsFound.join(" • "), 200));
    }

    const doc = new Document({ sections: [{ properties: {}, children: [
      new Paragraph({ text: contact?.name || title || "Currículo Otimizado — CarreirasMatch", heading: HeadingLevel.HEADING_1, alignment: AlignmentType.CENTER, spacing: { after: 300 } }),
      ...children,
    ] }] });
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
