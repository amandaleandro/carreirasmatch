import { prisma } from "@/lib/prisma";
import {
  sendOnce,
  sendRenewalReminderEmail,
  sendSubscriptionExpiredEmail,
  sendOnboardingNudgeEmail,
  sendLeadFollowUpEmail,
} from "@/lib/resend";

// O scheduler roda algumas vezes ao dia; a idempotência (sendOnce + EmailLog)
// garante que cada e-mail de ciclo de vida saia uma única vez por evento.
const TICK_INTERVAL_MS = 6 * 60 * 60 * 1000; // 6h
const INITIAL_DELAY_MS = 60 * 1000;
const DAY_MS = 24 * 60 * 60 * 1000;

/**
 * Lembrete de renovação: assinaturas ativas cujo período termina em ~3 dias
 * (janela de 2 a 4 dias à frente). A dedupeKey inclui o fim do período, então
 * o próximo ciclo/renovação gera um novo lembrete.
 */
async function sendRenewalReminders(now: Date): Promise<void> {
  const from = new Date(now.getTime() + 2 * DAY_MS);
  const to = new Date(now.getTime() + 4 * DAY_MS);

  const subs = await prisma.subscription.findMany({
    where: { status: "active", currentPeriodEnd: { gte: from, lte: to } },
    select: {
      currentPeriodEnd: true,
      lastPaymentId: true,
      user: { select: { email: true } },
    },
  });

  for (const sub of subs) {
    const email = sub.user.email;
    if (!email || !sub.currentPeriodEnd) continue;

    // Recorrente (cartão via Preapproval) renova sozinho; plano avulso (Pix) não.
    const lastPayment = sub.lastPaymentId
      ? await prisma.payment.findUnique({ where: { id: sub.lastPaymentId }, select: { kind: true } })
      : null;
    const autoRenews = lastPayment?.kind === "subscription";

    const key = `${email}:${sub.currentPeriodEnd.toISOString()}`;
    await sendOnce("renewal_reminder", key, email, () =>
      sendRenewalReminderEmail(email, { currentPeriodEnd: sub.currentPeriodEnd!, autoRenews })
    );
  }
}

/**
 * Assinaturas cujo período já terminou mas ainda estão marcadas como ativas:
 * marca como "expired" e avisa o cliente (uma vez por período expirado).
 */
async function expireLapsedSubscriptions(now: Date): Promise<void> {
  const lapsed = await prisma.subscription.findMany({
    where: { status: "active", currentPeriodEnd: { lt: now } },
    select: {
      id: true,
      currentPeriodEnd: true,
      user: { select: { email: true } },
    },
  });

  for (const sub of lapsed) {
    await prisma.subscription.update({ where: { id: sub.id }, data: { status: "expired" } });

    const email = sub.user.email;
    if (!email) continue;
    const key = `${email}:${sub.currentPeriodEnd?.toISOString() ?? sub.id}`;
    await sendOnce("subscription_expired", key, email, () => sendSubscriptionExpiredEmail(email));
  }
}

/**
 * Nudge de onboarding: usuários criados entre 2 e 4 dias atrás que ainda não
 * fizeram nenhuma análise. Uma vez por usuário.
 */
async function sendOnboardingNudges(now: Date): Promise<void> {
  const from = new Date(now.getTime() - 4 * DAY_MS);
  const to = new Date(now.getTime() - 2 * DAY_MS);

  const users = await prisma.user.findMany({
    where: { createdAt: { gte: from, lte: to }, email: { not: null } },
    select: { id: true, name: true, email: true },
  });

  for (const user of users) {
    if (!user.email) continue;
    const analyses = await prisma.analysis.count({ where: { resume: { userId: user.id } } });
    if (analyses > 0) continue;

    await sendOnce("onboarding_nudge", user.id, user.email, () =>
      sendOnboardingNudgeEmail(user.email!, { name: user.name })
    );
  }
}

/**
 * Follow-up de lead: visitantes que deixaram contato (via análise/teste) entre 1
 * e 3 dias atrás e ainda não viraram usuários. Uma vez por lead.
 */
async function sendLeadFollowUps(now: Date): Promise<void> {
  const from = new Date(now.getTime() - 3 * DAY_MS);
  const to = new Date(now.getTime() - 1 * DAY_MS);

  const leads = await prisma.lead.findMany({
    where: { createdAt: { gte: from, lte: to } },
    select: { id: true, name: true, email: true },
  });

  for (const lead of leads) {
    if (!lead.email) continue;
    // Se o e-mail já virou conta, não é mais um lead frio.
    const user = await prisma.user.findUnique({ where: { email: lead.email }, select: { id: true } });
    if (user) continue;

    await sendOnce("lead_followup", lead.id, lead.email, () =>
      sendLeadFollowUpEmail(lead.email, { name: lead.name })
    );
  }
}

export async function runLifecycleEmailTick(): Promise<void> {
  const now = new Date();
  const steps: Array<[string, () => Promise<void>]> = [
    ["renewal_reminders", () => sendRenewalReminders(now)],
    ["expire_subscriptions", () => expireLapsedSubscriptions(now)],
    ["onboarding_nudges", () => sendOnboardingNudges(now)],
    ["lead_followups", () => sendLeadFollowUps(now)],
  ];
  for (const [name, step] of steps) {
    try {
      await step();
    } catch (error) {
      console.error(`email-scheduler: step "${name}" failed`, error);
    }
  }
}

let started = false;

export function startEmailScheduler(): void {
  if (started) return;
  started = true;

  setTimeout(() => {
    void runLifecycleEmailTick();
    setInterval(() => void runLifecycleEmailTick(), TICK_INTERVAL_MS);
  }, INITIAL_DELAY_MS);
}
