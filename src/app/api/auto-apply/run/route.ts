import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { runAutoApplyForUser } from "@/lib/auto-apply";

export async function POST() {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Não autorizado" }, { status: 401 });
  }

  try {
    const run = await runAutoApplyForUser(session.user.id);
    return NextResponse.json({ success: true, run });
  } catch (error) {
    console.error("auto-apply manual run:", error);
    return NextResponse.json({ error: "Não foi possível executar o piloto automático." }, { status: 500 });
  }
}
