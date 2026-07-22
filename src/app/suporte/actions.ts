"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { checkRateLimit } from "@/lib/rate-limit";
import {
  MAX_SUPPORT_MESSAGE_LENGTH,
  MAX_SUPPORT_SUBJECT_LENGTH,
  type SupportActionState,
  normalizeSupportCategory,
  validateSupportAttachment,
} from "@/lib/support";
import { notifyAdminSupportTicket } from "@/lib/resend";
import { notifyAdminSupportTicketWhatsapp } from "@/lib/evolution";

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

export async function createSupportTicket(
  _previousState: SupportActionState,
  formData: FormData
): Promise<SupportActionState> {
  const userId = await requireUserId();

  const subject = String(formData.get("subject") ?? "").trim().slice(0, MAX_SUPPORT_SUBJECT_LENGTH);
  const body = String(formData.get("body") ?? "").trim().slice(0, MAX_SUPPORT_MESSAGE_LENGTH);
  const category = normalizeSupportCategory(formData.get("category"));

  if (!subject || !body) return { error: "Preencha o assunto e descreva o que aconteceu." };
  const attachment = validateSupportAttachment(formData.get("attachment"));
  if (attachment.error) return { error: attachment.error };

  if (!checkRateLimit(`support-ticket:${userId}`, TICKET_LIMIT).allowed) {
    return { error: "Muitos chamados em pouco tempo. Aguarde alguns minutos e tente novamente." };
  }

  let ticket;
  try {
    ticket = await prisma.supportTicket.create({
      data: {
        userId,
        subject,
        category,
        status: "open",
        messages: {
          create: {
            body,
            fromAdmin: false,
            readByUser: true,
            attachments: attachment.file ? {
              create: {
                fileName: attachment.file.name.slice(0, 180),
                mimeType: attachment.file.type,
                size: attachment.file.size,
                data: Buffer.from(await attachment.file.arrayBuffer()),
              },
            } : undefined,
          },
        },
      },
      include: { user: { select: { email: true } } },
    });
  } catch (error) {
    console.error("Falha ao criar chamado de suporte:", error);
    return { error: "Não foi possível abrir o chamado agora. Tente novamente em instantes." };
  }

  if (ticket.user.email) {
    void notifyAdminSupportTicket({ ticketId: ticket.id, subject: ticket.subject, email: ticket.user.email });
    void notifyAdminSupportTicketWhatsapp({ ticketId: ticket.id, subject: ticket.subject, email: ticket.user.email });
  }
  revalidatePath("/suporte");
  redirect(`/suporte/${ticket.id}`);
}

export async function replySupportTicket(
  ticketId: string,
  _previousState: SupportActionState,
  formData: FormData
): Promise<SupportActionState> {
  const userId = await requireUserId();
  const body = String(formData.get("body") ?? "").trim().slice(0, MAX_SUPPORT_MESSAGE_LENGTH);
  const attachment = validateSupportAttachment(formData.get("attachment"));
  if (!body && !attachment.file) return { error: "Escreva uma mensagem ou adicione um anexo." };
  if (attachment.error) return { error: attachment.error };

  if (!checkRateLimit(`support-message:${userId}`, MESSAGE_LIMIT).allowed) {
    return { error: "Muitas mensagens em pouco tempo. Aguarde alguns minutos." };
  }

  const ticket = await prisma.supportTicket.findFirst({
    where: { id: ticketId, userId },
    select: { id: true, status: true },
  });
  if (!ticket) return { error: "Chamado não encontrado." };

  try {
    await prisma.$transaction([
      prisma.supportMessage.create({
        data: {
          ticketId,
          body: body || "Anexo enviado",
          fromAdmin: false,
          readByUser: true,
          attachments: attachment.file ? {
            create: {
              fileName: attachment.file.name.slice(0, 180),
              mimeType: attachment.file.type,
              size: attachment.file.size,
              data: Buffer.from(await attachment.file.arrayBuffer()),
            },
          } : undefined,
        },
      }),
      prisma.supportTicket.update({
        where: { id: ticketId },
        data: {
          status: "open",
          resolvedAt: null,
          reopenCount: ticket.status === "resolved" ? { increment: 1 } : undefined,
        },
      }),
    ]);
  } catch (error) {
    console.error("Falha ao responder chamado de suporte:", error);
    return { error: "Não foi possível enviar a mensagem. Tente novamente." };
  }

  revalidatePath("/suporte");
  revalidatePath(`/suporte/${ticketId}`);
  return { success: "Mensagem enviada." };
}

export async function closeSupportTicket(ticketId: string) {
  const userId = await requireUserId();

  await prisma.supportTicket.updateMany({
    where: { id: ticketId, userId },
    data: { status: "resolved", resolvedAt: new Date() },
  });

  revalidatePath("/suporte");
  revalidatePath(`/suporte/${ticketId}`);
}
