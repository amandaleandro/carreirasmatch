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
  sendConvertToSubscriptionEmail,
  sendConvertSecondNudgeEmail,
  sendUrgencyCouponEmail,
  sendFirstAnalysisMilestoneEmail,
  sendScoreImprovedEmail,
  sendAnalysisCountMilestoneEmail,
  sendCompanyDormantNudgeEmail,
} from "@/lib/resend";
import { createUrgencyCoupon } from "@/lib/coupons";
import { sendPushToUser } from "@/lib/push";

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

/**
 * Empurrão de conversão para o lead mais quente: fez o cadastro, já rodou ao
 * menos uma análise (provou o produto) entre 4 e 7 dias atrás, mas não comprou
 * nada nem tem assinatura ativa. É o estado que nenhum outro e-mail cobre; o
 * onboarding_nudge só fala com quem NÃO analisou. Uma vez por usuário.
 *
 * Piso de data: só consideramos análises a partir de CONVERT_EMAIL_START para
 * não disparar de uma vez para toda a base acumulada na primeira execução em
 * produção. O funil pega os que entrarem no estado a partir daqui.
 */
const CONVERT_EMAIL_START = new Date("2026-07-20T00:00:00Z");

async function sendConvertToSubscriptionEmails(now: Date): Promise<void> {
  const windowStart = new Date(now.getTime() - 7 * DAY_MS);
  const from = windowStart > CONVERT_EMAIL_START ? windowStart : CONVERT_EMAIL_START;
  const to = new Date(now.getTime() - 4 * DAY_MS);
  if (from > to) return;

  // Usuários com análise na janela. `distinct` + `orderBy desc` garante que a
  // primeira ocorrência de cada userId é a análise mais recente dele, usada
  // pra personalizar o e-mail com o score/vaga reais.
  const analyses = await prisma.analysis.findMany({
    where: {
      createdAt: { gte: from, lte: to },
      resume: { user: { email: { not: null } } },
    },
    select: { overallScore: true, jobTitle: true, resume: { select: { userId: true } } },
    orderBy: { createdAt: "desc" },
    distinct: ["resumeId"],
  });

  const seen = new Set<string>();
  for (const analysis of analyses) {
    const userId = analysis.resume.userId;
    if (!userId || seen.has(userId)) continue;
    seen.add(userId);

    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: {
        email: true,
        name: true,
        careerSegment: true,
        subscription: { select: { status: true } },
        _count: { select: { payments: { where: { status: "paid" } } } },
      },
    });
    // Já converteu (assinou ou pagou qualquer coisa): sai do funil.
    if (!user?.email || user.subscription?.status === "active" || user._count.payments > 0) continue;

    await sendOnce("convert_to_subscription", userId, user.email, () =>
      sendConvertToSubscriptionEmail(user.email!, {
        name: user.name,
        segment: user.careerSegment,
        score: analysis.overallScore,
        jobTitle: analysis.jobTitle,
      })
    );
  }
}

/**
 * Segundo toque da régua de conversão: mesma condição do primeiro (analisou,
 * não comprou nada), mas numa janela mais tardia (10-13 dias) e com um ângulo
 * diferente, pra quem ignorou o primeiro e-mail.
 */
async function sendConvertSecondNudgeEmails(now: Date): Promise<void> {
  const windowStart = new Date(now.getTime() - 13 * DAY_MS);
  const from = windowStart > CONVERT_EMAIL_START ? windowStart : CONVERT_EMAIL_START;
  const to = new Date(now.getTime() - 10 * DAY_MS);
  if (from > to) return;

  const analyses = await prisma.analysis.findMany({
    where: {
      createdAt: { gte: from, lte: to },
      resume: { user: { email: { not: null } } },
    },
    select: { resume: { select: { userId: true } } },
    distinct: ["resumeId"],
  });

  const seen = new Set<string>();
  for (const analysis of analyses) {
    const userId = analysis.resume.userId;
    if (!userId || seen.has(userId)) continue;
    seen.add(userId);

    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: {
        email: true,
        careerSegment: true,
        subscription: { select: { status: true } },
        _count: { select: { payments: { where: { status: "paid" } } } },
      },
    });
    if (!user?.email || user.subscription?.status === "active" || user._count.payments > 0) continue;

    await sendOnce("convert_second_nudge", userId, user.email, () =>
      sendConvertSecondNudgeEmail(user.email!, { segment: user.careerSegment })
    );
  }
}

/**
 * Terceiro e último toque da régua de conversão: mesma condição, janela mais
 * tardia (16-18 dias), e desta vez com um cupom pessoal de uso único gerado
 * na hora do envio (não antes, pra não criar cupons de quem converteu entre
 * o disparo do segundo toque e este).
 */
async function sendUrgencyCouponEmails(now: Date): Promise<void> {
  const windowStart = new Date(now.getTime() - 18 * DAY_MS);
  const from = windowStart > CONVERT_EMAIL_START ? windowStart : CONVERT_EMAIL_START;
  const to = new Date(now.getTime() - 16 * DAY_MS);
  if (from > to) return;

  const analyses = await prisma.analysis.findMany({
    where: {
      createdAt: { gte: from, lte: to },
      resume: { user: { email: { not: null } } },
    },
    select: { resume: { select: { userId: true } } },
    distinct: ["resumeId"],
  });

  const seen = new Set<string>();
  for (const analysis of analyses) {
    const userId = analysis.resume.userId;
    if (!userId || seen.has(userId)) continue;
    seen.add(userId);

    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: {
        email: true,
        careerSegment: true,
        subscription: { select: { status: true } },
        _count: { select: { payments: { where: { status: "paid" } } } },
      },
    });
    if (!user?.email || user.subscription?.status === "active" || user._count.payments > 0) continue;

    await sendOnce("urgency_coupon", userId, user.email, async () => {
      const { code, expiresAt } = await createUrgencyCoupon({ percent: 20, hours: 48 });
      await sendUrgencyCouponEmail(user.email!, { code, expiresAt, segment: user.careerSegment });
    });
  }
}

/**
 * Piso de data para os e-mails de marco/gamificação, mesmo motivo do
 * CONVERT_EMAIL_START: evita disparar de uma vez pra toda a base histórica de
 * análises na primeira execução em produção.
 */
const MILESTONE_START = new Date("2026-07-21T00:00:00Z");

/** Comemora a primeira análise concluída por cada usuário, uma vez por usuário. */
async function sendFirstAnalysisMilestones(now: Date): Promise<void> {
  const windowStart = new Date(now.getTime() - 2 * DAY_MS);
  const from = windowStart > MILESTONE_START ? windowStart : MILESTONE_START;
  if (from > now) return;

  const analyses = await prisma.analysis.findMany({
    where: { createdAt: { gte: from, lte: now } },
    select: { createdAt: true, resume: { select: { userId: true } } },
    orderBy: { createdAt: "asc" },
  });

  const seen = new Set<string>();
  for (const analysis of analyses) {
    const userId = analysis.resume.userId;
    if (!userId || seen.has(userId)) continue;
    seen.add(userId);

    const priorCount = await prisma.analysis.count({
      where: { resume: { userId }, createdAt: { lt: analysis.createdAt } },
    });
    if (priorCount > 0) continue; // não é a primeira análise do usuário

    const user = await prisma.user.findUnique({ where: { id: userId }, select: { email: true, name: true } });
    if (!user?.email) continue;

    await sendOnce("milestone_first_analysis", userId, user.email, () =>
      sendFirstAnalysisMilestoneEmail(user.email!, { name: user.name })
    );
  }
}

/** Comemora quando uma análise supera a anterior do mesmo usuário por uma margem relevante. */
async function sendScoreImprovedMilestones(now: Date): Promise<void> {
  const windowStart = new Date(now.getTime() - 2 * DAY_MS);
  const from = windowStart > MILESTONE_START ? windowStart : MILESTONE_START;
  if (from > now) return;

  const SCORE_IMPROVEMENT_THRESHOLD = 15;

  const analyses = await prisma.analysis.findMany({
    where: { createdAt: { gte: from, lte: now } },
    select: { id: true, overallScore: true, jobTitle: true, createdAt: true, resume: { select: { userId: true } } },
    orderBy: { createdAt: "asc" },
  });

  for (const analysis of analyses) {
    const userId = analysis.resume.userId;
    if (!userId) continue;

    const previous = await prisma.analysis.findFirst({
      where: { resume: { userId }, createdAt: { lt: analysis.createdAt } },
      orderBy: { createdAt: "desc" },
      select: { overallScore: true },
    });
    if (!previous || analysis.overallScore - previous.overallScore < SCORE_IMPROVEMENT_THRESHOLD) continue;

    const user = await prisma.user.findUnique({ where: { id: userId }, select: { email: true } });
    if (!user?.email) continue;

    await sendOnce("milestone_score_improved", analysis.id, user.email, () =>
      sendScoreImprovedEmail(user.email!, {
        previousScore: previous.overallScore,
        newScore: analysis.overallScore,
        jobTitle: analysis.jobTitle,
      })
    );
  }
}

/** Comemora marcos de volume: a cada 10 análises acumuladas por um usuário. */
async function sendAnalysisCountMilestones(now: Date): Promise<void> {
  const windowStart = new Date(now.getTime() - 2 * DAY_MS);
  const from = windowStart > MILESTONE_START ? windowStart : MILESTONE_START;
  if (from > now) return;

  const analyses = await prisma.analysis.findMany({
    where: { createdAt: { gte: from, lte: now } },
    select: { createdAt: true, resume: { select: { userId: true } } },
    orderBy: { createdAt: "asc" },
  });

  const handled = new Set<string>();
  for (const analysis of analyses) {
    const userId = analysis.resume.userId;
    if (!userId || handled.has(userId)) continue;

    const totalCount = await prisma.analysis.count({
      where: { resume: { userId }, createdAt: { lte: analysis.createdAt } },
    });
    if (totalCount < 10 || totalCount % 10 !== 0) continue;
    handled.add(userId);

    const user = await prisma.user.findUnique({ where: { id: userId }, select: { email: true } });
    if (!user?.email) continue;

    await sendOnce("milestone_analysis_count", `${userId}:${totalCount}`, user.email, () =>
      sendAnalysisCountMilestoneEmail(user.email!, { count: totalCount })
    );
  }
}

/**
 * Nudge de empresa dormente: empresas cadastradas entre 3 e 6 dias atrás que
 * ainda não publicaram nenhuma vaga. Uma vez por empresa.
 */
async function sendCompanyDormantNudges(now: Date): Promise<void> {
  const from = new Date(now.getTime() - 6 * DAY_MS);
  const to = new Date(now.getTime() - 3 * DAY_MS);

  const companies = await prisma.company.findMany({
    where: { createdAt: { gte: from, lte: to } },
    select: { id: true, name: true, email: true },
  });

  for (const company of companies) {
    const vagaCount = await prisma.companyVaga.count({ where: { companyId: company.id } });
    if (vagaCount > 0) continue;

    await sendOnce("company_dormant_nudge", company.id, company.email, () =>
      sendCompanyDormantNudgeEmail(company.email, { companyName: company.name })
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
    const location = [alert.city, alert.state].filter(Boolean).join(", ");
    // Push e e-mail compartilham o mesmo sendOnce: a reserva no EmailLog garante
    // que ambos saiam no máximo uma vez por alerta por período.
    await sendOnce("job_alert", `${alert.id}:${period}`, alert.user.email, async () => {
      await sendJobAlertEmail(alert.user.email!, {
        query: alert.query,
        location,
        jobs: jobs.map((job) => ({ title: job.title, url: job.url, source: job.source.name })),
      });
      await sendPushToUser(alert.userId, {
        title: jobs.length === 1 ? "1 vaga nova para você" : `${jobs.length} vagas novas para você`,
        body: [alert.query || "Vagas", location].filter(Boolean).join(" • ") + `: ${jobs[0].title}`,
        url: "/vagas-publicas",
        tag: `job_alert_${alert.id}`,
      });
    });
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
    ["company_dormant_nudges", () => sendCompanyDormantNudges(now)],
    ["diagnostic_upgrades", () => sendDiagnosticUpgradeEmails(now)],
    ["convert_to_subscription", () => sendConvertToSubscriptionEmails(now)],
    ["convert_second_nudge", () => sendConvertSecondNudgeEmails(now)],
    ["urgency_coupon", () => sendUrgencyCouponEmails(now)],
    ["checkout_recovery", () => sendCheckoutRecoveryEmails(now)],
    ["job_alerts", () => sendJobAlerts(now)],
    ["milestone_first_analysis", () => sendFirstAnalysisMilestones(now)],
    ["milestone_score_improved", () => sendScoreImprovedMilestones(now)],
    ["milestone_analysis_count", () => sendAnalysisCountMilestones(now)],
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
