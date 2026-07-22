import { prisma } from "@/lib/prisma";
import {
  sendWhatsappOnce,
  sendConvertToSubscriptionWhatsapp,
  sendConvertSecondNudgeWhatsapp,
  sendUrgencyCouponWhatsapp,
} from "@/lib/evolution";
import { createUrgencyCoupon } from "@/lib/coupons";

// Mesmo padrão do email-scheduler.ts: roda algumas vezes ao dia, idempotência
// vem do WhatsappLog (sendWhatsappOnce).
const TICK_INTERVAL_MS = 6 * 60 * 60 * 1000; // 6h
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

export async function runWhatsappTick(): Promise<void> {
  const now = new Date();
  const steps: Array<[string, () => Promise<void>]> = [
    ["convert_to_subscription", () => sendConvertToSubscriptionWhatsapps(now)],
    ["convert_second_nudge", () => sendConvertSecondNudgeWhatsapps(now)],
    ["urgency_coupon", () => sendUrgencyCouponWhatsapps(now)],
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
