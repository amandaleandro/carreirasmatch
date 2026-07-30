import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requirePartnerApi } from "@/lib/partner-auth";

export async function GET(req: NextRequest) {
  const { partner, response } = await requirePartnerApi();
  if (!partner) return response!;

  const q = (req.nextUrl.searchParams.get("q") ?? "").trim();
  if (q.length < 2) return NextResponse.json({ universities: [] });

  const universities = await prisma.university.findMany({
    where: { active: true, name: { contains: q, mode: "insensitive" } },
    select: { id: true, name: true, city: true, state: true },
    take: 10,
    orderBy: { name: "asc" },
  });

  return NextResponse.json({ universities });
}

export async function POST(req: NextRequest) {
  const { partner, response } = await requirePartnerApi();
  if (!partner) return response!;

  const { universityId } = await req.json();
  if (typeof universityId !== "string" || !universityId.trim()) {
    return NextResponse.json({ error: "Selecione uma instituição." }, { status: 400 });
  }

  const university = await prisma.university.findUnique({ where: { id: universityId } });
  if (!university) {
    return NextResponse.json({ error: "Instituição não encontrada." }, { status: 404 });
  }

  await prisma.partner.update({ where: { id: partner.id }, data: { universityId } });

  return NextResponse.json({ ok: true });
}
