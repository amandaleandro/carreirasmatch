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

  revalidatePath("/settings");
}

export async function deleteUserCourse(courseId: string) {
  const userId = await requireUserId();

  await prisma.userCourse.deleteMany({
    where: { id: courseId, userId },
  });

  revalidatePath("/settings");
}
