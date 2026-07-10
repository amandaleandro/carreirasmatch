import { NextRequest, NextResponse } from "next/server";
import { requireAdminApi } from "@/lib/admin";
import { prisma } from "@/lib/prisma";

export async function GET(req: NextRequest) {
  const { session, response } = await requireAdminApi();
  if (!session) return response!;

  const email = req.nextUrl.searchParams.get("email")?.trim();
  if (!email) {
    return NextResponse.json({ error: "Informe um e-mail." }, { status: 400 });
  }

  const user = await prisma.user.findUnique({
    where: { email },
    select: {
      id: true,
      name: true,
      email: true,
      careerSegment: true,
      subscription: { select: { status: true, segment: true, currentPeriodEnd: true } },
      payments: {
        orderBy: { createdAt: "desc" },
        take: 20,
        select: { id: true, kind: true, segment: true, amount: true, status: true, analysisId: true, createdAt: true },
      },
    },
  });

  if (!user) {
    return NextResponse.json({ error: "Usuário não encontrado." }, { status: 404 });
  }

  const analyses = await prisma.analysis.findMany({
    where: { resume: { userId: user.id } },
    orderBy: { createdAt: "desc" },
    take: 20,
    select: { id: true, jobTitle: true, createdAt: true },
  });

  const unlockedAnalysisIds = new Set(
    user.payments.filter((p) => p.kind === "diagnostic" && p.status === "paid" && p.analysisId).map((p) => p.analysisId)
  );

  return NextResponse.json({
    user: {
      id: user.id,
      name: user.name,
      email: user.email,
      careerSegment: user.careerSegment,
    },
    subscription: user.subscription,
    payments: user.payments,
    analyses: analyses.map((a) => ({ ...a, unlocked: unlockedAnalysisIds.has(a.id) })),
  });
}
