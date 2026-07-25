import { describe, expect, it } from "vitest";
import { parseAutoApplyProfile } from "@/lib/auto-apply-profile";

describe("parseAutoApplyProfile", () => {
  it("retorna perfil vazio para JSON inválido", () => {
    expect(parseAutoApplyProfile("{")).toMatchObject({
      fullName: "",
      email: "",
      customAnswers: {},
    });
  });

  it("preserva respostas válidas", () => {
    expect(
      parseAutoApplyProfile(JSON.stringify({
        email: "pessoa@example.com",
        workAuthorization: "yes",
        customAnswers: { "Possui CNH?": "Sim" },
      })),
    ).toMatchObject({
      email: "pessoa@example.com",
      workAuthorization: "yes",
      customAnswers: { "Possui CNH?": "Sim" },
    });
  });
});
