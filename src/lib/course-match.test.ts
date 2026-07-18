import { describe, expect, it } from "vitest";
import { tokenize, scoreCourse, rankCourses } from "./course-match";

describe("tokenize", () => {
  it("remove acentos, stopwords e tokens curtos", () => {
    expect(tokenize("Curso de Instalação Elétrica Residencial")).toEqual([
      "instalacao",
      "eletrica",
      "residencial",
    ]);
  });

  it("mantém tokens técnicos com + e #", () => {
    expect(tokenize("C++ e C# para back-end")).toContain("c++");
    expect(tokenize("C++ e C# para back-end")).toContain("c#");
  });
});

describe("scoreCourse", () => {
  const course = { title: "Excel Avançado para Escritório", area: "administrativo" };

  it("pontua lacuna casada acima da área", () => {
    const byGap = scoreCourse(course, { skillGaps: ["Excel avançado"] });
    const byArea = scoreCourse(course, { area: "administrativo" });
    expect(byGap).toBeGreaterThan(byArea);
  });

  it("retorna 0 sem nenhuma sobreposição", () => {
    expect(scoreCourse(course, { area: "eletricista", skillGaps: ["solda"] })).toBe(0);
  });

  it("não dá bônus de gratuito quando não há match", () => {
    expect(scoreCourse({ ...course, free: true }, { area: "jardinagem" })).toBe(0);
  });

  it("gratuito e certificado desempatam para cima quando há match", () => {
    const base = scoreCourse(course, { area: "administrativo" });
    const boosted = scoreCourse(
      { ...course, free: true, certificate: true },
      { area: "administrativo" },
    );
    expect(boosted).toBeGreaterThan(base);
  });
});

describe("rankCourses", () => {
  it("ordena por relevância e descarta os sem match", () => {
    const courses = [
      { title: "Jardinagem Básica", area: "jardinagem" },
      { title: "Excel Avançado", area: "administrativo" },
      { title: "Fundamentos de Administração", area: "administrativo" },
    ];
    const ranked = rankCourses(courses, {
      area: "administrativo",
      skillGaps: ["Excel"],
    });
    expect(ranked.map((c) => c.title)).toEqual([
      "Excel Avançado",
      "Fundamentos de Administração",
    ]);
  });

  it("empate mantém a ordem de entrada", () => {
    const courses = [
      { title: "Administração I", area: "administrativo" },
      { title: "Administração II", area: "administrativo" },
    ];
    const ranked = rankCourses(courses, { area: "administrativo" });
    expect(ranked.map((c) => c.title)).toEqual(["Administração I", "Administração II"]);
  });
});
