import { NextRequest, NextResponse } from "next/server";
import { requireAuth } from "@/lib/require-auth";
import { prisma } from "@/lib/prisma";
import { sendOnce, sendCompanyContactAcceptedEmail } from "@/lib/resend";
import { sendCompanyContactAcceptedWhatsapp } from "@/lib/evolution";

// Candidato aceita ou recusa um pedido de contato de empresa.
export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { session, response } = await requireAuth();
  if (!session) return response;

  const { id } = await params;
  const body = await req.json();
  const action = body.action;
  if (action !== "accept" && action !== "decline") {
    return NextResponse.json({ error: "Ação inválida." }, { status: 400 });
  }

  // Só o dono do pedido pode responder, e só enquanto estiver pendente.
  const request = await prisma.talentContactRequest.findFirst({
    where: { id, userId: session.user.id, status: "pending" },
    select: { id: true, jobTitle: true, company: { select: { email: true, phone: true } }, user: { select: { name: true } } },
  });
  if (!request) {
    return NextResponse.json({ error: "Pedido não encontrado." }, { status: 404 });
  }

  const status = action === "accept" ? "accepted" : "declined";
  await prisma.talentContactRequest.update({ where: { id: request.id }, data: { status } });

  // Ao aceitar, avisa a empresa por e-mail (uma vez por pedido).
  if (status === "accepted" && request.company?.email) {
    const candidateName = request.user?.name?.trim() || "Um candidato";
    void sendOnce("talent_contact_accepted", request.id, request.company.email, () =>
      sendCompanyContactAcceptedEmail(request.company!.email, { candidateName, jobTitle: request.jobTitle })
    );
    if (request.company.phone) {
      void sendCompanyContactAcceptedWhatsapp(request.company.phone, { candidateName, jobTitle: request.jobTitle });
    }
  }

  return NextResponse.json({ status });
}
