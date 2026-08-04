"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { getWeekStart, normalizeApplicationStatus, type ApplicationStatus } from "@/lib/applications";
import { hasActiveSubscriptionAccess } from "@/lib/entitlements";

async function requireUserId() {
  const session = await auth();
  if (!session?.user?.id) redirect("/login");
  if (!(await hasActiveSubscriptionAccess(session.user.id))) redirect("/settings?upgrade=1");
  return session.user.id;
}

export async function createApplication(formData: FormData) {
  const userId = await requireUserId();
  const jobTitle = String(formData.get("jobTitle") ?? "").trim();
  const company = String(formData.get("company") ?? "").trim();
  const jobUrl = String(formData.get("jobUrl") ?? "").trim();
  const notes = String(formData.get("notes") ?? "").trim();
  const status = normalizeApplicationStatus(formData.get("status"));
  const deadlineRaw = String(formData.get("deadline") ?? "").trim();
  const deadline = deadlineRaw ? new Date(deadlineRaw) : null;

  if (!jobTitle) return;

  await prisma.application.create({
    data: {
      userId,
      jobTitle,
      company,
      jobUrl,
      notes,
      status,
      deadline: deadline && !Number.isNaN(deadline.getTime()) ? deadline : null,
      appliedAt: status === "applied" ? new Date() : null,
    },
  });

  revalidatePath("/applications");
  revalidatePath("/dashboard");
}

export async function updateApplicationStatus(applicationId: string, formData: FormData) {
  const userId = await requireUserId();
  const status = normalizeApplicationStatus(formData.get("status"));

  const current = await prisma.application.findFirst({
    where: { id: applicationId, userId },
    select: { status: true },
  });
  if (!current) return;

  await prisma.application.updateMany({
    where: { id: applicationId, userId },
    data: {
      status,
      appliedAt: status === "applied" ? new Date() : undefined,
    },
  });

  if (current.status !== status) {
    await prisma.applicationActivity.create({
      data: { applicationId, fromStatus: current.status, toStatus: status },
    });
  }

  revalidatePath("/applications");
  revalidatePath("/dashboard");
}

export async function scheduleInterview(applicationId: string, formData: FormData) {
  const userId = await requireUserId();
  const interviewAtRaw = String(formData.get("interviewAt") ?? "").trim();
  const interviewAt = interviewAtRaw ? new Date(interviewAtRaw) : null;

  await prisma.application.updateMany({
    where: { id: applicationId, userId },
    data: {
      interviewAt: interviewAt && !Number.isNaN(interviewAt.getTime()) ? interviewAt : null,
    },
  });

  revalidatePath("/applications");
  revalidatePath("/dashboard");
}

export async function updateApplicationOutcome(applicationId: string, formData: FormData) {
  const userId = await requireUserId();
  const outcomeNote = String(formData.get("outcomeNote") ?? "").trim().slice(0, 4000);
  const rejectionReason = String(formData.get("rejectionReason") ?? "").trim().slice(0, 500);
  const responseAtRaw = String(formData.get("responseAt") ?? "").trim();
  const responseAt = responseAtRaw ? new Date(responseAtRaw) : null;

  await prisma.application.updateMany({
    where: { id: applicationId, userId },
    data: {
      outcomeNote,
      rejectionReason,
      responseAt: responseAt && !Number.isNaN(responseAt.getTime()) ? responseAt : null,
    },
  });

  revalidatePath(`/applications/${applicationId}`);
  revalidatePath("/applications");
  revalidatePath("/dashboard");
}

export async function linkAnalysisToApplication(applicationId: string, formData: FormData) {
  const userId = await requireUserId();
  const analysisId = String(formData.get("analysisId") ?? "").trim();
  if (!analysisId) return;

  const analysis = await prisma.analysis.findFirst({
    where: { id: analysisId, resume: { userId } },
    select: { id: true },
  });
  if (!analysis) return;

  await prisma.application.updateMany({
    where: { id: applicationId, userId },
    data: { analysisId: analysis.id },
  });

  revalidatePath("/applications");
  revalidatePath(`/interviews/${applicationId}`);
}

export async function updateWeeklyGoal(formData: FormData) {
  const userId = await requireUserId();
  const weekStart = getWeekStart();

  const targetApplications = Number(formData.get("targetApplications") ?? 8);
  const targetResumeTweaks = Number(formData.get("targetResumeTweaks") ?? 2);
  const targetInterviews = Number(formData.get("targetInterviews") ?? 3);

  await prisma.weeklyGoal.upsert({
    where: { userId_weekStart: { userId, weekStart } },
    create: {
      userId,
      weekStart,
      targetApplications: Math.max(1, targetApplications || 8),
      targetResumeTweaks: Math.max(0, targetResumeTweaks || 0),
      targetInterviews: Math.max(0, targetInterviews || 0),
    },
    update: {
      targetApplications: Math.max(1, targetApplications || 8),
      targetResumeTweaks: Math.max(0, targetResumeTweaks || 0),
      targetInterviews: Math.max(0, targetInterviews || 0),
    },
  });

  revalidatePath("/applications");
  revalidatePath("/dashboard");
}

export async function saveFeedMatchAsApplication(
  matchId: string,
  requestedStatus: ApplicationStatus | null = null
) {
  const userId = await requireUserId();
  const match = await prisma.jobMatch.findFirst({
    where: { id: matchId, resume: { userId } },
    include: { job: true },
  });

  if (!match) return;

  // Status explícito vindo dos botões rápidos do feed; senão decide pela aderência.
  const status = requestedStatus
    ? normalizeApplicationStatus(requestedStatus)
    : match.fitScore >= 75
      ? "saved"
      : "tailor_resume";

  const existing = await prisma.application.findFirst({
    where: { userId, jobUrl: match.job.url },
  });

  if (existing) {
    if (existing.status !== status) {
      await prisma.applicationActivity.create({
        data: { applicationId: existing.id, fromStatus: existing.status, toStatus: status },
      });
    }
    await prisma.application.update({
      where: { id: existing.id },
      data: {
        jobId: match.jobId,
        company: match.job.company,
        fitScore: match.fitScore,
        notes: match.reason,
        status,
        appliedAt: status === "applied" ? existing.appliedAt ?? new Date() : existing.appliedAt,
      },
    });
  } else {
    await prisma.application.create({
      data: {
        userId,
        jobId: match.jobId,
        jobTitle: match.job.jobTitle,
        company: match.job.company,
        jobUrl: match.job.url,
        fitScore: match.fitScore,
        status,
        appliedAt: status === "applied" ? new Date() : null,
        notes: match.reason,
      },
    });
  }

  revalidatePath("/feed");
  revalidatePath("/applications");
  revalidatePath("/dashboard");
}

export async function saveAnalysisAsApplication(analysisId: string) {
  const userId = await requireUserId();
  const analysis = await prisma.analysis.findFirst({
    where: { id: analysisId, resume: { userId } },
  });

  if (!analysis) return;

  const existing = await prisma.application.findFirst({
    where: { userId, analysisId: analysis.id },
    select: { id: true },
  });

  if (existing) {
    revalidatePath(`/report/${analysisId}`);
    revalidatePath("/applications");
    revalidatePath("/dashboard");
    return { id: existing.id, created: false };
  }

  const status = analysis.applicationStatus === "apply_now" ? "saved" : "tailor_resume";
  const jobUrl = analysis.jobText.match(/https?:\/\/[^\s]+/)?.[0]?.replace(/[),.;]+$/, "") ?? "";

  const application = await prisma.application.create({
    data: {
      userId,
      analysisId,
      jobTitle: analysis.jobTitle,
      jobUrl,
      fitScore: analysis.overallScore,
      status,
      notes: analysis.applicationStatusReason,
    },
  });

  revalidatePath(`/report/${analysisId}`);
  revalidatePath("/applications");
  revalidatePath("/dashboard");

  return { id: application.id, created: true };
}
