import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";

export async function POST() {
  const session = await auth();

  if (!session?.user?.email) {
    return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  }

  try {
    const deleted = await prisma.pageView.deleteMany({});
    return NextResponse.json({ success: true, count: deleted.count });
  } catch (error) {
    console.error("Erro ao resetar analytics:", error);
    return NextResponse.json({ error: "internal_error" }, { status: 500 });
  }
}
