"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";

async function requireUserId() {
  const session = await auth();
  if (!session?.user?.id) redirect("/login");
  return session.user.id;
}

export async function addUserCourse(formData: FormData) {
  const userId = await requireUserId();
  const title = String(formData.get("title") ?? "").trim();
  const provider = String(formData.get("provider") ?? "").trim();
  const url = String(formData.get("url") ?? "").trim();
  const status = formData.get("status") === "in_progress" ? "in_progress" : "completed";

  if (!title) return;

  await prisma.userCourse.create({
    data: {
      userId,
      title,
      provider,
      url,
      status,
      completedAt: status === "completed" ? new Date() : null,
    },
  });

  // Se o curso foi concluído, cruza com as lacunas do Plano de Ação para marcar automaticamente
  if (status === "completed") {
    const latestAnalysis = await prisma.analysis.findFirst({
      where: { resume: { userId } },
      orderBy: { createdAt: "desc" },
    });

    if (latestAnalysis) {
      try {
        const studyPlan = JSON.parse(latestAnalysis.studyPlan || '{"essential":[],"niceToHave":[],"later":[]}');
        const essential: string[] = studyPlan.essential || [];
        const niceToHave: string[] = studyPlan.niceToHave || [];
        
        const progress: string[] = JSON.parse(latestAnalysis.actionPlanProgress || "[]");
        const newProgress = [...progress];
        
        const courseTitleLower = title.toLowerCase();
        
        essential.slice(0, 2).forEach((skill, index) => {
          const skillLower = skill.toLowerCase();
          if (courseTitleLower.includes(skillLower) || skillLower.includes(courseTitleLower)) {
            newProgress.push(`week-study-${index}`);
          }
        });
        
        niceToHave.slice(0, 1).forEach((skill, index) => {
          const skillLower = skill.toLowerCase();
          if (courseTitleLower.includes(skillLower) || skillLower.includes(courseTitleLower)) {
            newProgress.push(`next-study-${index}`);
          }
        });
        
        const uniqueProgress = Array.from(new Set(newProgress));
        if (uniqueProgress.length !== progress.length) {
          await prisma.analysis.update({
            where: { id: latestAnalysis.id },
            data: { actionPlanProgress: JSON.stringify(uniqueProgress) },
          });
        }
      } catch (e) {
        // Ignora erros de parse silenciosamente
      }
    }
  }

  revalidatePath("/settings");
}

export async function deleteUserCourse(courseId: string) {
  const userId = await requireUserId();

  await prisma.userCourse.deleteMany({
    where: { id: courseId, userId },
  });

  revalidatePath("/settings");
}
