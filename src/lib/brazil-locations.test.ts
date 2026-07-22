import { describe, expect, it } from "vitest";
import { parseBrazilLocation } from "./brazil-locations";

describe("parseBrazilLocation", () => {
  it("separa cidade e UF quando ambos aparecem", () => {
    expect(parseBrazilLocation("São Paulo, SP")).toEqual({ city: "São Paulo", state: "SP" });
  });

  it("lida com hífen como separador e nome do estado sem acento", () => {
    expect(parseBrazilLocation("Sao Paulo - SP")).toEqual({ city: "Sao Paulo", state: "SP" });
  });

  it("reconhece cidade com UF separada por barra", () => {
    expect(parseBrazilLocation("Belo Horizonte/MG")).toEqual({ city: "Belo Horizonte", state: "MG" });
  });

  it("reconhece só a sigla", () => {
    expect(parseBrazilLocation("SP")).toEqual({ city: "", state: "SP" });
  });

  it("reconhece o nome completo do estado sem assumir cidade", () => {
    expect(parseBrazilLocation("Rio de Janeiro")).toEqual({ city: "", state: "RJ" });
  });

  it("ignora rótulos remotos/genéricos", () => {
    expect(parseBrazilLocation("Remoto")).toEqual({ city: "", state: "" });
    expect(parseBrazilLocation("Remote")).toEqual({ city: "", state: "" });
    expect(parseBrazilLocation("Brasil")).toEqual({ city: "", state: "" });
  });

  it("retorna vazio para texto vazio ou nulo", () => {
    expect(parseBrazilLocation("")).toEqual({ city: "", state: "" });
    expect(parseBrazilLocation(null)).toEqual({ city: "", state: "" });
    expect(parseBrazilLocation(undefined)).toEqual({ city: "", state: "" });
  });

  it("retorna estado vazio quando nenhuma UF é reconhecível", () => {
    expect(parseBrazilLocation("Planeta Terra")).toEqual({ city: "Planeta Terra", state: "" });
  });

  it("descarta 'Brasil' como ruído mas mantém a cidade", () => {
    expect(parseBrazilLocation("Curitiba, PR, Brasil")).toEqual({ city: "Curitiba", state: "PR" });
  });
});
