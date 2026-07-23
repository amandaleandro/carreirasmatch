import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { updatePreapprovalStatus } from "@/lib/mercadopago";
import { sendSubscriptionCancelledEmail } from "@/lib/resend";
import { NextRequest, NextResponse } from "next/server";

/**
 * Gerencia a recorrência da assinatura do próprio usuário: "pause" interrompe
 * as cobranças futuras (o acesso já pago segue até o fim do período), "resume"
 * reativa e "cancel" encerra a recorrência de vez. Planos avulsos (Pix/anual)
 * não renovam sozinhos, então não há o que pausar.
 */
export async function POST(req: NextRequest) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Faça login para continuar." }, { status: 401 });
  }

  const { action } = await req.json();
  if (action !== "pause" && action !== "cancel" && action !== "resume") {
    return NextResponse.json({ error: "Ação inválida." }, { status: 400 });
  }

  const subscription = await prisma.subscription.findUnique({
    where: { userId: session.user.id },
    select: { lastPaymentId: true, status: true },
  });
  if (!subscription) {
    return NextResponse.json({ error: "Você não tem uma assinatura." }, { status: 404 });
  }

  const lastPayment = subscription.lastPaymentId
    ? await prisma.payment.findUnique({
        where: { id: subscription.lastPaymentId },
        select: { kind: true, mpPaymentId: true },
      })
    : null;

  if (lastPayment?.kind !== "subscription" || !lastPayment.mpPaymentId) {
    return NextResponse.json(
      { error: "Seu plano não renova automaticamente — ele apenas expira no fim do período, sem nova cobrança." },
      { status: 400 }
    );
  }

  const mpStatus = action === "pause" ? "paused" : action === "resume" ? "authorized" : "cancelled";
  try {
    await updatePreapprovalStatus(lastPayment.mpPaymentId, mpStatus);
  } catch (err) {
    console.error("subscription/manage: falha ao atualizar preapproval", err);
    return NextResponse.json(
      { error: "Não foi possível atualizar sua assinatura agora. Tente novamente ou fale com o suporte." },
      { status: 502 }
    );
  }

  // O acesso já pago permanece até currentPeriodEnd; o scheduler marca como
  // "expired" depois disso. Só registramos a intenção para o webhook/relatórios.
  if (action === "cancel" && session.user.email) {
    void sendSubscriptionCancelledEmail(session.user.email);
  }

  return NextResponse.json({ ok: true, action });
}
