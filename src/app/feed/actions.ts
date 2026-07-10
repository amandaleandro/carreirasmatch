"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";

export async function discardFeedMatch(matchId: string) {
  const session = await auth();
  if (!session?.user?.id) redirect("/login");

  await prisma.jobMatch.updateMany({
    where: { id: matchId, resume: { userId: session.user.id } },
    data: { status: "discarded" },
  });

  revalidatePath("/feed");
}
