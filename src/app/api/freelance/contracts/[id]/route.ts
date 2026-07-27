import { NextResponse } from "next/server";
import { requireAuth } from "@/lib/require-auth";
import { prisma } from "@/lib/prisma";

export async function PATCH(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const { session, response } = await requireAuth();
  if (!session) return response;
  const { id } = await params;
  let body: { action?: string };
  try { body = await req.json(); } catch { return NextResponse.json({ error: "Requisição inválida." }, { status: 400 }); }
  const action = body.action;
  const contract = await prisma.freelanceContract.findUnique({ where: { id } });
  if (!contract) return NextResponse.json({ error: "Contrato não encontrado." }, { status: 404 });
  const isClient = contract.clientUserId === session.user.id;
  const isFreelancer = contract.freelancerUserId === session.user.id;
  if (!isClient && !isFreelancer) return NextResponse.json({ error: "Sem permissão." }, { status: 403 });

  if (action === "deliver") {
    if (!isFreelancer) return NextResponse.json({ error: "Só o freelancer marca a entrega." }, { status: 403 });
    if (contract.status !== "active") return NextResponse.json({ error: "O contrato não está ativo." }, { status: 409 });
    await prisma.freelanceContract.update({
      where: { id },
      data: { status: "delivered", deliveredAt: new Date(), freelancerConfirmedAt: new Date() },
    });
    return NextResponse.json({ ok: true });
  }

  if (action === "complete") {
    if (!isClient) return NextResponse.json({ error: "Só o contratante confirma a conclusão." }, { status: 403 });
    if (contract.status === "completed") return NextResponse.json({ error: "O contrato já foi concluído." }, { status: 409 });
    if (contract.status === "cancelled") return NextResponse.json({ error: "O contrato foi cancelado." }, { status: 409 });
    if (contract.paymentStatus !== "paid") return NextResponse.json({ error: "O pagamento precisa ser aprovado antes da confirmação." }, { status: 409 });
    if (contract.status !== "delivered" || !contract.freelancerConfirmedAt) return NextResponse.json({ error: "Aguarde o freelancer confirmar a entrega." }, { status: 409 });
    const now = new Date();
    // O repasse ao freelancer não é automático: o Mercado Pago não oferece
    // transferência para chave Pix de terceiros, então o valor fica retido na
    // conta da plataforma e "ready" entra numa fila que um admin confirma
    // manualmente (via /admin/repasses) depois de transferir de fato.
    await prisma.$transaction([
      prisma.freelanceContract.update({
        where: { id },
        data: { status: "completed", completedAt: now, clientConfirmedAt: now, payoutStatus: "ready" },
      }),
      prisma.freelanceProject.update({ where: { id: contract.projectId }, data: { status: "completed" } }),
      prisma.freelancerProfile.updateMany({ where: { userId: contract.freelancerUserId }, data: { completedCount: { increment: 1 } } }),
    ]);
    return NextResponse.json({ ok: true, payoutStatus: "ready" });
  }

  if (action === "cancel") {
    if (contract.status === "completed") return NextResponse.json({ error: "Um contrato concluído não pode ser cancelado." }, { status: 409 });
    if (contract.status === "cancelled") return NextResponse.json({ error: "O contrato já foi cancelado." }, { status: 409 });
    await prisma.$transaction([
      prisma.freelanceContract.update({ where: { id }, data: { status: "cancelled" } }),
      prisma.freelanceProject.update({ where: { id: contract.projectId }, data: { status: "open" } }),
    ]);
    return NextResponse.json({ ok: true });
  }
  return NextResponse.json({ error: "Ação inválida." }, { status: 400 });
}
