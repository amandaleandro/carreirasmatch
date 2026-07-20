"use client";

import { useState } from "react";
import Link from "next/link";
import { CircularScore } from "@/components/circular-score";
import type { ExperienceSuggestion, AtsChecklistItem } from "@/components/analysis-display";
import type {
  StructuredResume,
  ResumeContact,
  ResumeEducationEntry,
  ResumeLanguageEntry,
} from "@/lib/groq";

function PencilIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" className={className}>
      <path d="M4 20l.9-3.6L16.4 5 19 7.6 7.6 19 4 20Z" stroke="currentColor" strokeWidth="1.6" strokeLinejoin="round" />
    </svg>
  );
}
function DownloadIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" className={className}>
      <path d="M12 4v11m0 0 4-4m-4 4-4-4" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M5 19h14" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
    </svg>
  );
}
function UploadIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" className={className}>
      <path d="M12 15V4m0 0 4 4m-4-4-4 4" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M5 19h14" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
    </svg>
  );
}
function CopyIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" className={className}>
      <rect x="9" y="9" width="11" height="11" rx="1.5" stroke="currentColor" strokeWidth="1.6" />
      <path d="M5 15V5a1 1 0 0 1 1-1h10" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
    </svg>
  );
}
function StarIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" className={className}>
      <path d="M12 3.5 14.5 9l6 .8-4.3 4.1 1 5.9L12 17l-5.2 2.8 1-5.9L3.5 9.8l6-.8Z" stroke="currentColor" strokeWidth="1.6" strokeLinejoin="round" />
    </svg>
  );
}
function InfoIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" className={className}>
      <circle cx="12" cy="12" r="9" stroke="currentColor" strokeWidth="1.6" />
      <path d="M12 11v5.5M12 8v.01" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
    </svg>
  );
}
function XIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" className={className}>
      <path d="M6 6l12 12M18 6 6 18" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
    </svg>
  );
}
function PlusIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" className={className}>
      <path d="M12 5v14M5 12h14" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
    </svg>
  );
}
function StatusIcon({ status, className }: { status: AtsChecklistItem["status"]; className?: string }) {
  if (status === "pass") {
    return (
      <svg viewBox="0 0 24 24" className={className}>
        <circle cx="12" cy="12" r="10" fill="#22c55e" />
        <path d="m8 12.5 2.5 2.5 5.5-6" stroke="#fff" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" fill="none" />
      </svg>
    );
  }
  if (status === "warning") {
    return (
      <svg viewBox="0 0 24 24" className={className}>
        <circle cx="12" cy="12" r="10" fill="#f59e0b" />
        <path d="M12 7.5v5.5M12 16v.01" stroke="#fff" strokeWidth="2" strokeLinecap="round" fill="none" />
      </svg>
    );
  }
  return (
    <svg viewBox="0 0 24 24" className={className}>
      <circle cx="12" cy="12" r="10" fill="#ef4444" />
      <path d="m9 9 6 6m0-6-6 6" stroke="#fff" strokeWidth="2" strokeLinecap="round" fill="none" />
    </svg>
  );
}

function TagEditor({
  label,
  items,
  onChange,
  placeholder,
}: {
  label: string;
  items: string[];
  onChange: (items: string[]) => void;
  placeholder: string;
}) {
  const [draft, setDraft] = useState("");

  function addItem() {
    const value = draft.trim();
    if (!value) return;
    onChange([...items, value]);
    setDraft("");
  }

  return (
    <div>
      <p className="text-sm font-medium mb-2">{label}</p>
      <div className="flex flex-wrap gap-2 mb-2">
        {items.map((item, i) => (
          <span
            key={`${item}-${i}`}
            className="flex items-center gap-1.5 text-xs rounded-full pl-3 pr-1.5 py-1 bg-neutral-100 dark:bg-neutral-800 text-neutral-700 dark:text-neutral-300"
          >
            {item}
            <button
              type="button"
              onClick={() => onChange(items.filter((_, idx) => idx !== i))}
              className="text-neutral-400 hover:text-neutral-700 dark:hover:text-neutral-100"
              aria-label={`Remover ${item}`}
            >
              <XIcon className="h-3 w-3" />
            </button>
          </span>
        ))}
        {items.length === 0 && (
          <span className="text-xs text-neutral-400">Nenhum item ainda.</span>
        )}
      </div>
      <div className="flex gap-2">
        <input
          value={draft}
          onChange={(e) => setDraft(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter") {
              e.preventDefault();
              addItem();
            }
          }}
          placeholder={placeholder}
          className="flex-1 rounded-lg border border-neutral-200 dark:border-white/10 bg-white dark:bg-white/[0.03] px-2.5 py-1.5 text-sm outline-none focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 transition-colors"
        />
        <button
          type="button"
          onClick={addItem}
          className="rounded-lg border border-neutral-200 dark:border-neutral-700 px-2.5 hover:bg-neutral-50 dark:hover:bg-neutral-900 transition-colors"
          aria-label={`Adicionar em ${label}`}
        >
          <PlusIcon className="h-4 w-4" />
        </button>
      </div>
    </div>
  );
}

type MergedExperience = {
  role: string;
  company: string;
  period: string;
  description: string;
  suggestionIndex: number | null;
};

export function ResumeOptimizer({
  analysisId,
  jobTitle,
  candidateName,
  currentSummary,
  suggestedSummary,
  experienceSuggestions,
  experienceOverrides,
  resumeStructured,
  atsChecklist,
  keywordsFound,
  keywordsMissing,
  atsScore,
  previousAtsScore,
  hasPdf,
  pdfFileName,
  hasBaseline = true,
}: {
  analysisId: string;
  jobTitle: string;
  candidateName: string;
  currentSummary: string;
  suggestedSummary: string;
  experienceSuggestions: ExperienceSuggestion[];
  experienceOverrides: Record<number, string>;
  resumeStructured: StructuredResume;
  atsChecklist: AtsChecklistItem[];
  keywordsFound: string[];
  keywordsMissing: string[];
  atsScore: number;
  previousAtsScore: number | null;
  hasPdf: boolean;
  pdfFileName: string;
  /** false for resumes generated from scratch, which have no job to score against yet. */
  hasBaseline?: boolean;
}) {
  const [summary, setSummary] = useState(suggestedSummary);
  const [summaryApplied, setSummaryApplied] = useState(false);

  const initialMerged: MergedExperience[] =
    resumeStructured.experiences.length > 0
      ? resumeStructured.experiences.map((exp) => {
          const matchIdx = experienceSuggestions.findIndex(
            (s) =>
              s.role.trim().toLowerCase() === exp.role.trim().toLowerCase() &&
              s.company.trim().toLowerCase() === exp.company.trim().toLowerCase()
          );
          return {
            role: exp.role,
            company: exp.company,
            period: exp.period,
            description:
              matchIdx >= 0 ? experienceOverrides[matchIdx] ?? exp.description : exp.description,
            suggestionIndex: matchIdx >= 0 ? matchIdx : null,
          };
        })
      : experienceSuggestions.map((exp, i) => ({
          role: exp.role,
          company: exp.company,
          period: "",
          description: experienceOverrides[i] ?? exp.suggested,
          suggestionIndex: i,
        }));

  const [experiences, setExperiences] = useState<MergedExperience[]>(initialMerged);
  const [editingIndex, setEditingIndex] = useState<number | null>(null);

  const [contact, setContact] = useState<ResumeContact>(resumeStructured.contact);
  const [education, setEducation] = useState<ResumeEducationEntry[]>(resumeStructured.education);
  const [skills, setSkills] = useState<string[]>(resumeStructured.skills);
  const [languages, setLanguages] = useState<ResumeLanguageEntry[]>(resumeStructured.languages);
  const [certifications, setCertifications] = useState<string[]>(resumeStructured.certifications);

  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [copied, setCopied] = useState(false);

  const [pdfAttached, setPdfAttached] = useState(hasPdf);
  const [pdfName, setPdfName] = useState(pdfFileName);
  const [uploadingPdf, setUploadingPdf] = useState(false);
  const [pdfError, setPdfError] = useState<string | null>(null);

  function currentResumeStructured(): StructuredResume {
    return {
      contact,
      education,
      skills,
      languages,
      certifications,
      experiences: experiences.map(({ role, company, period, description }) => ({
        role,
        company,
        period,
        description,
      })),
    };
  }

  async function persist(overrides: {
    summary?: string;
    experiences?: Record<number, string>;
  }) {
    setSaving(true);
    try {
      const experienceOverridesToSave: Record<number, string> = {};
      experiences.forEach((exp) => {
        if (exp.suggestionIndex !== null) {
          experienceOverridesToSave[exp.suggestionIndex] = exp.description;
        }
      });
      await fetch(`/api/resume/${analysisId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          summary,
          experiences: experienceOverridesToSave,
          resumeStructured: currentResumeStructured(),
          ...overrides,
        }),
      });
      setSaved(true);
      setTimeout(() => setSaved(false), 2000);
    } finally {
      setSaving(false);
    }
  }

  function applySummary() {
    setSummaryApplied(true);
    persist({ summary });
  }

  function contactLine(): string {
    return [contact.email, contact.phone, contact.location, contact.linkedin, contact.github, contact.portfolio]
      .filter((v) => v && v.trim())
      .join(" · ");
  }

  function buildPlainText() {
    const lines = [candidateName || "CANDIDATO", contactLine(), "", "RESUMO PROFISSIONAL", summary, "", "EXPERIÊNCIA PROFISSIONAL"];
    experiences.forEach((exp) => {
      lines.push(`${exp.role} - ${exp.company}${exp.period ? ` (${exp.period})` : ""}`);
      lines.push(exp.description);
      lines.push("");
    });
    if (education.length > 0) {
      lines.push("FORMAÇÃO ACADÊMICA");
      education.forEach((ed) => {
        lines.push(`${ed.degree} - ${ed.institution}${ed.period ? ` (${ed.period})` : ""}`);
      });
      lines.push("");
    }
    if (skills.length > 0) {
      lines.push("HABILIDADES");
      lines.push(skills.join(", "));
      lines.push("");
    }
    if (languages.length > 0) {
      lines.push("IDIOMAS");
      languages.forEach((lg) => lines.push(`${lg.language} - ${lg.level}`));
      lines.push("");
    }
    if (certifications.length > 0) {
      lines.push("CERTIFICAÇÕES");
      certifications.forEach((c) => lines.push(`• ${c}`));
    }
    return lines.join("\n");
  }

  async function handleUploadPdf(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    e.target.value = "";
    if (!file) return;

    setPdfError(null);
    if (file.type !== "application/pdf") {
      setPdfError("Envie um arquivo em PDF.");
      return;
    }
    if (file.size > 5 * 1024 * 1024) {
      setPdfError("O arquivo deve ter no máximo 5MB.");
      return;
    }

    setUploadingPdf(true);
    try {
      const formData = new FormData();
      formData.append("file", file);
      const res = await fetch(`/api/resume/${analysisId}/pdf`, {
        method: "POST",
        body: formData,
      });
      const data = await res.json();
      if (!res.ok) {
        setPdfError(data.error ?? "Erro ao enviar o PDF.");
        return;
      }
      setPdfAttached(true);
      setPdfName(data.fileName);
    } finally {
      setUploadingPdf(false);
    }
  }

  async function handleCopy() {
    await navigator.clipboard.writeText(buildPlainText());
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }

  async function handleDownloadPdf() {
    const { PDFDocument, StandardFonts, rgb } = await import("pdf-lib");
    const doc = await PDFDocument.create();
    const PAGE_W = 595;
    const PAGE_H = 842;
    let page = doc.addPage([PAGE_W, PAGE_H]);
    const font = await doc.embedFont(StandardFonts.Helvetica);
    const bold = await doc.embedFont(StandardFonts.HelveticaBold);
    const oblique = await doc.embedFont(StandardFonts.HelveticaOblique);
    const margin = 54;
    const top = PAGE_H - 56;
    let y = top;
    const maxWidth = PAGE_W - margin * 2;
    const accent = rgb(0.145, 0.29, 0.62);
    const accentLight = rgb(0.91, 0.94, 0.98);
    const ink = rgb(0.14, 0.14, 0.16);
    const muted = rgb(0.45, 0.45, 0.49);
    const chipBg = rgb(0.95, 0.95, 0.96);
    const chipText = rgb(0.3, 0.3, 0.33);

    function wrap(text: string, size: number, useFont = font, width = maxWidth) {
      const words = text.split(/\s+/).filter(Boolean);
      const lines: string[] = [];
      let current = "";
      for (const word of words) {
        const test = current ? `${current} ${word}` : word;
        if (useFont.widthOfTextAtSize(test, size) > width) {
          if (current) lines.push(current);
          current = word;
        } else {
          current = test;
        }
      }
      if (current) lines.push(current);
      return lines;
    }

    function newPage() {
      page = doc.addPage([PAGE_W, PAGE_H]);
      y = top;
    }

    function ensureSpace(needed: number) {
      if (y - needed < margin) newPage();
    }

    function drawParagraph(text: string, size: number, useFont = font, color = ink, gapAfter = 12, x = margin, width = maxWidth) {
      const lines = wrap(text, size, useFont, width);
      for (const line of lines) {
        ensureSpace(size + 4);
        page.drawText(line, { x, y, size, font: useFont, color });
        y -= size + 4;
      }
      y -= gapAfter;
    }

    // Splits a description into bullet-like sentences when it reads as more than one idea.
    function drawBullets(text: string, size = 10, color = ink, gapAfter = 10) {
      const sentences = text
        .split(/(?<=[.!?])\s+(?=[A-ZÀ-Ú])/)
        .map((s) => s.trim())
        .filter(Boolean);
      const items = sentences.length > 1 ? sentences : [text];
      items.forEach((item, i) => {
        const lines = wrap(item, size, font, maxWidth - 12);
        lines.forEach((line, li) => {
          ensureSpace(size + 4);
          if (li === 0) {
            page.drawText("•", { x: margin, y, size, font: bold, color: accent });
          }
          page.drawText(line, { x: margin + 12, y, size, font, color });
          y -= size + 4;
        });
        if (i < items.length - 1) y -= 2;
      });
      y -= gapAfter;
    }

    function drawSectionTitle(title: string) {
      ensureSpace(26);
      y -= 6;
      page.drawText(title.toUpperCase(), { x: margin, y, size: 11.5, font: bold, color: accent });
      y -= 7;
      page.drawLine({
        start: { x: margin, y },
        end: { x: margin + maxWidth, y },
        thickness: 1,
        color: accent,
      });
      y -= 16;
    }

    // Wraps a row of pill-shaped tags, moving to the next line/page as needed.
    function drawChips(items: string[], size = 9.5) {
      const padX = 8;
      const chipH = size + 10;
      let x = margin;
      ensureSpace(chipH + 4);
      items.forEach((item) => {
        const w = font.widthOfTextAtSize(item, size) + padX * 2;
        if (x + w > margin + maxWidth) {
          x = margin;
          y -= chipH + 6;
          ensureSpace(chipH + 4);
        }
        page.drawRectangle({ x, y: y - chipH + 4, width: w, height: chipH, color: chipBg });
        page.drawText(item, { x: x + padX, y: y - chipH + 4 + (chipH - size) / 2 + 1, size, font, color: chipText });
        x += w + 6;
      });
      y -= chipH + 14;
    }

    // Header
    page.drawRectangle({ x: 0, y: PAGE_H - 118, width: PAGE_W, height: 118, color: accentLight });
    y = PAGE_H - 60;
    drawParagraph(candidateName || "Candidato", 22, bold, rgb(0.04, 0.04, 0.07), 4);
    const contactText = contactLine();
    if (contactText) drawParagraph(contactText, 9.5, font, muted, 4);
    drawParagraph(`Candidatura: ${jobTitle}`, 9.5, oblique, accent, 0);
    y = PAGE_H - 118 - 26;

    if (summary.trim()) {
      drawSectionTitle("Resumo Profissional");
      drawParagraph(summary, 10, font, ink, 18);
    }

    if (experiences.length > 0) {
      drawSectionTitle("Experiência Profissional");
      experiences.forEach((exp, i) => {
        ensureSpace(15);
        page.drawText(`${exp.role} - ${exp.company}`, { x: margin, y, size: 11, font: bold, color: ink });
        if (exp.period) {
          const label = exp.period;
          const w = font.widthOfTextAtSize(label, 9);
          page.drawText(label, { x: margin + maxWidth - w, y, size: 9, font, color: muted });
        }
        y -= 16;
        drawBullets(exp.description, 10, ink, i === experiences.length - 1 ? 4 : 14);
      });
      y -= 4;
    }

    if (education.length > 0) {
      drawSectionTitle("Formação Acadêmica");
      education.forEach((ed) => {
        ensureSpace(14);
        page.drawText(ed.degree, { x: margin, y, size: 10.5, font: bold, color: ink });
        if (ed.period) {
          const w = font.widthOfTextAtSize(ed.period, 9);
          page.drawText(ed.period, { x: margin + maxWidth - w, y, size: 9, font, color: muted });
        }
        y -= 14;
        drawParagraph(ed.institution, 10, font, muted, 8);
      });
      y -= 6;
    }

    if (skills.length > 0) {
      drawSectionTitle("Habilidades");
      drawChips(skills);
    }

    if (languages.length > 0) {
      drawSectionTitle("Idiomas");
      drawChips(languages.map((lg) => `${lg.language} · ${lg.level}`));
    }

    if (certifications.length > 0) {
      drawSectionTitle("Certificações");
      certifications.forEach((c, i) => {
        const lines = wrap(c, 10, font, maxWidth - 12);
        lines.forEach((line, li) => {
          ensureSpace(14);
          if (li === 0) page.drawText("•", { x: margin, y, size: 10, font: bold, color: accent });
          page.drawText(line, { x: margin + 12, y, size: 10, font, color: ink });
          y -= 14;
        });
        if (i < certifications.length - 1) y -= 2;
      });
    }

    const pages = doc.getPages();
    pages.forEach((p, i) => {
      const label = `Página ${i + 1} de ${pages.length}`;
      const w = font.widthOfTextAtSize(label, 8);
      p.drawText(label, { x: PAGE_W - margin - w, y: 28, size: 8, font, color: muted });
    });

    const bytes = await doc.save();
    const blob = new Blob([bytes.slice().buffer], { type: "application/pdf" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `curriculo-otimizado-${jobTitle.replace(/\s+/g, "-").toLowerCase()}.pdf`;
    a.click();
    URL.revokeObjectURL(url);
  }

  const scoreDelta = previousAtsScore !== null ? atsScore - previousAtsScore : null;

  return (
    <div className="px-4 md:px-8 py-8 max-w-6xl mx-auto w-full">
      <div className="mb-8">
        <span className="inline-flex items-center gap-1.5 text-[11px] font-semibold uppercase tracking-wider rounded-full px-3 py-1 mb-3 bg-blue-50 text-blue-600 border border-blue-200 dark:bg-blue-950/40 dark:text-blue-300 dark:border-blue-900">
          Editor de currículo
        </span>
        <h1 className="text-2xl md:text-3xl font-bold tracking-tight">Otimize seu currículo</h1>
        <p className="text-neutral-600 dark:text-neutral-400 mt-2 max-w-2xl">
          Edite todas as seções do seu currículo sem perder nenhuma informação
          do arquivo original, e gere uma versão bonita e otimizada para passar
          nas análises automáticas dos recrutadores.
        </p>
        <p className="text-sm text-neutral-500 mt-2">
          {hasBaseline ? (
            <>
              Otimizando para: <span className="font-medium text-neutral-700 dark:text-neutral-300">{jobTitle}</span>{" "}
              · <Link href={`/report/${analysisId}`} className="text-blue-600 dark:text-blue-400 hover:underline">Voltar para a vaga</Link>{" "}
              · <Link href="/history" className="text-blue-600 dark:text-blue-400 hover:underline">Trocar vaga</Link>
            </>
          ) : (
            <>
              Currículo criado do zero ·{" "}
              <Link href="/analise" className="text-blue-600 dark:text-blue-400 hover:underline">
                Analisar contra uma vaga
              </Link>
            </>
          )}
        </p>
      </div>

      <div className="rounded-2xl border border-neutral-200/80 dark:border-neutral-800 bg-white dark:bg-neutral-950 p-6 mb-6 shadow-sm shadow-slate-900/5 flex flex-wrap items-center justify-between gap-4">
        <div>
          <h2 className="font-semibold">Currículo em PDF</h2>
          <p className="text-sm text-neutral-600 dark:text-neutral-400 mt-1">
            {pdfAttached
              ? `PDF anexado: ${pdfName}`
              : "Nenhum PDF anexado ainda. Envie o arquivo original do seu currículo."}
          </p>
          {pdfError && <p className="text-sm text-red-500 mt-1">{pdfError}</p>}
        </div>
        <div className="flex items-center gap-3 shrink-0">
          {pdfAttached && (
            <a
              href={`/api/resume/${analysisId}/pdf`}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-1.5 rounded-xl border border-neutral-200 dark:border-neutral-700 font-semibold px-4 py-2.5 text-sm hover:bg-neutral-50 dark:hover:bg-neutral-900 transition-colors"
            >
              <DownloadIcon className="h-4 w-4" /> Ver PDF anexado
            </a>
          )}
          <label className="flex items-center gap-1.5 rounded-xl border border-neutral-200 dark:border-neutral-700 font-semibold px-4 py-2.5 text-sm hover:bg-neutral-50 dark:hover:bg-neutral-900 transition-colors cursor-pointer">
            <UploadIcon className="h-4 w-4" />
            {uploadingPdf ? "Enviando..." : pdfAttached ? "Substituir PDF" : "Enviar PDF"}
            <input
              type="file"
              accept="application/pdf"
              className="hidden"
              disabled={uploadingPdf}
              onChange={handleUploadPdf}
            />
          </label>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-start">
        <div className="lg:col-span-2 space-y-6">
          <div className="rounded-2xl border border-neutral-200/80 dark:border-neutral-800 bg-white dark:bg-neutral-950 p-6 shadow-sm shadow-slate-900/5">
            <h2 className="font-semibold mb-4">Dados de contato</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {(
                [
                  ["name", "Nome completo"],
                  ["email", "E-mail"],
                  ["phone", "Telefone"],
                  ["location", "Cidade/UF"],
                  ["linkedin", "LinkedIn"],
                  ["github", "GitHub"],
                  ["portfolio", "Portfólio"],
                ] as [keyof ResumeContact, string][]
              ).map(([key, label]) => (
                <label key={key} className="block">
                  <span className="text-xs font-medium text-neutral-500">{label}</span>
                  <input
                    value={contact[key]}
                    onChange={(e) => setContact((prev) => ({ ...prev, [key]: e.target.value }))}
                    className="mt-1 w-full rounded-lg border border-neutral-200 dark:border-white/10 bg-white dark:bg-white/[0.03] px-2.5 py-1.5 text-sm outline-none focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 transition-colors"
                  />
                </label>
              ))}
            </div>
          </div>

          <div className="rounded-2xl border border-neutral-200/80 dark:border-neutral-800 bg-white dark:bg-neutral-950 p-6 shadow-sm shadow-slate-900/5">
            <h2 className="font-semibold mb-4">Resumo profissional</h2>
            <p className="text-xs font-semibold uppercase tracking-wide text-neutral-500 mb-1.5">Atual</p>
            <div className="rounded-lg bg-neutral-50 dark:bg-neutral-900 p-3 text-sm text-neutral-600 dark:text-neutral-400">
              {currentSummary}
            </div>
            <div className="flex justify-center my-2 text-neutral-400">↓</div>
            <p className="text-xs font-semibold uppercase tracking-wide text-blue-600 dark:text-blue-400 mb-1.5">
              Sugerido
            </p>
            <div className="rounded-lg border border-blue-200 dark:border-blue-900 bg-blue-50 dark:bg-blue-950/30 p-3">
              <textarea
                value={summary}
                onChange={(e) => {
                  setSummary(e.target.value);
                  setSummaryApplied(false);
                }}
                rows={4}
                className="w-full bg-transparent text-sm resize-none outline-none"
              />
              <div className="flex justify-end mt-2">
                <button
                  type="button"
                  onClick={applySummary}
                  className="rounded-lg bg-blue-600 text-white text-sm font-semibold px-4 py-1.5 hover:bg-blue-700 transition-colors"
                >
                  {summaryApplied ? "Sugestão aplicada ✓" : "Aplicar sugestão"}
                </button>
              </div>
            </div>
          </div>

          <div className="rounded-2xl border border-neutral-200/80 dark:border-neutral-800 bg-white dark:bg-neutral-950 p-6 shadow-sm shadow-slate-900/5">
            <h2 className="font-semibold mb-4">Experiências e projetos</h2>
            <div className="space-y-4">
              {experiences.map((exp, i) => (
                <div key={i} className="flex gap-3 rounded-lg border border-neutral-200 dark:border-neutral-800 p-3">
                  <span className="h-8 w-8 rounded-md bg-neutral-100 dark:bg-neutral-800 flex items-center justify-center shrink-0 text-neutral-500">
                    <StarIcon className="h-4 w-4" />
                  </span>
                  <div className="min-w-0 flex-1">
                    <p className="text-sm font-medium">
                      {exp.role} - {exp.company}
                      {exp.period && <span className="text-neutral-400 font-normal"> · {exp.period}</span>}
                    </p>
                    {editingIndex === i ? (
                      <div className="mt-1.5">
                        <textarea
                          value={exp.description}
                          onChange={(e) =>
                            setExperiences((prev) =>
                              prev.map((p, idx) => (idx === i ? { ...p, description: e.target.value } : p))
                            )
                          }
                          rows={2}
                          className="w-full rounded-md border border-blue-300 dark:border-blue-800 bg-blue-50 dark:bg-blue-950/30 px-2 py-1.5 text-xs outline-none"
                        />
                        <div className="flex justify-end gap-2 mt-1.5">
                          <button
                            type="button"
                            onClick={() => setEditingIndex(null)}
                            className="text-xs text-neutral-500 hover:underline"
                          >
                            Cancelar
                          </button>
                          <button
                            type="button"
                            onClick={() => {
                              setEditingIndex(null);
                              persist({});
                            }}
                            className="text-xs font-medium text-blue-600 dark:text-blue-400 hover:underline"
                          >
                            Salvar
                          </button>
                        </div>
                      </div>
                    ) : (
                      <p className="text-xs text-neutral-600 dark:text-neutral-400 mt-1">
                        <span className="font-medium">Descrição:</span> {exp.description}
                      </p>
                    )}
                    {exp.suggestionIndex !== null &&
                      editingIndex !== i &&
                      experienceSuggestions[exp.suggestionIndex].suggested.trim() !== exp.description.trim() && (
                        <div className="mt-2 rounded-md border border-blue-200 dark:border-blue-900 bg-blue-50 dark:bg-blue-950/30 p-2">
                          <p className="text-xs text-blue-700 dark:text-blue-400">
                            <span className="font-medium">Sugestão:</span>{" "}
                            {experienceSuggestions[exp.suggestionIndex].suggested}
                          </p>
                          <div className="flex justify-end mt-1.5">
                            <button
                              type="button"
                              onClick={() => {
                                const suggestion = experienceSuggestions[exp.suggestionIndex!].suggested;
                                setExperiences((prev) =>
                                  prev.map((p, idx) => (idx === i ? { ...p, description: suggestion } : p))
                                );
                                persist({});
                              }}
                              className="text-xs font-medium text-blue-600 dark:text-blue-400 hover:underline"
                            >
                              Aplicar sugestão
                            </button>
                          </div>
                        </div>
                      )}
                  </div>
                  {editingIndex !== i && (
                    <button
                      type="button"
                      onClick={() => setEditingIndex(i)}
                      className="text-neutral-400 hover:text-neutral-600 dark:hover:text-neutral-200 shrink-0"
                      aria-label="Editar sugestão"
                    >
                      <PencilIcon className="h-4 w-4" />
                    </button>
                  )}
                </div>
              ))}
              {experiences.length === 0 && (
                <p className="text-sm text-neutral-500">
                  Nenhuma experiência disponível para esta análise.
                </p>
              )}
            </div>
          </div>

          <div className="rounded-2xl border border-neutral-200/80 dark:border-neutral-800 bg-white dark:bg-neutral-950 p-6 shadow-sm shadow-slate-900/5 space-y-5">
            <h2 className="font-semibold">Formação, habilidades e idiomas</h2>

            <div>
              <div className="flex items-center justify-between mb-2">
                <p className="text-sm font-medium">Formação acadêmica</p>
                <button
                  type="button"
                  onClick={() => setEducation((prev) => [...prev, { institution: "", degree: "", period: "" }])}
                  className="flex items-center gap-1 text-xs text-blue-600 dark:text-blue-400 hover:underline"
                >
                  <PlusIcon className="h-3.5 w-3.5" /> Adicionar
                </button>
              </div>
              <div className="space-y-2">
                {education.map((ed, i) => (
                  <div key={i} className="grid grid-cols-1 sm:grid-cols-[1fr_1fr_100px_auto] gap-2 items-center">
                    <input
                      value={ed.institution}
                      placeholder="Instituição"
                      onChange={(e) =>
                        setEducation((prev) => prev.map((p, idx) => (idx === i ? { ...p, institution: e.target.value } : p)))
                      }
                      className="rounded-lg border border-neutral-200 dark:border-white/10 bg-white dark:bg-white/[0.03] px-2.5 py-1.5 text-sm outline-none focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 transition-colors"
                    />
                    <input
                      value={ed.degree}
                      placeholder="Curso/grau"
                      onChange={(e) =>
                        setEducation((prev) => prev.map((p, idx) => (idx === i ? { ...p, degree: e.target.value } : p)))
                      }
                      className="rounded-lg border border-neutral-200 dark:border-white/10 bg-white dark:bg-white/[0.03] px-2.5 py-1.5 text-sm outline-none focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 transition-colors"
                    />
                    <input
                      value={ed.period}
                      placeholder="Período"
                      onChange={(e) =>
                        setEducation((prev) => prev.map((p, idx) => (idx === i ? { ...p, period: e.target.value } : p)))
                      }
                      className="rounded-lg border border-neutral-200 dark:border-white/10 bg-white dark:bg-white/[0.03] px-2.5 py-1.5 text-sm outline-none focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 transition-colors"
                    />
                    <button
                      type="button"
                      onClick={() => setEducation((prev) => prev.filter((_, idx) => idx !== i))}
                      className="text-neutral-400 hover:text-red-500 justify-self-start sm:justify-self-center"
                      aria-label="Remover formação"
                    >
                      <XIcon className="h-4 w-4" />
                    </button>
                  </div>
                ))}
                {education.length === 0 && <p className="text-xs text-neutral-400">Nenhuma formação adicionada.</p>}
              </div>
            </div>

            <TagEditor label="Habilidades" items={skills} onChange={setSkills} placeholder="Ex: Excel, SQL, Figma..." />

            <div>
              <div className="flex items-center justify-between mb-2">
                <p className="text-sm font-medium">Idiomas</p>
                <button
                  type="button"
                  onClick={() => setLanguages((prev) => [...prev, { language: "", level: "" }])}
                  className="flex items-center gap-1 text-xs text-blue-600 dark:text-blue-400 hover:underline"
                >
                  <PlusIcon className="h-3.5 w-3.5" /> Adicionar
                </button>
              </div>
              <div className="space-y-2">
                {languages.map((lg, i) => (
                  <div key={i} className="grid grid-cols-1 sm:grid-cols-[1fr_1fr_auto] gap-2 items-center">
                    <input
                      value={lg.language}
                      placeholder="Idioma"
                      onChange={(e) =>
                        setLanguages((prev) => prev.map((p, idx) => (idx === i ? { ...p, language: e.target.value } : p)))
                      }
                      className="rounded-lg border border-neutral-200 dark:border-white/10 bg-white dark:bg-white/[0.03] px-2.5 py-1.5 text-sm outline-none focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 transition-colors"
                    />
                    <input
                      value={lg.level}
                      placeholder="Nível"
                      onChange={(e) =>
                        setLanguages((prev) => prev.map((p, idx) => (idx === i ? { ...p, level: e.target.value } : p)))
                      }
                      className="rounded-lg border border-neutral-200 dark:border-white/10 bg-white dark:bg-white/[0.03] px-2.5 py-1.5 text-sm outline-none focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 transition-colors"
                    />
                    <button
                      type="button"
                      onClick={() => setLanguages((prev) => prev.filter((_, idx) => idx !== i))}
                      className="text-neutral-400 hover:text-red-500 justify-self-start sm:justify-self-center"
                      aria-label="Remover idioma"
                    >
                      <XIcon className="h-4 w-4" />
                    </button>
                  </div>
                ))}
                {languages.length === 0 && <p className="text-xs text-neutral-400">Nenhum idioma adicionado.</p>}
              </div>
            </div>

            <TagEditor
              label="Certificações"
              items={certifications}
              onChange={setCertifications}
              placeholder="Ex: AWS Cloud Practitioner..."
            />

            <div className="flex justify-end">
              <button
                type="button"
                onClick={() => persist({})}
                disabled={saving}
                className="text-sm font-medium text-blue-600 dark:text-blue-400 hover:underline disabled:opacity-50"
              >
                {saved ? "Salvo ✓" : saving ? "Salvando..." : "Salvar esta seção"}
              </button>
            </div>
          </div>

          <div className="rounded-2xl border border-neutral-200/80 dark:border-neutral-800 bg-white dark:bg-neutral-950 p-6 shadow-sm shadow-slate-900/5">
            <h2 className="font-semibold">Preview do currículo</h2>
            <div className="grid grid-cols-1 sm:grid-cols-[160px_1fr] gap-4 mt-4 items-start">
              <div className="rounded-lg border border-neutral-200 dark:border-neutral-800 bg-white p-3 text-[6px] leading-tight text-neutral-800 overflow-hidden h-44">
                <p className="text-[8px] font-bold">{(candidateName || contact.name).toUpperCase()}</p>
                <p className="text-neutral-500 mt-0.5 line-clamp-1">{contactLine()}</p>
                <p className="text-neutral-500 mt-1">Resumo profissional</p>
                <p className="mt-0.5 line-clamp-3">{summary}</p>
                <p className="text-neutral-500 mt-1.5">Experiência profissional</p>
                {experiences.slice(0, 2).map((exp, i) => (
                  <p key={i} className="mt-0.5 line-clamp-2">
                    {exp.role} - {exp.company}
                  </p>
                ))}
              </div>
              <div>
                <p className="text-sm text-neutral-600 dark:text-neutral-400">
                  Veja como seu currículo ficará para o recrutador. O preview e o
                  PDF final incluem contato, resumo, experiências, formação,
                  habilidades, idiomas e certificações, nada do currículo
                  original é perdido.
                </p>
                <div className="flex flex-wrap gap-3 mt-4">
                  <button
                    type="button"
                    onClick={handleDownloadPdf}
                    className="flex items-center gap-1.5 rounded-xl border border-neutral-200 dark:border-neutral-700 font-semibold px-4 py-2.5 text-sm hover:bg-neutral-50 dark:hover:bg-neutral-900 transition-colors"
                  >
                    <DownloadIcon className="h-4 w-4" /> Baixar PDF
                  </button>
                  <button
                    type="button"
                    onClick={handleCopy}
                    className="flex items-center gap-1.5 rounded-xl border border-neutral-200 dark:border-neutral-700 font-semibold px-4 py-2.5 text-sm hover:bg-neutral-50 dark:hover:bg-neutral-900 transition-colors"
                  >
                    <CopyIcon className="h-4 w-4" /> {copied ? "Copiado ✓" : "Copiar texto"}
                  </button>
                  <button
                    type="button"
                    onClick={() => persist({})}
                    disabled={saving}
                    className="flex items-center gap-1.5 rounded-xl bg-blue-600 text-white font-semibold px-4 py-2 text-sm shadow-sm shadow-blue-600/20 hover:bg-blue-700 transition-all disabled:opacity-50"
                  >
                    <StarIcon className="h-4 w-4" />
                    {saved ? "Versão salva ✓" : saving ? "Salvando..." : "Salvar versão para esta vaga"}
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="space-y-6">
          {!hasBaseline && (
            <div className="rounded-xl border border-blue-200 dark:border-blue-900 bg-blue-50 dark:bg-blue-950/30 p-6">
              <h2 className="font-semibold mb-2">Quer saber sua nota ATS?</h2>
              <p className="text-sm text-neutral-600 dark:text-neutral-400 mb-3">
                Esse currículo ainda não foi comparado a nenhuma vaga. Envie-o para uma
                análise e descubra o score, as palavras-chave que faltam e um checklist ATS.
              </p>
              <Link
                href="/analise"
                className="inline-flex rounded-md bg-neutral-900 dark:bg-white text-white dark:text-neutral-900 font-medium px-4 py-2 text-sm"
              >
                Analisar contra uma vaga
              </Link>
            </div>
          )}

          <div className="rounded-2xl border border-neutral-200/80 dark:border-neutral-800 bg-white dark:bg-neutral-950 p-6 shadow-sm shadow-slate-900/5">
            <h2 className="font-semibold mb-4 flex items-center gap-1.5">
              Palavras-chave para esta vaga <InfoIcon className="h-4 w-4 text-neutral-400" />
            </h2>
            <p className="text-sm font-medium mb-2">Já presentes ({keywordsFound.length})</p>
            <div className="flex flex-wrap gap-2 mb-4">
              {keywordsFound.map((kw) => (
                <span
                  key={kw}
                  className="flex items-center gap-1 text-xs rounded-full px-3 py-1 bg-emerald-50 text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-300"
                >
                  ✓ {kw}
                </span>
              ))}
            </div>
            <p className="text-sm font-medium mb-2">Sugeridas ({keywordsMissing.length})</p>
            <div className="flex flex-wrap gap-2">
              {keywordsMissing.map((kw) => (
                <span
                  key={kw}
                  className="flex items-center gap-1 text-xs rounded-full px-3 py-1 bg-blue-50 text-blue-700 dark:bg-blue-950/40 dark:text-blue-300"
                >
                  + {kw}
                </span>
              ))}
            </div>
          </div>

          <div className="rounded-2xl border border-neutral-200/80 dark:border-neutral-800 bg-white dark:bg-neutral-950 p-6 shadow-sm shadow-slate-900/5">
            <h2 className="font-semibold mb-4 flex items-center gap-1.5">
              Checklist ATS <InfoIcon className="h-4 w-4 text-neutral-400" />
            </h2>
            <div className="space-y-3">
              {atsChecklist.map((item) => (
                <div key={item.key} className="flex items-center gap-3">
                  <StatusIcon status={item.status} className="h-5 w-5 shrink-0" />
                  <div className="min-w-0">
                    <p className="text-sm font-medium">{item.label}</p>
                    <p className="text-xs text-neutral-500">{item.description}</p>
                  </div>
                </div>
              ))}
              {atsChecklist.length === 0 && (
                <p className="text-sm text-neutral-500">
                  Checklist não disponível para esta análise.
                </p>
              )}
            </div>
          </div>

          {hasBaseline && (
            <div className="rounded-2xl border border-neutral-200/80 dark:border-neutral-800 bg-white dark:bg-neutral-950 p-6 shadow-sm shadow-slate-900/5 text-center">
              <h2 className="font-semibold mb-4">Pronto para aplicar?</h2>
              <div className="flex justify-center">
                <CircularScore value={atsScore} size={120} strokeWidth={10} />
              </div>
              <p className="text-sm text-neutral-600 dark:text-neutral-400 mt-3">
                {atsScore >= 75
                  ? "Seu currículo está bem alinhado a esta vaga."
                  : atsScore >= 50
                  ? "Seu currículo pode melhorar antes de aplicar."
                  : "Seu currículo ainda precisa de ajustes importantes."}
              </p>
              {scoreDelta !== null && (
                <p
                  className={`text-xs mt-2 font-medium ${
                    scoreDelta >= 0 ? "text-emerald-600 dark:text-emerald-400" : "text-red-500"
                  }`}
                >
                  {scoreDelta >= 0 ? "↑" : "↓"} {Math.abs(scoreDelta)}pp desde a última análise
                </p>
              )}
              <Link
                href={`/report/${analysisId}`}
                className="mt-4 inline-flex items-center justify-center rounded-xl bg-blue-600 text-white font-semibold px-4 py-2.5 text-sm shadow-sm shadow-blue-600/20 hover:bg-blue-700 transition-all"
              >
                Voltar para a vaga
              </Link>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
