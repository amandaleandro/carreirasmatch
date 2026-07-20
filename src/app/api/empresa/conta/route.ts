import { NextResponse } from "next/server";
import { requireCompanyApi } from "@/lib/company-auth";
import { prisma } from "@/lib/prisma";
import { normalizeEmail, isValidEmail } from "@/lib/email";

// Atualiza a conta do membro logado (nome e e-mail de acesso).
export async function PATCH(req: Request) {
  const { company, memberId, response } = await requireCompanyApi();
  if (!company) return response;
  if (!memberId) {
    return NextResponse.json({ error: "Sessão inválida. Entre novamente." }, { status: 401 });
  }

  let body: { name?: string; email?: string };
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Requisição inválida." }, { status: 400 });
  }

  const name = (body.name ?? "").trim();
  const email = normalizeEmail(body.email);
  if (!email || !isValidEmail(email)) {
    return NextResponse.json({ error: "E-mail inválido." }, { status: 400 });
  }

  // E-mail é a chave de login: não pode colidir com outro membro.
  const existing = await prisma.companyMember.findUnique({ where: { email }, select: { id: true } });
  if (existing && existing.id !== memberId) {
    return NextResponse.json({ error: "Já existe uma conta com esse e-mail." }, { status: 409 });
  }

  await prisma.companyMember.update({ where: { id: memberId }, data: { name, email } });
  return NextResponse.json({ ok: true });
}
