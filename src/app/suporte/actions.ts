"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { checkRateLimit } from "@/lib/rate-limit";
import {
  MAX_SUPPORT_MESSAGE_LENGTH,
  MAX_SUPPORT_SUBJECT_LENGTH,
  normalizeSupportCategory,
} from "@/lib/support";

// Suporte é aberto a qualquer pessoa logada, inclusive quem não assina - quem
// tem problema de pagamento normalmente é exatamente quem ainda não conseguiu
// assinar. Por ser texto livre, tem limite próprio contra flood.
const TICKET_LIMIT = { limit: 5, windowMs: 10 * 60 * 1000 };
const MESSAGE_LIMIT = { limit: 20, windowMs: 10 * 60 * 1000 };

async function requireUserId() {
  const session = await auth();
  if (!session?.user?.id) redirect("/login");
  return session.user.id;
}

export async function createSupportTicket(formData: FormData) {
  const userId = await requireUserId();

  const subject = String(formData.get("subject") ?? "").trim().slice(0, MAX_SUPPORT_SUBJECT_LENGTH);
  const body = String(formData.get("body") ?? "").trim().slice(0, MAX_SUPPORT_MESSAGE_LENGTH);
  const category = normalizeSupportCategory(formData.get("category"));

  if (!subject || !body) return;

  if (!checkRateLimit(`support-ticket:${userId}`, TICKET_LIMIT).allowed) return;

  const ticket = await prisma.supportTicket.create({
    data: {
      userId,
      subject,
      category,
      status: "open",
      messages: { create: { body, fromAdmin: false, readByUser: true } },
    },
  });

  revalidatePath("/suporte");
  redirect(`/suporte/${ticket.id}`);
}

export async function replySupportTicket(ticketId: string, formData: FormData) {
  const userId = await requireUserId();
  const body = String(formData.get("body") ?? "").trim().slice(0, MAX_SUPPORT_MESSAGE_LENGTH);
  if (!body) return;

  if (!checkRateLimit(`support-message:${userId}`, MESSAGE_LIMIT).allowed) return;

  const ticket = await prisma.supportTicket.findFirst({
    where: { id: ticketId, userId },
    select: { id: true },
  });
  if (!ticket) return;

  await prisma.supportMessage.create({
    data: { ticketId, body, fromAdmin: false, readByUser: true },
  });

  // Responder reabre a fila do admin, mesmo num ticket já resolvido.
  await prisma.supportTicket.update({
    where: { id: ticketId },
    data: { status: "open" },
  });

  revalidatePath("/suporte");
  revalidatePath(`/suporte/${ticketId}`);
}

export async function closeSupportTicket(ticketId: string) {
  const userId = await requireUserId();

  await prisma.supportTicket.updateMany({
    where: { id: ticketId, userId },
    data: { status: "resolved" },
  });

  revalidatePath("/suporte");
  revalidatePath(`/suporte/${ticketId}`);
}
