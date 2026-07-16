import { describe, expect, it } from "vitest";
import { formatBrazilPhone, validateContact } from "./contact-validation";

describe("validateContact", () => {
  it("normaliza um contato brasileiro válido", () => {
    expect(validateContact({ name: "  Maria   Silva ", email: " MARIA@EXEMPLO.COM ", phone: "+55 (11) 99999-9999" })).toEqual({
      success: true,
      data: { name: "Maria Silva", email: "maria@exemplo.com", phone: "11999999999" },
      errors: [],
    });
  });

  it("rejeita dados que não servem como lead", () => {
    const result = validateContact({ name: "Teste", email: "x@x", phone: "11111111111" });
    expect(result.success).toBe(false);
    expect(result.errors).toHaveLength(3);
  });

  it("formata telefone durante a digitação", () => {
    expect(formatBrazilPhone("11999999999")).toBe("(11) 99999-9999");
  });
});

