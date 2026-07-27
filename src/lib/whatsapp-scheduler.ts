import { prisma } from "@/lib/prisma";
import {
  sendWhatsappOnce,
  sendConvertToSubscriptionWhatsapp,
  sendConvertSecondNudgeWhatsapp,
  sendUrgencyCouponWhatsapp,
  sendComeBackWhatsapp,
  sendJobAlertWhatsapp,
  sendNextMarketingInviteWhatsapp,
  resetWhatsappMarketingBudget,
  isWithinWhatsappMarketingHours,
} from "@/lib/evolution";
import { createUrgencyCoupon } from "@/lib/coupons";

// Mesmo padrão do email-scheduler.ts: roda algumas vezes ao dia, idempotência
// vem do WhatsappLog (sendWhatsappOnce). Intervalo mais curto que o de e-mail
// (6h) porque o tick inteiro é pulado fora do horário humano (ver
// isWithinWhatsappMarketingHours) — precisa de mais chances por dia pra cair
// dentro da janela 08h-20h.
const TICK_INTERVAL_MS = 2 * 60 * 60 * 1000; // 2h
const INITIAL_DELAY_MS = 90 * 1000; // depois do email-scheduler, pra não competir no boot
const DAY_MS = 24 * 60 * 60 * 1000;

/**
 * Piso de data: só considera quem entrou no estado (analisou, não assinou) a
 * partir daqui, pra não disparar de uma vez pra toda a base histórica assim
 * que a feature for ligada. Mesmo motivo do CONVERT_EMAIL_START em
 * email-scheduler.ts.
 */
const WHATSAPP_START = new Date("2026-07-22T12:00:00Z");

type Candidate = { userId: string; overallScore: number | null };

/**
 * Usuários com opt-in de WhatsApp, telefone válido, que analisaram o
 * currículo na janela [from, to] e ainda não converteram (sem assinatura
 * ativa, sem pagamento pago). Mesma régua de segmentação do e-mail
 * (convert_to_subscription/second_nudge/urgency_coupon), canal diferente.
 */
async function findCandidates(from: Date, to: Date): Promise<Candidate[]> {
  const analyses = await prisma.analysis.findMany({
    where: {
      createdAt: { gte: from, lte: to },
      resume: {
        user: {
          whatsappMarketingOptIn: true,
          phone: { not: null },
        },
      },
    },
    select: { overallScore: true, resume: { select: { userId: true } } },
    orderBy: { createdAt: "desc" },
    distinct: ["resumeId"],
  });

  const seen = new Set<string>();
  const candidates: Candidate[] = [];
  for (const analysis of analyses) {
    const userId = analysis.resume.userId;
    if (!userId || seen.has(userId)) continue;
    seen.add(userId);
    candidates.push({ userId, overallScore: analysis.overallScore });
  }
  return candidates;
}

/**
 * Convite de marketing pra quem cadastrou e tem opt-in de WhatsApp mas ainda
 * não fez nenhuma análise, entre 2 e 4 dias atrás. Espelha o
 * `sendOnboardingNudges` de email-scheduler.ts, mas manda o próximo dos
 * MARKETING_INVITE_MESSAGES (rotaciona a cada execução até esgotar).
 */
async function sendOnboardingNudgeWhatsapps(now: Date): Promise<void> {
  const from = new Date(now.getTime() - 4 * DAY_MS);
  const to = new Date(now.getTime() - 2 * DAY_MS);

  const users = await prisma.user.findMany({
    where: {
      createdAt: { gte: from, lte: to },
      whatsappMarketingOptIn: true,
      phone: { not: null },
    },
    select: { id: true, name: true, phone: true },
  });

  for (const user of users) {
    if (!user.phone) continue;
    const analyses = await prisma.analysis.count({ where: { resume: { userId: user.id } } });
    if (analyses > 0) continue;

    await sendNextMarketingInviteWhatsapp(user.phone, user.name);
  }
}

async function sendConvertToSubscriptionWhatsapps(now: Date): Promise<void> {
  const windowStart = new Date(now.getTime() - 7 * DAY_MS);
  const from = windowStart > WHATSAPP_START ? windowStart : WHATSAPP_START;
  const to = new Date(now.getTime() - 4 * DAY_MS);
  if (from > to) return;

  for (const { userId, overallScore } of await findCandidates(from, to)) {
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: {
        phone: true,
        name: true,
        careerSegment: true,
        subscription: { select: { status: true } },
        _count: { select: { payments: { where: { status: "paid" } } } },
      },
    });
    if (!user?.phone || user.subscription?.status === "active" || user._count.payments > 0) continue;

    await sendWhatsappOnce("convert_to_subscription", userId, user.phone, () =>
      sendConvertToSubscriptionWhatsapp(user.phone!, {
        name: user.name,
        segment: user.careerSegment,
        score: overallScore,
      })
    );
  }
}

async function sendConvertSecondNudgeWhatsapps(now: Date): Promise<void> {
  const windowStart = new Date(now.getTime() - 13 * DAY_MS);
  const from = windowStart > WHATSAPP_START ? windowStart : WHATSAPP_START;
  const to = new Date(now.getTime() - 10 * DAY_MS);
  if (from > to) return;

  for (const { userId } of await findCandidates(from, to)) {
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: {
        phone: true,
        careerSegment: true,
        subscription: { select: { status: true } },
        _count: { select: { payments: { where: { status: "paid" } } } },
      },
    });
    if (!user?.phone || user.subscription?.status === "active" || user._count.payments > 0) continue;

    await sendWhatsappOnce("convert_second_nudge", userId, user.phone, () =>
      sendConvertSecondNudgeWhatsapp(user.phone!, { segment: user.careerSegment })
    );
  }
}

async function sendUrgencyCouponWhatsapps(now: Date): Promise<void> {
  const windowStart = new Date(now.getTime() - 18 * DAY_MS);
  const from = windowStart > WHATSAPP_START ? windowStart : WHATSAPP_START;
  const to = new Date(now.getTime() - 16 * DAY_MS);
  if (from > to) return;

  for (const { userId } of await findCandidates(from, to)) {
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: {
        phone: true,
        careerSegment: true,
        subscription: { select: { status: true } },
        _count: { select: { payments: { where: { status: "paid" } } } },
      },
    });
    if (!user?.phone || user.subscription?.status === "active" || user._count.payments > 0) continue;

    await sendWhatsappOnce("urgency_coupon", userId, user.phone, async () => {
      const { code, expiresAt } = await createUrgencyCoupon({ percent: 20, hours: 48 });
      await sendUrgencyCouponWhatsapp(user.phone!, { code, expiresAt, segment: user.careerSegment });
    });
  }
}

/**
 * Quarto toque, depois que a régua de conversão (que empurra pra /assinar)
 * já terminou: pura volta ao produto, sem falar em preço. Mira quem analisou
 * há 25-30 dias e não voltou desde então. Só exclui assinante ativo (quem já
 * usa o produto não precisa desse empurrão); ex-pagante que não renovou
 * continua elegível, é exatamente quem a gente quer trazer de volta.
 */
async function sendComeBackWhatsapps(now: Date): Promise<void> {
  const windowStart = new Date(now.getTime() - 30 * DAY_MS);
  const from = windowStart > WHATSAPP_START ? windowStart : WHATSAPP_START;
  const to = new Date(now.getTime() - 25 * DAY_MS);
  if (from > to) return;

  for (const { userId } of await findCandidates(from, to)) {
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: { phone: true, name: true, subscription: { select: { status: true } } },
    });
    if (!user?.phone || user.subscription?.status === "active") continue;

    await sendWhatsappOnce("come_back", userId, user.phone, () =>
      sendComeBackWhatsapp(user.phone!, { name: user.name })
    );
  }
}

/**
 * Alerta de vagas por WhatsApp, espelhando `sendJobAlerts` de
 * email-scheduler.ts (mesma janela de vagas por JobAlert), mas só pra quem
 * tem opt-in de WhatsApp. Dedupe próprio (`job_alert`) pra não competir com o
 * `sendOnce` do e-mail, que usa EmailLog — os dois podem sair pro mesmo
 * usuário, canais diferentes.
 */
async function sendJobAlertWhatsapps(now: Date): Promise<void> {
  const alerts = await prisma.jobAlert.findMany({
    where: { active: true, user: { whatsappMarketingOptIn: true, phone: { not: null } } },
    include: { user: { select: { phone: true } } },
  });
  for (const alert of alerts) {
    if (!alert.user.phone) continue;
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
      take: 5,
    });
    if (jobs.length === 0) continue;
    const period = alert.frequency === "weekly"
      ? `${now.getUTCFullYear()}-W${Math.ceil(now.getUTCDate() / 7)}-${now.getUTCMonth()}`
      : now.toISOString().slice(0, 10);
    const location = [alert.city, alert.state].filter(Boolean).join(", ");

    await sendWhatsappOnce("job_alert", `${alert.id}:${period}`, alert.user.phone, () =>
      sendJobAlertWhatsapp(alert.user.phone!, {
        query: alert.query,
        location,
        jobs: jobs.map((job) => ({ title: job.title, url: job.url, source: job.source.name })),
      })
    );
  }
}

export async function runWhatsappTick(): Promise<void> {
  const now = new Date();

  // Fora do horário humano (08h-20h em SP), pula a execução inteira: mandar
  // mensagem de marketing de madrugada é um dos sinais mais fortes de
  // automação pro WhatsApp e aumenta risco de restrição do número.
  if (!isWithinWhatsappMarketingHours(now)) return;

  resetWhatsappMarketingBudget();

  const steps: Array<[string, () => Promise<void>]> = [
    ["onboarding_nudge", () => sendOnboardingNudgeWhatsapps(now)],
    ["convert_to_subscription", () => sendConvertToSubscriptionWhatsapps(now)],
    ["convert_second_nudge", () => sendConvertSecondNudgeWhatsapps(now)],
    ["urgency_coupon", () => sendUrgencyCouponWhatsapps(now)],
    ["come_back", () => sendComeBackWhatsapps(now)],
    ["job_alert", () => sendJobAlertWhatsapps(now)],
  ];
  for (const [name, step] of steps) {
    try {
      await step();
    } catch (error) {
      console.error(`whatsapp-scheduler: step "${name}" failed`, error);
    }
  }
}

let started = false;

export function startWhatsappScheduler(): void {
  if (started) return;
  started = true;

  setTimeout(() => {
    void runWhatsappTick();
    setInterval(() => void runWhatsappTick(), TICK_INTERVAL_MS);
  }, INITIAL_DELAY_MS);
}
