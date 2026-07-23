import { NextResponse } from "next/server";
import { requireAuth } from "@/lib/require-auth";
import { prisma } from "@/lib/prisma";
import { sendCompanyNewApplicationEmail } from "@/lib/resend";
import { sendCompanyNewApplicationWhatsapp } from "@/lib/evolution";

// Candidato se candidata a uma vaga de empresa publicada no feed.
export async function POST(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const { session, response } = await requireAuth();
  if (!session) return response;

  // Sessão de empresa não se candidata a vagas.
  if (session.user.accountType === "company") {
    return NextResponse.json({ error: "Contas de empresa não podem se candidatar." }, { status: 403 });
  }

  const { id } = await params;
  const vaga = await prisma.companyVaga.findFirst({
    where: { id, publishedToFeed: true, status: "open" },
    select: { id: true, title: true, companyId: true },
  });
  if (!vaga) {
    return NextResponse.json({ error: "Vaga indisponível." }, { status: 404 });
  }

  let message = "";
  try {
    const body = await req.json();
    message = typeof body.message === "string" ? body.message.trim().slice(0, 2000) : "";
  } catch {
    // corpo opcional
  }

  // Só avisa a empresa se for uma candidatura nova (não em reenvios/edições).
  const already = await prisma.companyJobApplication.findUnique({
    where: { vagaId_userId: { vagaId: vaga.id, userId: session.user.id } },
    select: { id: true },
  });

  await prisma.companyJobApplication.upsert({
    where: { vagaId_userId: { vagaId: vaga.id, userId: session.user.id } },
    create: { vagaId: vaga.id, userId: session.user.id, message },
    update: message ? { message } : {},
  });

  if (!already) {
    const owners = await prisma.companyMember.findMany({
      where: { companyId: vaga.companyId, role: "owner" },
      select: { email: true },
    });
    const emails = owners.map((o) => o.email).filter(Boolean);
    const candidateName = session.user.name?.trim() || "Um candidato";
    void sendCompanyNewApplicationEmail(emails, { candidateName, vagaTitle: vaga.title, vagaId: vaga.id });

    const companyContact = await prisma.company.findUnique({ where: { id: vaga.companyId }, select: { phone: true } });
    if (companyContact?.phone) {
      void sendCompanyNewApplicationWhatsapp(companyContact.phone, { candidateName, vagaTitle: vaga.title, vagaId: vaga.id });
    }
  }

  return NextResponse.json({ ok: true });
}
