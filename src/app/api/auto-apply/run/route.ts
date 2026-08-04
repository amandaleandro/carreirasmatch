import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { runAutoApplyForUser } from "@/lib/auto-apply";
import { prisma } from "@/lib/prisma";

export async function POST() {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Não autorizado" }, { status: 401 });
  }

  try {
    const settings = await prisma.autoApplicationSettings.findUnique({
      where: { userId: session.user.id },
      select: { enabled: true, consentedAt: true },
    });
    if (!settings?.enabled || !settings.consentedAt) {
      return NextResponse.json(
        { error: "Ative o Piloto Automático antes de executar o processamento." },
        { status: 409 },
      );
    }

    const run = await runAutoApplyForUser(session.user.id);
    console.log(
      `[auto-apply manual] queued=${run.queued} applied=${run.applied} unsupported=${run.unsupported} failed=${run.failed} skipped=${run.skipped}`,
    );
    return NextResponse.json({ success: true, run });
  } catch (error) {
    console.error("auto-apply manual run:", error);
    return NextResponse.json({ error: "Não foi possível executar o piloto automático." }, { status: 500 });
  }
}
