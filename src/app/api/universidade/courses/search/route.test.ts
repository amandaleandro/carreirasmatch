import { beforeEach, describe, expect, it, vi } from "vitest";
import { NextRequest } from "next/server";

const { authMock, findManyMock } = vi.hoisted(() => ({ authMock: vi.fn(), findManyMock: vi.fn() }));

vi.mock("@/auth", () => ({ auth: authMock }));
vi.mock("@/lib/prisma", () => ({ prisma: { universityCourse: { findMany: findManyMock } } }));

import { GET } from "./route";

describe("GET /api/universidade/courses/search", () => {
  beforeEach(() => {
    authMock.mockReset();
    findManyMock.mockReset();
    authMock.mockResolvedValue({ user: { id: "user-1" } });
    findManyMock.mockResolvedValue([
      {
        id: "course-1",
        title: "Sistemas de Informação",
        area: "Tecnologia",
        university: { name: "UFMA", city: "São Luís", state: "MA" },
      },
    ]);
  });

  it("returns an empty result without querying for a short term", async () => {
    const response = await GET(new NextRequest("http://localhost/api/universidade/courses/search?q=a"));

    expect(response.status).toBe(200);
    expect(await response.json()).toEqual({ courses: [] });
    expect(findManyMock).not.toHaveBeenCalled();
  });

  it("searches active courses and maps the public response", async () => {
    const response = await GET(new NextRequest("http://localhost/api/universidade/courses/search?q=  sistemas  "));

    expect(response.status).toBe(200);
    expect(findManyMock).toHaveBeenCalledWith({
      where: { active: true, title: { contains: "sistemas", mode: "insensitive" } },
      include: { university: { select: { name: true, city: true, state: true } } },
      take: 15,
      orderBy: { title: "asc" },
    });
    expect(await response.json()).toEqual({
      courses: [
        {
          id: "course-1",
          title: "Sistemas de Informação",
          area: "Tecnologia",
          universityName: "UFMA",
          city: "São Luís",
          state: "MA",
        },
      ],
    });
  });
});

