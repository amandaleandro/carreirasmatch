import { describe, expect, it } from "vitest";

import {
  SUPPORT_CATEGORIES,
  SUPPORT_CATEGORY_DESCRIPTIONS,
  SUPPORT_CATEGORY_LABELS,
  SUPPORT_STATUSES,
  SUPPORT_STATUS_ADMIN_LABELS,
  SUPPORT_STATUS_LABELS,
  normalizeSupportCategory,
  normalizeSupportStatus,
  validateSupportAttachment,
} from "@/lib/support";

describe("normalizeSupportCategory", () => {
  it("keeps every known category", () => {
    for (const category of SUPPORT_CATEGORIES) {
      expect(normalizeSupportCategory(category)).toBe(category);
    }
  });

  it("falls back to 'other' for anything unknown", () => {
    expect(normalizeSupportCategory("hacking")).toBe("other");
    expect(normalizeSupportCategory("")).toBe("other");
    expect(normalizeSupportCategory(null)).toBe("other");
    expect(normalizeSupportCategory(undefined)).toBe("other");
    expect(normalizeSupportCategory(42)).toBe("other");
  });
});

describe("normalizeSupportStatus", () => {
  it("keeps every known status", () => {
    for (const status of SUPPORT_STATUSES) {
      expect(normalizeSupportStatus(status)).toBe(status);
    }
  });

  // Um status inválido virando "resolved" esconderia o chamado da fila do
  // admin; o padrão seguro é cair em "open".
  it("falls back to 'open' for anything unknown", () => {
    expect(normalizeSupportStatus("deleted")).toBe("open");
    expect(normalizeSupportStatus("")).toBe("open");
    expect(normalizeSupportStatus(null)).toBe("open");
  });
});

describe("labels", () => {
  it("covers every category and status", () => {
    for (const category of SUPPORT_CATEGORIES) {
      expect(SUPPORT_CATEGORY_LABELS[category]).toBeTruthy();
      expect(SUPPORT_CATEGORY_DESCRIPTIONS[category]).toBeTruthy();
    }
    for (const status of SUPPORT_STATUSES) {
      expect(SUPPORT_STATUS_LABELS[status]).toBeTruthy();
      expect(SUPPORT_STATUS_ADMIN_LABELS[status]).toBeTruthy();
    }
  });
});

describe("validateSupportAttachment", () => {
  it("accepts supported files up to 2 MB", () => {
    const file = new File(["conteúdo"], "comprovante.pdf", { type: "application/pdf" });
    expect(validateSupportAttachment(file)).toEqual({ file });
  });

  it("rejects unsupported or oversized files", () => {
    expect(validateSupportAttachment(new File(["x"], "arquivo.exe", { type: "application/octet-stream" })).error).toMatch(/PDF/);
    expect(validateSupportAttachment(new File([new Uint8Array(2 * 1024 * 1024 + 1)], "grande.png", { type: "image/png" })).error).toMatch(/2 MB/);
  });
});
