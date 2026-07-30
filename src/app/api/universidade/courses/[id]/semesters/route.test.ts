import { beforeEach, describe, expect, it, vi } from "vitest";
import { NextRequest } from "next/server";

const { authMock, findManyMock } = vi.hoisted(() => ({ authMock: vi.fn(), findManyMock: vi.fn() }));

vi.mock("@/auth", () => ({ auth: authMock }));
vi.mock("@/lib/prisma", () => ({ prisma: { curriculumSubject: { findMany: findManyMock } } }));

import { GET } from "./route";

const params = Promise.resolve({ id: "course-1" });

describe("GET /api/universidade/courses/[id]/semesters", () => {
  beforeEach(() => {
    authMock.mockReset();
    findManyMock.mockReset();
    authMock.mockResolvedValue({ user: { id: "user-1" } });
    findManyMock.mockResolvedValue([{ semester: 1 }, { semester: 2 }, { semester: null }]);
  });

  it("requires authentication", async () => {
    authMock.mockResolvedValue(null);

    const response = await GET(new NextRequest("http://localhost"), { params });

    expect(response.status).toBe(401);
    expect(findManyMock).not.toHaveBeenCalled();
  });

  it("returns distinct non-null semesters for the course", async () => {
    const response = await GET(new NextRequest("http://localhost"), { params });

    expect(response.status).toBe(200);
    expect(findManyMock).toHaveBeenCalledWith({
      where: { universityCourseId: "course-1", semester: { not: null } },
      select: { semester: true },
      distinct: ["semester"],
      orderBy: { semester: "asc" },
    });
    expect(await response.json()).toEqual({ semesters: [1, 2] });
  });
});

