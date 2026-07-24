import { prisma } from "@/lib/prisma";
import { sendOnce, sendInterviewScheduledEmail } from "@/lib/resend";

export interface InterviewReminderResult {
  applicationId: string;
  userEmail: string;
  companyName: string;
  interviewAt: Date;
}

/**
 * Varre candidaturas com entrevistas marcadas nas próximas 24 horas e envia e-mails de lembrete.
 */
export async function processInterviewReminders(): Promise<InterviewReminderResult[]> {
  const now = new Date();
  const next24h = new Date(now.getTime() + 24 * 60 * 60 * 1000);

  const upcomingInterviews = await prisma.application.findMany({
    where: {
      interviewAt: {
        gte: now,
        lte: next24h,
      },
      user: {
        email: { not: null },
      },
    },
    include: {
      user: { select: { id: true, email: true, name: true } },
    },
  });

  const sentReminders: InterviewReminderResult[] = [];

  for (const app of upcomingInterviews) {
    if (!app.user?.email || !app.interviewAt) continue;

    const dedupeKey = `interview_reminder_${app.id}_${app.interviewAt.toISOString().slice(0, 10)}`;
    const userEmail = app.user.email;
    const companyName = app.company || "Empresa contratante";
    const whenText = app.interviewAt.toLocaleString("pt-BR", {
      dateStyle: "short",
      timeStyle: "short",
    });

    const interviewDate = app.interviewAt;

    await sendOnce("interview_reminder_24h", dedupeKey, userEmail, async () => {
      await sendInterviewScheduledEmail(userEmail, {
        companyName,
        whenText: `Amanhã, ${whenText}`,
        note: app.notes ? `Anotações da vaga: ${app.notes}` : undefined,
      });

      sentReminders.push({
        applicationId: app.id,
        userEmail,
        companyName,
        interviewAt: interviewDate,
      });
    });
  }

  return sentReminders;
}
