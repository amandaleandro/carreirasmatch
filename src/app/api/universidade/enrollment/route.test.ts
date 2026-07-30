import { beforeEach, describe, expect, it, vi } from "vitest";
import type { NextRequest } from "next/server";

const { authMock, upsertMock } = vi.hoisted(() => ({
  authMock: vi.fn(),
  upsertMock: vi.fn(),
}));

vi.mock("@/auth", () => ({ auth: authMock }));
vi.mock("@/lib/prisma", () => ({
  prisma: { universityEnrollment: { upsert: upsertMock } },
}));

import { POST } from "./route";

function request(body: unknown) {
  return new Request("http://localhost/api/universidade/enrollment", {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify(body),
  }) as unknown as NextRequest;
}

describe("POST /api/universidade/enrollment", () => {
  beforeEach(() => {
    authMock.mockReset();
    upsertMock.mockReset();
    authMock.mockResolvedValue({ user: { id: "user-1" } });
    upsertMock.mockResolvedValue({ id: "enrollment-1", userId: "user-1" });
  });

  it("requires authentication", async () => {
    authMock.mockResolvedValue(null);

    const response = await POST(request({ courseName: "Administração" }));

    expect(response.status).toBe(401);
    expect(upsertMock).not.toHaveBeenCalled();
  });

  it("rejects an empty course name", async () => {
    const response = await POST(request({ courseName: "   " }));

    expect(response.status).toBe(400);
    expect(upsertMock).not.toHaveBeenCalled();
  });

  it("normalizes text fields and persists the authenticated user's enrollment", async () => {
    const response = await POST(
      request({
        institution: " Universidade Federal ",
        courseName: " Administração ",
        period: " 2026.1 ",
        universityCourseId: "course-1",
        currentSemester: 3,
      }),
    );

    expect(response.status).toBe(200);
    expect(upsertMock).toHaveBeenCalledWith({
      where: { userId: "user-1" },
      create: {
        userId: "user-1",
        institution: "Universidade Federal",
        courseName: "Administração",
        period: "2026.1",
        universityCourseId: "course-1",
        currentSemester: 3,
      },
      update: {
        institution: "Universidade Federal",
        courseName: "Administração",
        period: "2026.1",
        universityCourseId: "course-1",
        currentSemester: 3,
      },
    });
  });
});

