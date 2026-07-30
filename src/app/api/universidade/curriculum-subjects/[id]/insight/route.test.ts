import { beforeEach, describe, expect, it, vi } from "vitest";
import { NextRequest } from "next/server";

const { authMock, reserveFeatureForRouteMock, subjectFindUniqueMock, insightCreateMock, generateMock } = vi.hoisted(() => ({
  authMock: vi.fn(),
  reserveFeatureForRouteMock: vi.fn(),
  subjectFindUniqueMock: vi.fn(),
  insightCreateMock: vi.fn(),
  generateMock: vi.fn(),
}));

vi.mock("@/auth", () => ({ auth: authMock }));
vi.mock("@/lib/feature-access", () => ({ reserveFeatureForRoute: reserveFeatureForRouteMock }));
vi.mock("@/lib/prisma", () => ({
  prisma: {
    curriculumSubject: { findUnique: subjectFindUniqueMock },
    curriculumSubjectInsight: { create: insightCreateMock },
  },
}));
vi.mock("@/lib/university", () => ({ generateSubjectCareerInsight: generateMock }));

import { POST } from "./route";

const params = Promise.resolve({ id: "subject-1" });

function allowedRelease() {
  return { confirm: vi.fn().mockResolvedValue(undefined), cancel: vi.fn().mockResolvedValue(undefined) };
}

describe("POST /api/universidade/curriculum-subjects/[id]/insight", () => {
  beforeEach(() => {
    authMock.mockReset();
    reserveFeatureForRouteMock.mockReset();
    subjectFindUniqueMock.mockReset();
    insightCreateMock.mockReset();
    generateMock.mockReset();
    authMock.mockResolvedValue({ user: { id: "user-1" } });
    reserveFeatureForRouteMock.mockResolvedValue({
      session: { user: { id: "user-1" } },
      response: null,
      release: allowedRelease(),
    });
    generateMock.mockResolvedValue({
      competencies: ["SQL"],
      relatedProfessions: ["Analista de Dados"],
      suggestedProject: "Criar uma base de dados de vendas",
    });
    insightCreateMock.mockResolvedValue({ id: "insight-1" });
  });

  it("reuses an existing catalog insight without calling the AI", async () => {
    const existing = { id: "insight-1", competencies: "[\"SQL\"]" };
    subjectFindUniqueMock.mockResolvedValue({
      id: "subject-1",
      name: "Banco de Dados",
      universityCourse: { title: "Sistemas de Informação" },
      insight: existing,
    });

    const response = await POST(new NextRequest("http://localhost"), { params });

    expect(response.status).toBe(200);
    expect(await response.json()).toEqual({ insight: existing });
    expect(generateMock).not.toHaveBeenCalled();
    expect(insightCreateMock).not.toHaveBeenCalled();
  });

  it("returns 404 when the catalog subject does not exist", async () => {
    subjectFindUniqueMock.mockResolvedValue(null);

    const response = await POST(new NextRequest("http://localhost"), { params });

    expect(response.status).toBe(404);
    expect(generateMock).not.toHaveBeenCalled();
  });

  it("generates and persists a missing catalog insight", async () => {
    subjectFindUniqueMock.mockResolvedValue({
      id: "subject-1",
      name: "Banco de Dados",
      universityCourse: { title: "Sistemas de Informação" },
      insight: null,
    });

    const response = await POST(new NextRequest("http://localhost"), { params });

    expect(response.status).toBe(200);
    expect(generateMock).toHaveBeenCalledWith("Banco de Dados", "Sistemas de Informação");
    expect(insightCreateMock).toHaveBeenCalledWith({
      data: {
        curriculumSubjectId: "subject-1",
        competencies: JSON.stringify(["SQL"]),
        relatedProfessions: JSON.stringify(["Analista de Dados"]),
        suggestedProject: "Criar uma base de dados de vendas",
      },
    });
  });
});
