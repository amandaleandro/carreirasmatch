import { beforeEach, describe, expect, it, vi } from "vitest";
import { NextRequest } from "next/server";

const { reserveFeatureForRouteMock, subjectFindFirstMock, subjectUpdateMock, generateMock } = vi.hoisted(() => ({
  reserveFeatureForRouteMock: vi.fn(),
  subjectFindFirstMock: vi.fn(),
  subjectUpdateMock: vi.fn(),
  generateMock: vi.fn(),
}));

vi.mock("@/lib/feature-access", () => ({ reserveFeatureForRoute: reserveFeatureForRouteMock }));
vi.mock("@/lib/prisma", () => ({
  prisma: {
    universitySubject: { findFirst: subjectFindFirstMock, update: subjectUpdateMock },
  },
}));
vi.mock("@/lib/university", () => ({ generateSubjectCareerInsight: generateMock }));

import { POST } from "./route";

const params = Promise.resolve({ id: "subject-1" });

function allowedRelease() {
  return { confirm: vi.fn().mockResolvedValue(undefined), cancel: vi.fn().mockResolvedValue(undefined) };
}

describe("POST /api/universidade/subjects/[id]/insight", () => {
  beforeEach(() => {
    reserveFeatureForRouteMock.mockReset();
    subjectFindFirstMock.mockReset();
    subjectUpdateMock.mockReset();
    generateMock.mockReset();
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
    subjectUpdateMock.mockResolvedValue({ id: "subject-1", competencies: "[\"SQL\"]" });
  });

  it("does not allow access to a subject outside the user's enrollment", async () => {
    subjectFindFirstMock.mockResolvedValue(null);

    const response = await POST(new NextRequest("http://localhost"), { params });

    expect(response.status).toBe(404);
    expect(generateMock).not.toHaveBeenCalled();
    expect(subjectUpdateMock).not.toHaveBeenCalled();
  });

  it("generates and stores the insight for the user's subject", async () => {
    subjectFindFirstMock.mockResolvedValue({
      id: "subject-1",
      name: "Banco de Dados",
      enrollment: { userId: "user-1", courseName: "Sistemas de Informação" },
    });

    const response = await POST(new NextRequest("http://localhost"), { params });

    expect(response.status).toBe(200);
    expect(generateMock).toHaveBeenCalledWith("Banco de Dados", "Sistemas de Informação");
    expect(subjectUpdateMock).toHaveBeenCalledWith({
      where: { id: "subject-1" },
      data: expect.objectContaining({
        competencies: JSON.stringify(["SQL"]),
        relatedProfessions: JSON.stringify(["Analista de Dados"]),
        suggestedProject: "Criar uma base de dados de vendas",
      }),
    });
  });

  it("returns a recoverable error when AI generation fails", async () => {
    subjectFindFirstMock.mockResolvedValue({
      id: "subject-1",
      name: "Banco de Dados",
      enrollment: { userId: "user-1", courseName: "Sistemas de Informação" },
    });
    generateMock.mockRejectedValue(new Error("provider unavailable"));

    const response = await POST(new NextRequest("http://localhost"), { params });

    expect(response.status).toBe(500);
    expect(subjectUpdateMock).not.toHaveBeenCalled();
  });
});

