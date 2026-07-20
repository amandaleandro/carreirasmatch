import { NextRequest, NextResponse } from "next/server";
import { requireCompanyApi } from "@/lib/company-auth";
import { prisma } from "@/lib/prisma";
import { sendOnce, sendTalentContactRequestEmail } from "@/lib/resend";

export async function POST(req: NextRequest) {
  const { company, response } = await requireCompanyApi();
  if (!company) return response;

  const body = await req.json();
  const userId = typeof body.userId === "string" ? body.userId : "";
  const jobTitle = typeof body.jobTitle === "string" ? body.jobTitle.trim().slice(0, 140) : "";
  const message = typeof body.message === "string" ? body.message.trim().slice(0, 1000) : "";

  if (!userId) {
    return NextResponse.json({ error: "Candidato não informado." }, { status: 400 });
  }

  // Só candidatos com opt-in ativo podem receber pedidos de contato.
  const candidate = await prisma.user.findFirst({
    where: { id: userId, discoverable: true },
    select: { id: true, email: true },
  });
  if (!candidate) {
    return NextResponse.json({ error: "Candidato indisponível." }, { status: 404 });
  }

  // Idempotente: um pedido por (empresa, candidato). Reenviar não duplica nem
  // reabre um pedido já respondido pelo candidato.
  const request = await prisma.talentContactRequest.upsert({
    where: { companyId_userId: { companyId: company.id, userId } },
    create: { companyId: company.id, userId, jobTitle, message, status: "pending" },
    update: {},
    select: { status: true },
  });

  // Avisa o candidato por e-mail (uma vez por par empresa-candidato).
  if (candidate.email) {
    void sendOnce("talent_contact_request", `${company.id}:${userId}`, candidate.email, () =>
      sendTalentContactRequestEmail(candidate.email!, { companyName: company.name, jobTitle })
    );
  }

  return NextResponse.json({ status: request.status });
}
