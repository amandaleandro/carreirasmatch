import { beforeEach, describe, expect, it, vi } from "vitest";

const { settingsFindUnique, resumeFindFirst } = vi.hoisted(() => ({
  settingsFindUnique: vi.fn(),
  resumeFindFirst: vi.fn(),
}));

vi.mock("@/lib/prisma", () => ({
  prisma: {
    autoApplicationSettings: {
      findUnique: settingsFindUnique,
    },
    resume: {
      findFirst: resumeFindFirst,
    },
  },
}));

vi.mock("@/lib/evolution", () => ({
  sendCompanyNewApplicationWhatsapp: vi.fn(),
}));

vi.mock("@/lib/resend", () => ({
  sendCompanyNewApplicationEmail: vi.fn(),
}));

import { runAutoApplyForUser } from "@/lib/auto-apply";

describe("runAutoApplyForUser", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("não executa quando o piloto está desativado", async () => {
    settingsFindUnique.mockResolvedValue({ enabled: false, consentedAt: null });

    await expect(runAutoApplyForUser("user-1")).resolves.toEqual({
      queued: 0,
      applied: 0,
      unsupported: 0,
      failed: 0,
      skipped: 0,
    });
    expect(resumeFindFirst).not.toHaveBeenCalled();
  });

  it("exige consentimento antes de executar", async () => {
    settingsFindUnique.mockResolvedValue({ enabled: true, consentedAt: null });

    await runAutoApplyForUser("user-1");

    expect(resumeFindFirst).not.toHaveBeenCalled();
  });

  it("não tenta aplicar sem currículo", async () => {
    settingsFindUnique.mockResolvedValue({ enabled: true, consentedAt: new Date() });
    resumeFindFirst.mockResolvedValue(null);

    await expect(runAutoApplyForUser("user-1")).resolves.toMatchObject({ skipped: 1 });
  });
});
