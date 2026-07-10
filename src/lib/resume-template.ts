import type {
  ResumeContact,
  ResumeEducationEntry,
  ResumeLanguageEntry,
  ResumeExperienceEntry,
} from "@/lib/groq";

export type ResumeTemplateData = {
  candidateName: string;
  jobTitle: string;
  summary: string;
  contact: ResumeContact;
  experiences: ResumeExperienceEntry[];
  education: ResumeEducationEntry[];
  skills: string[];
  languages: ResumeLanguageEntry[];
  certifications: string[];
};

function escapeHtml(value: string): string {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

// Preserva quebras de linha digitadas pelo usuário em textos livres
// (resumo, descrições de experiência) em vez de colapsá-las.
function escapeMultiline(value: string): string {
  return escapeHtml(value).replace(/\n/g, "<br />");
}

function contactItems(contact: ResumeContact): string {
  const items: { label: string; value: string }[] = [
    { label: "email", value: contact.email },
    { label: "telefone", value: contact.phone },
    { label: "local", value: contact.location },
    { label: "linkedin", value: contact.linkedin },
    { label: "github", value: contact.github },
    { label: "portfolio", value: contact.portfolio },
  ].filter((item) => item.value && item.value.trim());

  return items
    .map(
      (item) =>
        `<span class="contact-item"><span class="contact-icon contact-icon--${item.label}"></span>${escapeHtml(
          item.value
        )}</span>`
    )
    .join("");
}

export function buildResumeHtml(data: ResumeTemplateData): string {
  const name = escapeHtml(data.candidateName || data.contact.name || "Candidato");
  const summaryHtml = data.summary?.trim() ? escapeMultiline(data.summary.trim()) : "";

  const experiencesHtml = data.experiences
    .map((exp) => {
      const periodHtml = exp.period ? `<span class="entry-period">${escapeHtml(exp.period)}</span>` : "";
      return `
        <article class="entry">
          <div class="entry-head">
            <h3 class="entry-title">${escapeHtml(exp.role)}<span class="entry-sep"> — </span>${escapeHtml(
        exp.company
      )}</h3>
            ${periodHtml}
          </div>
          ${exp.description ? `<p class="entry-desc">${escapeMultiline(exp.description)}</p>` : ""}
        </article>`;
    })
    .join("");

  const educationHtml = data.education
    .map((ed) => {
      const periodHtml = ed.period ? `<span class="entry-period">${escapeHtml(ed.period)}</span>` : "";
      return `
        <article class="entry entry--compact">
          <div class="entry-head">
            <h3 class="entry-title">${escapeHtml(ed.degree)}<span class="entry-sep"> — </span>${escapeHtml(
        ed.institution
      )}</h3>
            ${periodHtml}
          </div>
        </article>`;
    })
    .join("");

  const skillsHtml = data.skills.map((skill) => `<span class="pill">${escapeHtml(skill)}</span>`).join("");

  const languagesHtml = data.languages
    .map(
      (lg) =>
        `<span class="pill pill--muted">${escapeHtml(lg.language)}${
          lg.level ? ` <span class="pill-level">· ${escapeHtml(lg.level)}</span>` : ""
        }</span>`
    )
    .join("");

  const certificationsHtml = data.certifications
    .map((c) => `<li class="cert-item">${escapeHtml(c)}</li>`)
    .join("");

  const sections: string[] = [];

  if (summaryHtml) {
    sections.push(`
      <section class="section">
        <h2 class="section-title">Resumo profissional</h2>
        <p class="summary">${summaryHtml}</p>
      </section>`);
  }

  if (data.experiences.length > 0) {
    sections.push(`
      <section class="section">
        <h2 class="section-title">Experiência profissional</h2>
        ${experiencesHtml}
      </section>`);
  }

  if (data.education.length > 0) {
    sections.push(`
      <section class="section">
        <h2 class="section-title">Formação acadêmica</h2>
        ${educationHtml}
      </section>`);
  }

  if (data.skills.length > 0) {
    sections.push(`
      <section class="section">
        <h2 class="section-title">Habilidades</h2>
        <div class="pill-row">${skillsHtml}</div>
      </section>`);
  }

  if (data.languages.length > 0) {
    sections.push(`
      <section class="section">
        <h2 class="section-title">Idiomas</h2>
        <div class="pill-row">${languagesHtml}</div>
      </section>`);
  }

  if (data.certifications.length > 0) {
    sections.push(`
      <section class="section">
        <h2 class="section-title">Certificações</h2>
        <ul class="cert-list">${certificationsHtml}</ul>
      </section>`);
  }

  return `<!doctype html>
<html lang="pt-BR">
<head>
<meta charset="utf-8" />
<meta name="viewport" content="width=device-width, initial-scale=1" />
<title>${name}</title>
<style>
  @page { size: A4; margin: 0; }
  * { box-sizing: border-box; }
  html, body {
    margin: 0;
    padding: 0;
    background: #ffffff;
    color: #1c1d21;
    font-family: "Helvetica Neue", Helvetica, Arial, "Liberation Sans", sans-serif;
    -webkit-font-smoothing: antialiased;
    text-rendering: optimizeLegibility;
  }
  .page {
    width: 210mm;
    min-height: 297mm;
    padding: 16mm 18mm;
  }
  .header {
    display: flex;
    flex-direction: column;
    gap: 4mm;
    padding-bottom: 6mm;
    border-bottom: 0.6mm solid #1f3d8f;
    margin-bottom: 7mm;
  }
  .name {
    font-size: 24pt;
    font-weight: 700;
    letter-spacing: 0.2pt;
    color: #10131a;
    margin: 0;
    overflow-wrap: break-word;
  }
  .job-target {
    font-size: 9.5pt;
    color: #55586a;
    margin: 0;
  }
  .job-target strong {
    color: #1f3d8f;
    font-weight: 600;
  }
  .contact-row {
    display: flex;
    flex-wrap: wrap;
    row-gap: 2mm;
    column-gap: 5mm;
    font-size: 9.5pt;
    color: #40424e;
  }
  .contact-item {
    display: inline-flex;
    align-items: center;
    gap: 1.8mm;
    overflow-wrap: anywhere;
  }
  .contact-icon {
    width: 2.6mm;
    height: 2.6mm;
    border-radius: 50%;
    background: #1f3d8f;
    flex-shrink: 0;
    display: inline-block;
  }
  .section {
    margin-bottom: 6.5mm;
  }
  .section:last-child {
    margin-bottom: 0;
  }
  .section-title {
    font-size: 10.5pt;
    font-weight: 700;
    text-transform: uppercase;
    letter-spacing: 0.8pt;
    color: #1f3d8f;
    margin: 0 0 3mm 0;
    padding-bottom: 1.5mm;
    border-bottom: 0.35mm solid #d7dcec;
  }
  .summary {
    font-size: 10pt;
    line-height: 1.55;
    color: #262832;
    margin: 0;
    white-space: pre-wrap;
    overflow-wrap: break-word;
  }
  .entry {
    margin-bottom: 4.5mm;
  }
  .entry:last-child {
    margin-bottom: 0;
  }
  .entry--compact {
    margin-bottom: 2.8mm;
  }
  .entry-head {
    display: flex;
    justify-content: space-between;
    align-items: baseline;
    gap: 4mm;
  }
  .entry-title {
    font-size: 10.5pt;
    font-weight: 700;
    color: #16181f;
    margin: 0;
    overflow-wrap: break-word;
  }
  .entry-sep {
    font-weight: 400;
    color: #7a7c88;
  }
  .entry-period {
    font-size: 9pt;
    color: #6c6e7a;
    white-space: nowrap;
    flex-shrink: 0;
  }
  .entry-desc {
    font-size: 9.8pt;
    line-height: 1.5;
    color: #363844;
    margin: 1.6mm 0 0 0;
    white-space: pre-wrap;
    overflow-wrap: break-word;
  }
  .pill-row {
    display: flex;
    flex-wrap: wrap;
    gap: 2.4mm;
  }
  .pill {
    font-size: 9pt;
    padding: 1.6mm 3.2mm;
    border-radius: 20mm;
    background: #eef1fb;
    color: #1f3d8f;
    font-weight: 500;
    overflow-wrap: break-word;
  }
  .pill--muted {
    background: #f1f2f5;
    color: #33353f;
  }
  .pill-level {
    color: #6c6e7a;
    font-weight: 400;
  }
  .cert-list {
    margin: 0;
    padding: 0 0 0 4.5mm;
    list-style: none;
  }
  .cert-item {
    position: relative;
    font-size: 9.8pt;
    line-height: 1.5;
    color: #262832;
    margin-bottom: 1.6mm;
    overflow-wrap: break-word;
  }
  .cert-item:last-child {
    margin-bottom: 0;
  }
  .cert-item::before {
    content: "";
    position: absolute;
    left: -4.5mm;
    top: 1.9mm;
    width: 1.6mm;
    height: 1.6mm;
    border-radius: 50%;
    background: #1f3d8f;
  }
</style>
</head>
<body>
  <div class="page">
    <header class="header">
      <h1 class="name">${name}</h1>
      ${data.jobTitle ? `<p class="job-target">Candidatura para: <strong>${escapeHtml(data.jobTitle)}</strong></p>` : ""}
      <div class="contact-row">${contactItems(data.contact)}</div>
    </header>
    ${sections.join("")}
  </div>
</body>
</html>`;
}
