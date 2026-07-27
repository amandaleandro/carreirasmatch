import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { createPayment } from "@/lib/mercadopago";

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth();
    if (!session?.user?.id) return NextResponse.json({ error: "Não autorizado." }, { status: 401 });
    const { id } = await params;
    const body = await req.json().catch(() => ({}));
    const contract = await prisma.freelanceContract.findUnique({
      where: { id },
      include: { project: true, client: { select: { email: true } } },
    });
    if (!contract || contract.clientUserId !== session.user.id) {
      return NextResponse.json({ error: "Contrato não encontrado." }, { status: 404 });
    }
    if (contract.paymentStatus === "paid") return NextResponse.json({ status: "approved", statusDetail: "paid", pix: null });
    if (contract.paymentStatus === "cancelled") return NextResponse.json({ error: "Este pagamento foi cancelado." }, { status: 409 });

    const formData = body?.formData;
    const payerEmail = contract.client.email;
    if (!formData || typeof formData !== "object" || !payerEmail) {
      return NextResponse.json({ error: "Dados de pagamento ou e-mail do contratante ausentes." }, { status: 400 });
    }
    const token = typeof formData.token === "string" ? formData.token.trim() || undefined : undefined;
    const paymentMethodId = typeof formData.payment_method_id === "string" ? formData.payment_method_id.trim() || undefined : undefined;
    const issuerId = Number(formData.issuer_id);
    const installments = Number(formData.installments);
    const result = await createPayment({
      transactionAmount: contract.agreedCents / 100,
      description: `Serviço freelancer: ${contract.project.title}`,
      token,
      paymentMethodId,
      issuerId: Number.isFinite(issuerId) && issuerId > 0 ? issuerId : undefined,
      installments: Number.isFinite(installments) && installments > 0 ? installments : undefined,
      payerEmail,
      externalReference: `freelance_contract:${contract.id}`,
    });
    const paymentStatus = result.status === "approved" ? "paid" : result.status === "rejected" ? "cancelled" : "pending";
    await prisma.freelanceContract.update({
      where: { id: contract.id },
      data: { mpPaymentId: String(result.id), paymentStatus, paymentPaidAt: paymentStatus === "paid" ? new Date() : null },
    });
    return NextResponse.json({ status: result.status, statusDetail: result.statusDetail, pix: result.pix });
  } catch (error) {
    console.error("Erro no checkout do contrato freelancer:", error);
    return NextResponse.json({ error: error instanceof Error ? error.message : "Erro ao processar pagamento." }, { status: 500 });
  }
}
