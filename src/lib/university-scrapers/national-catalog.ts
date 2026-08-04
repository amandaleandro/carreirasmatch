import { prisma } from "@/lib/prisma";
import { slugify } from "@/lib/blog-generator";

export type NationalCatalogRow = {
  institutionCode: string;
  institutionName: string;
  acronym: string;
  category: string;
  organization: string;
  city: string;
  state: string;
  institutionStatus: string;
  courseCode: string;
  courseName: string;
  degree: string;
  modality: string;
  courseStatus: string;
};

function normalize(value: string) {
  return value
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, " ")
    .trim();
}

function parseCsv(text: string): string[][] {
  const rows: string[][] = [];
  let row: string[] = [];
  let field = "";
  let quoted = false;
  const delimiter = (text.split(/\r?\n/, 1)[0].match(/;/g)?.length ?? 0) > (text.split(/\r?\n/, 1)[0].match(/,/g)?.length ?? 0) ? ";" : ",";

  for (let index = 0; index < text.length; index += 1) {
    const char = text[index];
    if (char === '"') {
      if (quoted && text[index + 1] === '"') {
        field += '"';
        index += 1;
      } else {
        quoted = !quoted;
      }
    } else if (!quoted && char === delimiter) {
      row.push(field.trim());
      field = "";
    } else if (!quoted && (char === "\n" || char === "\r")) {
      if (char === "\r" && text[index + 1] === "\n") index += 1;
      row.push(field.trim());
      field = "";
      if (row.some(Boolean)) rows.push(row);
      row = [];
    } else {
      field += char;
    }
  }
  if (field || row.length) {
    row.push(field.trim());
    if (row.some(Boolean)) rows.push(row);
  }
  return rows;
}

function value(row: string[], indexes: Map<string, number>, ...names: string[]) {
  for (const name of names) {
    const index = indexes.get(normalize(name));
    if (index !== undefined) return row[index]?.trim() ?? "";
  }
  return "";
}

export function parseNationalCatalogCsv(text: string): NationalCatalogRow[] {
  const records = parseCsv(text.replace(/^\uFEFF/, ""));
  const headers = records.shift() ?? [];
  const indexes = new Map(headers.map((header, index) => [normalize(header), index]));
  const rows: NationalCatalogRow[] = [];

  for (const record of records) {
    const institutionCode = value(record, indexes, "Código da IES", "Código IES", "CO_IES");
    const institutionName = value(record, indexes, "Nome da IES", "Nome IES", "NO_IES");
    const courseCode = value(record, indexes, "Código do Curso", "Código Curso", "CO_CURSO");
    const courseName = value(record, indexes, "Nome do Curso", "Nome Curso", "NO_CURSO");
    if (!institutionCode || !institutionName) continue;
    rows.push({
      institutionCode,
      institutionName,
      acronym: value(record, indexes, "Sigla da IES", "Sigla IES", "SG_IES"),
      category: value(record, indexes, "Categoria Administrativa", "Categoria da IES", "TP_CATEGORIA_ADMINISTRATIVA"),
      organization: value(record, indexes, "Organização Acadêmica", "Organizacao Academica", "TP_ORGANIZACAO_ACADEMICA"),
      city: value(record, indexes, "Município", "Municipio", "NO_MUNICIPIO"),
      state: value(record, indexes, "UF", "SG_UF"),
      institutionStatus: value(record, indexes, "Situação da IES", "Situacao da IES", "CO_SITUACAO_IES"),
      courseCode,
      courseName,
      degree: value(record, indexes, "Grau", "Grau do Curso", "TP_GRAU_ACADEMICO"),
      modality: value(record, indexes, "Modalidade de Ensino", "Modalidade", "TP_MODALIDADE_ENSINO"),
      courseStatus: value(record, indexes, "Situação do Curso", "Situacao do Curso", "CO_SITUACAO_CURSO"),
    });
  }
  return rows;
}

function isActive(value: string) {
  const normalized = normalize(value);
  return !normalized || /ativa|ativo|em atividade|funcionamento/.test(normalized);
}

function priorityFor(category: string) {
  const normalized = normalize(category);
  if (/publica federal|federal/.test(normalized)) return 10;
  if (/publica estadual|publica municipal|publica/.test(normalized)) return 20;
  return 50;
}

/** Importa apenas a camada oficial de instituições. A grade curricular só é
 * criada depois que um adaptador encontra uma URL oficial da instituição. */
export async function importNationalInstitutions(rows: NationalCatalogRow[]) {
  const institutions = new Map<string, NationalCatalogRow>();
  for (const row of rows) {
    if (isActive(row.institutionStatus)) institutions.set(row.institutionCode, row);
  }

  let imported = 0;
  for (const row of institutions.values()) {
    await prisma.university.upsert({
      where: { nationalCode: row.institutionCode },
      create: {
        nationalCode: row.institutionCode,
        name: row.institutionName,
        slug: slugify(`${row.institutionName}-${row.institutionCode}`),
        city: row.city,
        state: row.state,
        category: row.category,
        organization: row.organization,
        priority: priorityFor(row.category),
        source: "emec:catalog",
        discoveryStatus: "pending",
        catalogLastSeenAt: new Date(),
      },
      update: {
        name: row.institutionName,
        city: row.city,
        state: row.state,
        category: row.category,
        organization: row.organization,
        priority: priorityFor(row.category),
        active: true,
        catalogLastSeenAt: new Date(),
      },
    });
    imported += 1;
  }
  return imported;
}
