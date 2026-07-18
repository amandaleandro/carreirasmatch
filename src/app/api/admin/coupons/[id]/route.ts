import { NextRequest, NextResponse } from "next/server";
import { requireAdminApi } from "@/lib/admin";
import { prisma } from "@/lib/prisma";
import { CouponInputError, parseCouponInput } from "@/lib/coupon-input";
import { CouponOwnerError, resolveCouponOwnerId } from "@/lib/coupon-owner";

export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { session, response } = await requireAdminApi();
  if (!session) return response!;

  const { id } = await params;

  const body = await req.json();

  let input;
  try {
    input = parseCouponInput(body);
  } catch (err) {
    if (err instanceof CouponInputError) {
      return NextResponse.json({ error: err.message }, { status: 400 });
    }
    return NextResponse.json({ error: "Dados inválidos." }, { status: 400 });
  }

  let ownerUserId: string | null | undefined;
  try {
    ownerUserId = await resolveCouponOwnerId(body.ownerEmail, id);
  } catch (err) {
    if (err instanceof CouponOwnerError) {
      return NextResponse.json({ error: err.message }, { status: 400 });
    }
    throw err;
  }

  // O código já foi divulgado pelo influenciador quando o cupom existe; trocá-lo
  // quebraria os links em circulação. Para mudar de código, crie outro cupom.
  if (input.code !== undefined) {
    return NextResponse.json(
      { error: "O código do cupom não pode ser alterado depois de criado." },
      { status: 400 }
    );
  }

  if (Object.keys(input).length === 0 && ownerUserId === undefined) {
    return NextResponse.json({ error: "Nenhum campo para atualizar." }, { status: 400 });
  }

  const coupon = await prisma.coupon
    .update({
      where: { id },
      data: { ...input, ...(ownerUserId === undefined ? {} : { ownerUserId }) },
    })
    .catch(() => null);
  if (!coupon) {
    return NextResponse.json({ error: "Cupom não encontrado." }, { status: 404 });
  }

  return NextResponse.json({ coupon });
}
