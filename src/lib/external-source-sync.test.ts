import { describe, expect, it } from "vitest";
import { courseTitleFromUrl } from "./external-source-sync";

describe("courseTitleFromUrl", () => {
  it("deriva título limpo do slug SENAI removendo o código", () => {
    expect(
      courseTitleFromUrl("https://cursos.senairs.org.br/cursos/app1153-administracao-de-materiais/"),
    ).toBe("Administracao de Materiais");
  });

  it("mantém curso SENAC de uma palavra (tem uuids no caminho)", () => {
    expect(
      courseTitleFromUrl("https://www.senacrs.com.br/curso/barbeiro/36c47b57-8952-42a1"),
    ).toBe("Barbeiro");
  });

  it("rejeita página de categoria (slug de 1 palavra, sem código nem uuid)", () => {
    expect(courseTitleFromUrl("https://cursos.senairs.org.br/cursos/tecnico/")).toBe("");
    expect(courseTitleFromUrl("https://cursos.senairs.org.br/cursos/graduacao/")).toBe("");
  });

  it("mantém palavras pequenas em minúsculo (de, e, do)", () => {
    expect(
      courseTitleFromUrl("https://x.org/curso/ajustes-e-reformas-do-vestuario/uuid"),
    ).toBe("Ajustes e Reformas do Vestuario");
  });

  it("retorna vazio para URL sem segmento de curso", () => {
    expect(courseTitleFromUrl("https://x.org/")).toBe("");
  });
});
