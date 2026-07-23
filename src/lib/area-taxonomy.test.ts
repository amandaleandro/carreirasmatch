import { describe, expect, it } from "vitest";
import { classifyArea, resolveFreeText } from "./area-taxonomy";

describe("classifyArea", () => {
  it("classifica TI por ferramenta/linguagem citada no texto", () => {
    expect(classifyArea("Curso de React do Zero")).toEqual({
      area: "Tecnologia da Informação",
      subarea: "Desenvolvimento Front-end",
    });
    expect(classifyArea("Python Fundamentals")).toEqual({
      area: "Tecnologia da Informação",
      subarea: "Desenvolvimento Back-end",
    });
  });

  it("classifica áreas fora de TI reaproveitando as subáreas de VOCATION_AREAS", () => {
    expect(classifyArea("Preparatório para Residência em Cardiologia", "medicina")).toEqual({
      area: "Medicina",
      subarea: "Cardiologia",
    });
    expect(classifyArea("Fundamentos de Direito Tributário", "direito")).toEqual({
      area: "Direito",
      subarea: "Direito Tributário",
    });
  });

  it("sem subárea reconhecida, mantém a área geral com subárea vazia", () => {
    expect(classifyArea("Curso Introdutório de Direito", "direito")).toEqual({
      area: "Direito",
      subarea: "",
    });
  });

  it("sem nenhum sinal, preserva o fallbackArea como estava antes", () => {
    expect(classifyArea("Curso qualquer", "categoria-nao-mapeada")).toEqual({
      area: "categoria-nao-mapeada",
      subarea: "",
    });
  });
});

describe("resolveFreeText", () => {
  it("resolve texto livre de TI direto pra subárea", () => {
    expect(resolveFreeText("Desenvolvedor back-end")).toEqual({
      areaSlug: "ti",
      areaLabel: "Tecnologia da Informação",
      subarea: "Desenvolvimento Back-end",
    });
  });

  it("resolve texto livre citando a subárea de outra área vocacional", () => {
    expect(resolveFreeText("Advogado trabalhista")).toEqual({
      areaSlug: "direito",
      areaLabel: "Direito",
      subarea: "Direito Trabalhista",
    });
  });

  it("retorna null sem nenhum sinal confiável", () => {
    expect(resolveFreeText("")).toBeNull();
    expect(resolveFreeText(null)).toBeNull();
    expect(resolveFreeText("xyz abc 123")).toBeNull();
  });
});
