import { describe, expect, it } from "vitest";
import { parseNationalCatalogCsv } from "./national-catalog";

describe("parseNationalCatalogCsv", () => {
  it("aceita CSV separado por ponto e vírgula e colunas do MEC", () => {
    const csv = `Código da IES;Nome da IES;Categoria Administrativa;Município;UF;Código do Curso;Nome do Curso;Grau\n123;Universidade Federal de Uberlândia;Pública Federal;Uberlândia;MG;456;Ciência da Computação;Bacharelado`;
    expect(parseNationalCatalogCsv(csv)).toEqual([{
      institutionCode: "123",
      institutionName: "Universidade Federal de Uberlândia",
      acronym: "",
      category: "Pública Federal",
      organization: "",
      city: "Uberlândia",
      state: "MG",
      institutionStatus: "",
      courseCode: "456",
      courseName: "Ciência da Computação",
      degree: "Bacharelado",
      modality: "",
      courseStatus: "",
    }]);
  });
});
