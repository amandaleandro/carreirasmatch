import { NextResponse } from "next/server";
import { requireAdminApi } from "@/lib/admin";
import { prisma } from "@/lib/prisma";

export async function GET() {
  const { session, response } = await requireAdminApi();
  if (!session) return response!;
  const reports = await prisma.opportunityReport.findMany({
    where: { status: "open" },
    include: {
      opportunity: { select: { id: true, title: true, url: true } },
      user: { select: { email: true } },
    },
    orderBy: { createdAt: "desc" },
    take: 50,
  });
  return NextResponse.json({ reports });
}
