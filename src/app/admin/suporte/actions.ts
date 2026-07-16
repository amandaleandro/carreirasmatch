"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { isAdminEmail } from "@/lib/admin";
import { MAX_SUPPORT_MESSAGE_LENGTH, normalizeSupportStatus } from "@/lib/support";

async function requireAdmin() {
  const session = await auth();
  if (!session?.user?.id) redirect("/login");
  if (!isAdminEmail(session.user.email)) redirect("/dashboard");
}

export async function adminReplySupportTicket(ticketId: string, formData: FormData) {
  await requireAdmin();

  const body = String(formData.get("body") ?? "").trim().slice(0, MAX_SUPPORT_MESSAGE_LENGTH);
  if (!body) return;

  const ticket = await prisma.supportTicket.findUnique({
    where: { id: ticketId },
    select: { id: true },
  });
  if (!ticket) return;

  await prisma.supportMessage.create({
    data: { ticketId, body, fromAdmin: true, readByAdmin: true },
  });

  // Responder devolve a bola ao usuário e tira o ticket da fila do admin.
  await prisma.supportTicket.update({
    where: { id: ticketId },
    data: { status: "pending" },
  });

  revalidatePath("/admin/suporte");
  revalidatePath(`/admin/suporte/${ticketId}`);
  revalidatePath(`/suporte/${ticketId}`);
  revalidatePath("/suporte");
}

export async function adminSetSupportStatus(ticketId: string, formData: FormData) {
  await requireAdmin();

  const status = normalizeSupportStatus(formData.get("status"));

  await prisma.supportTicket.update({
    where: { id: ticketId },
    data: { status },
  });

  revalidatePath("/admin/suporte");
  revalidatePath(`/admin/suporte/${ticketId}`);
  revalidatePath(`/suporte/${ticketId}`);
  revalidatePath("/suporte");
}
