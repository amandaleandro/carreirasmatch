import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";


export async function GET() {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Não autorizado" }, { status: 401 });
  }

  let settings = await prisma.autoApplicationSettings.findUnique({
    where: { userId: session.user.id },
  });

  if (!settings) {
    settings = await prisma.autoApplicationSettings.create({
      data: {
        userId: session.user.id,
        enabled: false,
        minMatchScore: 75,
        autoTailorResume: true,
        dailyLimit: 10,
      },
    });
  }

  const queue = await prisma.autoApplicationQueue.findMany({
    where: { userId: session.user.id },
    orderBy: { createdAt: "desc" },
    take: 20,
  });

  return NextResponse.json({ settings, queue });
}

export async function POST(req: Request) {
  const session = await auth();

  if (!session?.user?.id) {
    return NextResponse.json({ error: "Não autorizado" }, { status: 401 });
  }

  try {
    const body = await req.json();
    const { enabled, minMatchScore, autoTailorResume, dailyLimit } = body;

    const settings = await prisma.autoApplicationSettings.upsert({
      where: { userId: session.user.id },
      update: {
        ...(enabled !== undefined && { enabled }),
        ...(minMatchScore !== undefined && { minMatchScore: Number(minMatchScore) }),
        ...(autoTailorResume !== undefined && { autoTailorResume }),
        ...(dailyLimit !== undefined && { dailyLimit: Number(dailyLimit) }),
      },
      create: {
        userId: session.user.id,
        enabled: enabled ?? false,
        minMatchScore: Number(minMatchScore) || 75,
        autoTailorResume: autoTailorResume ?? true,
        dailyLimit: Number(dailyLimit) || 10,
      },
    });

    return NextResponse.json({ success: true, settings });
  } catch (error: any) {
    return NextResponse.json({ error: error.message || "Erro interno" }, { status: 500 });
  }
}
