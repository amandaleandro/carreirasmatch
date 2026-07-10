export type ExamArchiveFile = {
  label: string;
  path: string;
};

export type ExamArchiveYear = {
  year: number;
  files: ExamArchiveFile[];
};

export type ExamArchiveInstitution = {
  slug: string;
  name: string;
  description: string;
  years: ExamArchiveYear[];
};

export const EXAM_ARCHIVE: ExamArchiveInstitution[] = [
  {
    slug: "enem",
    name: "ENEM",
    description: "Provas e gabaritos oficiais do INEP, dias 1 e 2.",
    years: [2024, 2023, 2022, 2021, 2020].map((year) => ({
      year,
      files: [
        { label: "Dia 1 — Prova", path: `/exam-archive/enem/${year}/dia1-prova.pdf` },
        { label: "Dia 1 — Gabarito", path: `/exam-archive/enem/${year}/dia1-gabarito.pdf` },
        { label: "Dia 2 — Prova", path: `/exam-archive/enem/${year}/dia2-prova.pdf` },
        { label: "Dia 2 — Gabarito", path: `/exam-archive/enem/${year}/dia2-gabarito.pdf` },
      ],
    })),
  },
  {
    slug: "ita",
    name: "ITA",
    description: "Provas oficiais do vestibular do Instituto Tecnológico de Aeronáutica, 1ª e 2ª fase.",
    years: [2026, 2025, 2024, 2023, 2022].map((year) => ({
      year,
      files: [
        { label: "1ª fase", path: `/exam-archive/ita/${year}/fase1.pdf` },
        { label: "2ª fase — Matemática", path: `/exam-archive/ita/${year}/fase2-matematica.pdf` },
        { label: "2ª fase — Física", path: `/exam-archive/ita/${year}/fase2-fisica.pdf` },
        { label: "2ª fase — Química", path: `/exam-archive/ita/${year}/fase2-quimica.pdf` },
      ],
    })),
  },
  {
    slug: "ufsc",
    name: "UFSC (Vestibular Unificado)",
    description: "Provas do vestibular unificado UFSC/IFSC/IFC.",
    years: [
      { year: 2024, files: [1, 2] },
      { year: 2023, files: [1, 2] },
      { year: 2022, files: [1, 2] },
      { year: 2020, files: [1, 2, 3] },
    ].map(({ year, files }) => ({
      year,
      files: files.map((n) => ({
        label: `Prova ${n}`,
        path: `/exam-archive/ufsc/${year}/prova${n}.pdf`,
      })),
    })),
  },
];
