import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { isAdminEmail } from "@/lib/admin";

export async function GET(_request: Request, { params }: { params: Promise<{ id: string }> }) {
  const session = await auth();
  if (!session?.user?.id) return new NextResponse("Não autorizado", { status: 401 });

  const attachment = await prisma.supportAttachment.findUnique({
    where: { id: (await params).id },
    include: { message: { include: { ticket: { select: { userId: true } } } } },
  });
  if (!attachment) return new NextResponse("Arquivo não encontrado", { status: 404 });

  const canRead = attachment.message.ticket.userId === session.user.id || isAdminEmail(session.user.email);
  if (!canRead) return new NextResponse("Acesso negado", { status: 403 });

  const safeName = attachment.fileName.replace(/[\r\n"]/g, "_");
  return new NextResponse(new Uint8Array(attachment.data), {
    headers: {
      "Content-Type": attachment.mimeType,
      "Content-Length": String(attachment.size),
      "Content-Disposition": `attachment; filename="${safeName}"`,
      "Cache-Control": "private, no-store",
      "X-Content-Type-Options": "nosniff",
    },
  });
}
