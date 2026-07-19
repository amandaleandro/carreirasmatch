import { prisma } from "@/lib/prisma";
import {
  sendOnce,
  sendRenewalReminderEmail,
  sendSubscriptionExpiredEmail,
  sendOnboardingNudgeEmail,
  sendLeadFollowUpEmail,
  sendJobAlertEmail,
  sendDiagnosticUpgradeEmail,
  sendCheckoutRecoveryEmail,
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
    select: {
      id: true,
      name: true,
      email: true,
      analyses: { orderBy: { createdAt: "desc" }, take: 1, select: { id: true } },
    },
  });

  for (const lead of leads) {
    if (!lead.email) continue;
    // Se o e-mail já virou conta, não é mais um lead frio.
    const user = await prisma.user.findUnique({ where: { email: lead.email }, select: { id: true } });
    // A payment attempt creates an account before approval, so an account by
    // itself is not a conversion. Stop recovery only after a paid payment.
    if (user) {
      const paid = await prisma.payment.count({ where: { userId: user.id, status: "paid" } });
      if (paid > 0) continue;
    }

    const analysisId = lead.analyses[0]?.id;
    const checkoutUrl = analysisId ? `/report/${analysisId}` : "/analise";

    await sendOnce("lead_followup", lead.id, lead.email, () =>
      sendLeadFollowUpEmail(lead.email, { name: lead.name, checkoutUrl })
    );
  }
}

async function sendJobAlerts(now: Date): Promise<void> {
  const alerts = await prisma.jobAlert.findMany({
    where: { active: true, user: { email: { not: null } } },
    include: { user: { select: { email: true } } },
  });
  for (const alert of alerts) {
    if (!alert.user.email) continue;
    const days = alert.frequency === "weekly" ? 7 : 1;
    const jobs = await prisma.publicOpportunity.findMany({
      where: {
        active: true,
        createdAt: { gte: new Date(now.getTime() - days * DAY_MS) },
        ...(alert.state ? { state: alert.state } : {}),
        ...(alert.city ? { city: { contains: alert.city } } : {}),
        ...(alert.query
          ? { OR: [{ title: { contains: alert.query } }, { area: { contains: alert.query } }, { description: { contains: alert.query } }] }
          : {}),
      },
      include: { source: { select: { name: true } } },
      orderBy: { createdAt: "desc" },
      take: 10,
    });
    if (jobs.length === 0) continue;
    const period = alert.frequency === "weekly"
      ? `${now.getUTCFullYear()}-W${Math.ceil(now.getUTCDate() / 7)}-${now.getUTCMonth()}`
      : now.toISOString().slice(0, 10);
    await sendOnce("job_alert", `${alert.id}:${period}`, alert.user.email, () =>
      sendJobAlertEmail(alert.user.email!, {
        query: alert.query,
        location: [alert.city, alert.state].filter(Boolean).join(", "),
        jobs: jobs.map((job) => ({ title: job.title, url: job.url, source: job.source.name })),
      }),
    );
  }
}

async function sendDiagnosticUpgradeEmails(now: Date): Promise<void> {
  const from = new Date(now.getTime() - 4 * DAY_MS);
  const to = new Date(now.getTime() - 1 * DAY_MS);
  const payments = await prisma.payment.findMany({
    where: { kind: "diagnostic", status: "paid", paidAt: { gte: from, lte: to } },
    select: {
      id: true,
      analysisId: true,
      segment: true,
      user: { select: { email: true, subscription: { select: { status: true } } } },
    },
  });
  for (const payment of payments) {
    if (!payment.user.email || payment.user.subscription?.status === "active") continue;
    await sendOnce("diagnostic_upgrade", payment.id, payment.user.email, () =>
      sendDiagnosticUpgradeEmail(payment.user.email!, {
        segment: payment.segment,
        analysisId: payment.analysisId,
      })
    );
  }
}

async function sendCheckoutRecoveryEmails(now: Date): Promise<void> {
  const from = new Date(now.getTime() - 3 * DAY_MS);
  const to = new Date(now.getTime() - 6 * 60 * 60 * 1000);
  const attempts = await prisma.payment.findMany({
    where: {
      kind: { in: ["subscription", "subscription_monthly", "subscription_annual"] },
      status: { in: ["pending", "cancelled"] },
      createdAt: { gte: from, lte: to },
    },
    select: {
      id: true,
      segment: true,
      user: { select: { email: true, subscription: { select: { status: true } } } },
    },
  });
  for (const attempt of attempts) {
    if (!attempt.user.email || attempt.user.subscription?.status === "active") continue;
    await sendOnce("checkout_recovery", attempt.id, attempt.user.email, () =>
      sendCheckoutRecoveryEmail(attempt.user.email!, { segment: attempt.segment })
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
    ["diagnostic_upgrades", () => sendDiagnosticUpgradeEmails(now)],
    ["checkout_recovery", () => sendCheckoutRecoveryEmails(now)],
    ["job_alerts", () => sendJobAlerts(now)],
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
