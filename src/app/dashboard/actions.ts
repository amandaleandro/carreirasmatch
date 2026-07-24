"use server";

import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";

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
