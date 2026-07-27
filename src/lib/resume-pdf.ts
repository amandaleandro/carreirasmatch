import { PDFDocument, StandardFonts, rgb } from "pdf-lib";
import type { StructuredResume } from "@/lib/groq";

export async function renderResumePdf(input: {
  title?: string;
  summary?: string;
  experienceSuggestions?: { role?: string; company?: string; suggested?: string }[];
  keywordsFound?: string[];
  resumeStructured?: StructuredResume | null;
  resumeText?: string;
}): Promise<Uint8Array> {
  const { title, summary, experienceSuggestions = [], keywordsFound = [], resumeStructured, resumeText } = input;
  const pdf = await PDFDocument.create();
  const font = await pdf.embedFont(StandardFonts.Helvetica);
  const bold = await pdf.embedFont(StandardFonts.HelveticaBold);
  const muted = rgb(0.35, 0.4, 0.48);
  const ink = rgb(0.08, 0.12, 0.18);
  const accent = rgb(0.08, 0.32, 0.8);
  const margin = 48;
  const width = 595 - margin * 2;
  let page = pdf.addPage([595, 842]);
  let y = 790;

  function wrap(value: string, size: number, face = font) {
    const lines: string[] = [];
    let line = "";
    for (const word of value.split(/\s+/).filter(Boolean)) {
      const next = line ? `${line} ${word}` : word;
      if (face.widthOfTextAtSize(next, size) > width && line) {
        lines.push(line);
        line = word;
      } else line = next;
    }
    if (line) lines.push(line);
    return lines;
  }
  function ensure(space = 20) {
    if (y - space < 48) {
      page = pdf.addPage([595, 842]);
      y = 790;
    }
  }
  function paragraph(value: string, size = 10, face = font, color = ink, gap = 8) {
    for (const line of wrap(value, size, face)) {
      ensure(size + 4);
      page.drawText(line, { x: margin, y, size, font: face, color });
      y -= size + 4;
    }
    y -= gap;
  }
  function section(value: string) {
    ensure(26);
    y -= 8;
    page.drawText(value.toUpperCase(), { x: margin, y, size: 11, font: bold, color: accent });
    y -= 7;
    page.drawLine({ start: { x: margin, y }, end: { x: margin + width, y }, thickness: 0.8, color: accent });
    y -= 16;
  }

  const contact = resumeStructured?.contact;
  page.drawText(contact?.name || title || "Currículo", { x: margin, y, size: 22, font: bold, color: ink });
  y -= 28;
  if (contact) {
    paragraph(
      [contact.email, contact.phone, contact.location, contact.linkedin, contact.github, contact.portfolio]
        .filter(Boolean)
        .join(" • "),
      9,
      font,
      muted,
      16,
    );
  }

  if (summary) {
    section("Resumo Profissional");
    paragraph(summary, 10, font, ink, 12);
  }
  if (resumeStructured?.experiences?.length) {
    section("Experiência Profissional");
    for (const experience of resumeStructured.experiences) {
      const suggestion = experienceSuggestions.find(
        (item) => item.role === experience.role && item.company === experience.company,
      )?.suggested;
      paragraph(`${experience.role || "Cargo"} — ${experience.company || "Empresa"}`, 11, bold, ink, 2);
      if (experience.period) paragraph(experience.period, 9, font, muted, 2);
      paragraph(suggestion || experience.description || "", 10, font, ink, 10);
    }
  } else if (resumeText) {
    section("Currículo");
    paragraph(resumeText, 10, font, ink, 12);
  }
  if (resumeStructured?.education?.length) {
    section("Formação Acadêmica");
    for (const item of resumeStructured.education) {
      paragraph(
        `${item.degree || "Formação"} — ${item.institution || "Instituição"}${item.period ? ` (${item.period})` : ""}`,
        10,
        font,
        ink,
        8,
      );
    }
  }
  if (resumeStructured?.skills?.length) {
    section("Competências e Habilidades");
    paragraph(resumeStructured.skills.join(" • "), 10, font, ink, 10);
  }
  if (resumeStructured?.languages?.length) {
    section("Idiomas");
    paragraph(resumeStructured.languages.map((item) => `${item.language} (${item.level})`).join(" • "), 10, font, ink, 10);
  }
  if (resumeStructured?.certifications?.length) {
    section("Certificações e Cursos");
    paragraph(resumeStructured.certifications.join(" • "), 10, font, ink, 10);
  }
  if (keywordsFound.length) {
    section("Palavras-Chave ATS");
    paragraph(keywordsFound.join(" • "), 10, font, ink, 10);
  }

  // Rede de segurança: se a extração estruturada veio pobre (sem formação, skills,
  // idiomas nem certificações), o PDF acima fica só com resumo/experiências otimizadas
  // e perde dados do currículo original. Anexa o texto bruto pra ninguém enviar um
  // currículo incompleto pra vaga.
  const isSparse =
    !resumeStructured?.education?.length &&
    !resumeStructured?.skills?.length &&
    !resumeStructured?.languages?.length &&
    !resumeStructured?.certifications?.length;
  if (resumeStructured && isSparse && resumeText) {
    section("Currículo Original (referência completa)");
    paragraph(resumeText, 9.5, font, muted, 10);
  }

  return pdf.save();
}
