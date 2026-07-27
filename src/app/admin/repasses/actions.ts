"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { isAdminEmail } from "@/lib/admin";

async function requireAdmin() {
  const session = await auth();
  if (!session?.user?.id) redirect("/login");
  if (!isAdminEmail(session.user.email)) redirect("/dashboard");
}

/** Confirma que o repasse Pix ao freelancer foi feito manualmente fora da plataforma. */
export async function markPayoutReleased(contractId: string) {
  await requireAdmin();

  const contract = await prisma.freelanceContract.findUnique({ where: { id: contractId } });
  if (!contract || contract.status !== "completed" || contract.payoutStatus !== "ready") return;

  await prisma.freelanceContract.update({
    where: { id: contractId },
    data: { payoutStatus: "released", payoutReleasedAt: new Date() },
  });

  revalidatePath("/admin/repasses");
}
