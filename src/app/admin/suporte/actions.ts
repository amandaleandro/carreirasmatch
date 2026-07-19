"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { isAdminEmail } from "@/lib/admin";
import { MAX_SUPPORT_MESSAGE_LENGTH, type SupportActionState, normalizeSupportStatus } from "@/lib/support";
import { sendSupportReplyEmail } from "@/lib/resend";

async function requireAdmin() {
  const session = await auth();
  if (!session?.user?.id) redirect("/login");
  if (!isAdminEmail(session.user.email)) redirect("/dashboard");
}

export async function adminReplySupportTicket(
  ticketId: string,
  _previousState: SupportActionState,
  formData: FormData
): Promise<SupportActionState> {
  await requireAdmin();

  const body = String(formData.get("body") ?? "").trim().slice(0, MAX_SUPPORT_MESSAGE_LENGTH);
  if (!body) return { error: "Escreva uma resposta antes de enviar." };

  const ticket = await prisma.supportTicket.findUnique({
    where: { id: ticketId },
    include: { user: { select: { email: true } } },
  });
  if (!ticket) return { error: "Chamado não encontrado." };

  await prisma.supportMessage.create({
    data: { ticketId, body, fromAdmin: true, readByAdmin: true },
  });

  // Responder devolve a bola ao usuário e tira o ticket da fila do admin.
  await prisma.supportTicket.update({
    where: { id: ticketId },
    data: { status: "pending", firstResponseAt: ticket.firstResponseAt ?? new Date() },
  });
  if (ticket.user.email) {
    void sendSupportReplyEmail(ticket.user.email, { ticketId, subject: ticket.subject });
  }

  revalidatePath("/admin/suporte");
  revalidatePath(`/admin/suporte/${ticketId}`);
  revalidatePath(`/suporte/${ticketId}`);
  revalidatePath("/suporte");
  return { success: "Resposta enviada e usuário notificado." };
}

export async function adminSetSupportStatus(ticketId: string, formData: FormData) {
  await requireAdmin();

  const status = normalizeSupportStatus(formData.get("status"));

  await prisma.supportTicket.update({
    where: { id: ticketId },
    data: { status, resolvedAt: status === "resolved" ? new Date() : null },
  });

  revalidatePath("/admin/suporte");
  revalidatePath(`/admin/suporte/${ticketId}`);
  revalidatePath(`/suporte/${ticketId}`);
  revalidatePath("/suporte");
}
