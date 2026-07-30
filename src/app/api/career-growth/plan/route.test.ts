import { beforeEach, describe, expect, it, vi } from "vitest";
import type { NextRequest } from "next/server";

const { reserveFeatureForRouteMock, upsertMock, generateMock } = vi.hoisted(() => ({
  reserveFeatureForRouteMock: vi.fn(),
  upsertMock: vi.fn(),
  generateMock: vi.fn(),
}));

vi.mock("@/lib/feature-access", () => ({ reserveFeatureForRoute: reserveFeatureForRouteMock }));
vi.mock("@/lib/prisma", () => ({
  prisma: { careerGrowthPlan: { upsert: upsertMock } },
}));
vi.mock("@/lib/career-growth", () => ({ generateCareerGrowthPlan: generateMock }));

import { POST } from "./route";

function request(body: unknown) {
  return new Request("http://localhost/api/career-growth/plan", {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify(body),
  }) as unknown as NextRequest;
}

function allowedRelease() {
  return { confirm: vi.fn().mockResolvedValue(undefined), cancel: vi.fn().mockResolvedValue(undefined) };
}

describe("POST /api/career-growth/plan", () => {
  beforeEach(() => {
    reserveFeatureForRouteMock.mockReset();
    upsertMock.mockReset();
    generateMock.mockReset();
    reserveFeatureForRouteMock.mockResolvedValue({
      session: { user: { id: "user-1" } },
      response: null,
      release: allowedRelease(),
    });
    generateMock.mockResolvedValue({
      competencyGaps: ["gestão de projetos"],
      developmentActions: [{ action: "liderar um projeto", timeframe: "30 dias" }],
      negotiationTalkingPoints: ["impacto mensurável"],
      leadershipReadiness: "Em desenvolvimento.",
    });
    upsertMock.mockResolvedValue({ id: "plan-1", userId: "user-1" });
  });

  it("requires authentication/quota", async () => {
    reserveFeatureForRouteMock.mockResolvedValue({
      session: null,
      response: new Response(JSON.stringify({ error: "Assine um plano pago para usar esta ferramenta." }), { status: 402 }),
      release: null,
    });

    const response = await POST(request({ currentRole: "Analista", targetRole: "Coordenador" }));

    expect(response.status).toBe(402);
    expect(generateMock).not.toHaveBeenCalled();
  });

  it("requires current and target roles", async () => {
    const response = await POST(request({ currentRole: "Analista", targetRole: "" }));

    expect(response.status).toBe(400);
    expect(generateMock).not.toHaveBeenCalled();
    expect(upsertMock).not.toHaveBeenCalled();
  });

  it("generates and upserts a plan for the authenticated user", async () => {
    const response = await POST(
      request({ currentRole: " Analista ", currentSeniority: " Pleno ", targetRole: " Coordenador " }),
    );

    expect(response.status).toBe(200);
    expect(generateMock).toHaveBeenCalledWith("Analista", "Pleno", "Coordenador");
    expect(upsertMock).toHaveBeenCalledWith(
      expect.objectContaining({
        where: { userId: "user-1" },
        create: expect.objectContaining({
          userId: "user-1",
          currentRole: "Analista",
          currentSeniority: "Pleno",
          targetRole: "Coordenador",
          competencyGaps: JSON.stringify(["gestão de projetos"]),
        }),
      }),
    );
  });
});
