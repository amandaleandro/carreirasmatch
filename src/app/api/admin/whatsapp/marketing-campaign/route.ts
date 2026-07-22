import { NextResponse } from "next/server";
import { requireAdminApi } from "@/lib/admin";
import { prisma } from "@/lib/prisma";
import { evolutionEnabled, sendNextMarketingInviteWhatsapp } from "@/lib/evolution";

/**
 * Disparo manual do convite de marketing (banco de mensagens em
 * MARKETING_INVITE_MESSAGES) pra dois públicos que ainda não converteram:
 * leads com telefone que nunca viraram conta, e usuários cadastrados (com
 * opt-in de WhatsApp) que não têm assinatura ativa nem pagamento aprovado.
 * Idempotente: cada telefone só recebe cada mensagem uma vez, então clicar de
 * novo só avança pro próximo toque de quem ainda não esgotou a lista.
 */
export async function POST() {
  const { session, response } = await requireAdminApi();
  if (!session) return response!;

  if (!evolutionEnabled) {
    return NextResponse.json(
      { error: "Evolution API não configurada no ambiente (EVOLUTION_API_URL/EVOLUTION_API_KEY/EVOLUTION_INSTANCE)." },
      { status: 400 }
    );
  }

  let sent = 0;
  let skipped = 0;
  let total = 0;

  const leads = await prisma.lead.findMany({
    select: { name: true, email: true, phone: true },
    distinct: ["phone"],
  });
  for (const lead of leads) {
    if (!lead.phone.trim()) continue;
    const user = await prisma.user.findUnique({ where: { email: lead.email }, select: { id: true } });
    if (user) continue; // já virou conta, não é mais um lead frio

    total++;
    const didSend = await sendNextMarketingInviteWhatsapp(lead.phone, lead.name);
    if (didSend) sent++;
    else skipped++;
  }

  // Cadastrou mas não assinou: mesmo banco de mensagens, agora pra quem já tem
  // conta mas nunca converteu (sem depender de ter ou não feito uma análise).
  const users = await prisma.user.findMany({
    where: { whatsappMarketingOptIn: true, phone: { not: null } },
    select: {
      name: true,
      phone: true,
      subscription: { select: { status: true } },
      _count: { select: { payments: { where: { status: "paid" } } } },
    },
  });
  for (const user of users) {
    if (!user.phone) continue;
    if (user.subscription?.status === "active" || user._count.payments > 0) continue;

    total++;
    const didSend = await sendNextMarketingInviteWhatsapp(user.phone, user.name);
    if (didSend) sent++;
    else skipped++;
  }

  return NextResponse.json({ sent, skipped, total });
}
