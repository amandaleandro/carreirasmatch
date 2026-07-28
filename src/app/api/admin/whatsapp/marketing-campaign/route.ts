import { NextResponse } from "next/server";
import { requireAdminApi } from "@/lib/admin";
import { prisma } from "@/lib/prisma";
import { evolutionEnabled, listWhatsappInstances, sendNextMarketingInviteWhatsapp } from "@/lib/evolution";

/**
 * Disparo manual do convite de marketing (banco de mensagens em
 * MARKETING_INVITE_MESSAGES) pra usuários cadastrados com opt-in de WhatsApp
 * que ainda não converteram (sem assinatura ativa nem pagamento aprovado).
 * Idempotente: cada telefone só recebe cada mensagem uma vez, então clicar de
 * novo só avança pro próximo toque de quem ainda não esgotou a lista.
 *
 * Não inclui `leads` (contatos capturados em formulários que nunca viraram
 * conta): esse público nunca deu opt-in de WhatsApp, e mandar marketing sem
 * consentimento pra ele foi o que gerou denúncias em massa e o ban do número
 * em 2026-07-28. Ver AGENTS.md / whatsappMarketingOptIn.
 */
export async function POST() {
  const { session, response } = await requireAdminApi();
  if (!session) return response!;

  if (!evolutionEnabled) {
    return NextResponse.json(
      { error: "Evolution API não configurada no ambiente (EVOLUTION_API_URL/EVOLUTION_API_KEY)." },
      { status: 400 }
    );
  }

  const instances = await listWhatsappInstances();
  if (instances.length === 0) {
    return NextResponse.json(
      { error: "Nenhum número cadastrado. Cadastre e pareie ao menos um em Admin → WhatsApp." },
      { status: 400 }
    );
  }

  let sent = 0;
  let skipped = 0;
  let failed = 0;
  let total = 0;

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
    const result = await sendNextMarketingInviteWhatsapp(user.phone, user.name);
    if (result === "sent") sent++;
    else if (result === "failed") failed++;
    else skipped++;
  }

  return NextResponse.json({ sent, skipped, failed, total });
}
