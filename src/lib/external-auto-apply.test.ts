import { describe, expect, it } from "vitest";
import { classifyExternalField } from "@/lib/external-auto-apply";

describe("classifyExternalField", () => {
  it.each([
    ["Nome completo", "fullName"],
    ["Seu melhor e-mail", "email"],
    ["Telefone / WhatsApp", "phone"],
    ["Cidade onde mora", "city"],
    ["Estado (UF)", "state"],
    ["Perfil do LinkedIn", "linkedinUrl"],
    ["Qual é sua pretensão salarial?", "salaryExpectation"],
    ["Disponibilidade para início", "availability"],
    ["Possui autorização para trabalhar no Brasil?", "workAuthorization"],
    ["Aceita mudança de cidade?", "willingToRelocate"],
    ["Carta de apresentação", "coverLetter"],
  ])("classifica %s", (hint, expected) => {
    expect(classifyExternalField(hint)).toBe(expected);
  });

  it("não inventa resposta para pergunta desconhecida", () => {
    expect(classifyExternalField("Conte sobre um desafio técnico")).toBeNull();
  });

  it("reconhece campo de e-mail pelo type mesmo sem label/name (só placeholder de exemplo)", () => {
    expect(classifyExternalField("you@example.com", "email")).toBe("email");
  });
});
