import { describe, expect, it } from "vitest";
import { parseFacomPdfSubjects } from "./facom";

describe("parseFacomPdfSubjects", () => {
  it("extrai disciplinas de PDFs que alternam código, nome e carga horária", () => {
    const text = `1º Período\nFACOM31102\nIntrodução à Ciência da Computação\n30 - 0 - 30\nFACOM31103\nProgramação\n30 - 30 - 60`;
    expect(parseFacomPdfSubjects(text)).toEqual([
      { name: "Introdução à Ciência da Computação", semester: 1 },
      { name: "Programação", semester: 1 },
    ]);
  });
});
