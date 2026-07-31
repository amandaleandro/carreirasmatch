"use server";

import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";
import { getMoodDayKey, isMoodKey } from "@/lib/mood";

export async function updateEmploymentStatusAction(status: string) {
  const session = await auth();
  if (!session?.user?.id) {
    throw new Error("Não autorizado.");
  }

  await prisma.user.update({
    where: { id: session.user.id },
    data: { employmentStatus: status },
  });

  revalidatePath("/dashboard");
  revalidatePath("/settings");
  return { success: true };
}

export async function saveMoodAction(mood: string, dayKey?: string) {
  const session = await auth();
  if (!session?.user?.id) {
    throw new Error("Não autorizado.");
  }
  if (!isMoodKey(mood)) {
    throw new Error("Humor inválido.");
  }

  const key = dayKey || getMoodDayKey();

  await prisma.moodLog.upsert({
    where: { userId_dayKey: { userId: session.user.id, dayKey: key } },
    update: { mood },
    create: { userId: session.user.id, dayKey: key, mood },
  });

  revalidatePath("/dashboard");
  return { success: true };
}
