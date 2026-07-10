import { NextRequest, NextResponse } from "next/server";
import { requireAdminApi } from "@/lib/admin";
import { prisma } from "@/lib/prisma";

export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { session, response } = await requireAdminApi();
  if (!session) return response!;

  const { id } = await params;
  const { active } = await req.json();
  if (typeof active !== "boolean") {
    return NextResponse.json({ error: "Campo 'active' é obrigatório." }, { status: 400 });
  }

  const coupon = await prisma.coupon.update({ where: { id }, data: { active } }).catch(() => null);
  if (!coupon) {
    return NextResponse.json({ error: "Cupom não encontrado." }, { status: 404 });
  }

  return NextResponse.json({ coupon });
}
