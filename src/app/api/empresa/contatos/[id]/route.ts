import { NextResponse } from "next/server";
import { requireCompanyApi } from "@/lib/company-auth";
import { prisma } from "@/lib/prisma";
import { sendInterviewScheduledEmail } from "@/lib/resend";

const MAX_NOTE = 2000;

function formatWhen(date: Date): string {
  return new Intl.DateTimeFormat("pt-BR", {
    dateStyle: "full",
    timeStyle: "short",
    timeZone: "America/Sao_Paulo",
  }).format(date);
}

// Empresa gerencia um contato liberado: anotação e/ou agendamento de entrevista.
export async function PATCH(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const { company, response } = await requireCompanyApi();
  if (!company) return response;

  const { id } = await params;
  const contact = await prisma.talentContactRequest.findFirst({
    where: { id, companyId: company.id },
    select: { id: true, status: true, interviewAt: true, user: { select: { email: true } } },
  });
  if (!contact) return NextResponse.json({ error: "Contato não encontrado." }, { status: 404 });

  let body: { note?: string; interviewAt?: string | null };
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Requisição inválida." }, { status: 400 });
  }

  const data: { note?: string; interviewAt?: Date | null } = {};

  if (body.note !== undefined) {
    data.note = String(body.note).slice(0, MAX_NOTE);
  }

  let scheduledDate: Date | null = null;
  if (body.interviewAt !== undefined) {
    if (body.interviewAt === null || body.interviewAt === "") {
      data.interviewAt = null;
    } else {
      const parsed = new Date(body.interviewAt);
      if (Number.isNaN(parsed.getTime())) {
        return NextResponse.json({ error: "Data da entrevista inválida." }, { status: 400 });
      }
      data.interviewAt = parsed;
      scheduledDate = parsed;
    }
  }

  if (Object.keys(data).length === 0) {
    return NextResponse.json({ error: "Nada para atualizar." }, { status: 400 });
  }

  await prisma.talentContactRequest.update({ where: { id: contact.id }, data });

  // Agendou (ou remarcou) uma entrevista num contato liberado: avisa o candidato.
  const changed = scheduledDate && contact.interviewAt?.getTime() !== scheduledDate.getTime();
  if (contact.status === "accepted" && scheduledDate && changed && contact.user?.email) {
    void sendInterviewScheduledEmail(contact.user.email, {
      companyName: company.name,
      whenText: formatWhen(scheduledDate),
      note: typeof body.note === "string" ? body.note : undefined,
    });
  }

  return NextResponse.json({ ok: true });
}
