import { describe, expect, it } from "vitest";

import { asOptionalText, asScore, asStringArray, asText } from "@/lib/ai-shape";

describe("asStringArray", () => {
  it("keeps clean string arrays", () => {
    expect(asStringArray(["a", "b"])).toEqual(["a", "b"]);
    expect(asStringArray([" espaço  "])).toEqual(["espaço"]);
  });

  // O caso que derruba a página: resposta truncada pelo max_tokens continua
  // sendo JSON válido, só que sem o campo.
  it("returns [] when the field is missing or not an array", () => {
    expect(asStringArray(undefined)).toEqual([]);
    expect(asStringArray(null)).toEqual([]);
    expect(asStringArray("texto")).toEqual([]);
    expect(asStringArray({ 0: "a" })).toEqual([]);
  });

  it("drops non-string and empty entries", () => {
    expect(asStringArray(["ok", 42, null, "", "  ", { a: 1 }, "fim"])).toEqual(["ok", "fim"]);
  });

  it("caps the number of items", () => {
    expect(asStringArray(["a", "b", "c", "d"], 2)).toEqual(["a", "b"]);
  });
});

describe("asText", () => {
  it("trims and falls back", () => {
    expect(asText("  oi ")).toBe("oi");
    expect(asText("")).toBe("");
    expect(asText(undefined)).toBe("");
    expect(asText(null, "padrão")).toBe("padrão");
    expect(asText(123, "padrão")).toBe("padrão");
  });
});

describe("asScore", () => {
  it("clamps into the range", () => {
    expect(asScore(7, 0, 10)).toBe(7);
    expect(asScore(99, 0, 10)).toBe(10);
    expect(asScore(-5, 0, 10)).toBe(0);
  });

  it("rounds and accepts numeric strings", () => {
    expect(asScore(7.6, 0, 10)).toBe(8);
    expect(asScore("8", 0, 10)).toBe(8);
  });

  it("falls back when there is no usable number", () => {
    expect(asScore(undefined, 0, 10)).toBe(0);
    expect(asScore("muito bom", 0, 10)).toBe(0);
    expect(asScore(NaN, 0, 10, 5)).toBe(5);
  });
});

describe("asOptionalText", () => {
  it("returns null instead of an empty string", () => {
    expect(asOptionalText("pergunta")).toBe("pergunta");
    expect(asOptionalText("")).toBeNull();
    expect(asOptionalText("   ")).toBeNull();
    expect(asOptionalText(null)).toBeNull();
    expect(asOptionalText(undefined)).toBeNull();
  });
});
