import { beforeEach, describe, expect, it, vi } from "vitest";
import { NextRequest } from "next/server";

const { authMock, enrollmentFindUniqueMock, subjectCreateMock, subjectDeleteManyMock } = vi.hoisted(() => ({
  authMock: vi.fn(),
  enrollmentFindUniqueMock: vi.fn(),
  subjectCreateMock: vi.fn(),
  subjectDeleteManyMock: vi.fn(),
}));

vi.mock("@/auth", () => ({ auth: authMock }));
vi.mock("@/lib/prisma", () => ({
  prisma: {
    universityEnrollment: { findUnique: enrollmentFindUniqueMock },
    universitySubject: { create: subjectCreateMock, deleteMany: subjectDeleteManyMock },
  },
}));

import { DELETE, POST } from "./route";

function request(method: string, body: unknown) {
  return new NextRequest("http://localhost/api/universidade/subjects", {
    method,
    headers: { "content-type": "application/json" },
    body: JSON.stringify(body),
  });
}

describe("/api/universidade/subjects", () => {
  beforeEach(() => {
    authMock.mockReset();
    enrollmentFindUniqueMock.mockReset();
    subjectCreateMock.mockReset();
    subjectDeleteManyMock.mockReset();
    authMock.mockResolvedValue({ user: { id: "user-1" } });
    enrollmentFindUniqueMock.mockResolvedValue({ id: "enrollment-1" });
    subjectCreateMock.mockResolvedValue({ id: "subject-1", name: "Banco de Dados" });
    subjectDeleteManyMock.mockResolvedValue({ count: 1 });
  });

  it("requires an enrollment before creating a manual subject", async () => {
    enrollmentFindUniqueMock.mockResolvedValue(null);

    const response = await POST(request("POST", { name: "Banco de Dados" }));

    expect(response.status).toBe(400);
    expect(subjectCreateMock).not.toHaveBeenCalled();
  });

  it("creates a trimmed manual subject under the authenticated enrollment", async () => {
    const response = await POST(request("POST", { name: "  Banco de Dados  " }));

    expect(response.status).toBe(200);
    expect(subjectCreateMock).toHaveBeenCalledWith({
      data: { enrollmentId: "enrollment-1", name: "Banco de Dados" },
    });
  });

  it("scopes deletion to the authenticated user's enrollment", async () => {
    const response = await DELETE(request("DELETE", { id: "subject-1" }));

    expect(response.status).toBe(200);
    expect(subjectDeleteManyMock).toHaveBeenCalledWith({
      where: { id: "subject-1", enrollment: { userId: "user-1" } },
    });
  });
});
