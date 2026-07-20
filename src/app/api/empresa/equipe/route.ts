import { NextResponse } from "next/server";
import { randomBytes } from "crypto";
import bcrypt from "bcryptjs";
import { requireCompanyApi } from "@/lib/company-auth";
import { prisma } from "@/lib/prisma";
import { normalizeEmail, isValidEmail } from "@/lib/email";
import { sendCompanyMemberInviteEmail } from "@/lib/resend";

function generateTempPassword(): string {
  // ~12 caracteres legíveis (base64url sem símbolos ambíguos).
  return randomBytes(9).toString("base64").replace(/[+/=]/g, "").slice(0, 12);
}

// Owner adiciona um membro à equipe da empresa.
export async function POST(req: Request) {
  const { company, role, response } = await requireCompanyApi();
  if (!company) return response;
  if (role !== "owner") {
    return NextResponse.json({ error: "Apenas o responsável pode gerenciar a equipe." }, { status: 403 });
  }

  let body: { name?: string; email?: string };
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Requisição inválida." }, { status: 400 });
  }

  const name = (body.name ?? "").trim();
  const email = normalizeEmail(body.email);
  if (!name || name.length < 2) {
    return NextResponse.json({ error: "Informe o nome do membro." }, { status: 400 });
  }
  if (!email || !isValidEmail(email)) {
    return NextResponse.json({ error: "E-mail inválido." }, { status: 400 });
  }

  const existing = await prisma.companyMember.findUnique({ where: { email }, select: { id: true } });
  if (existing) {
    return NextResponse.json({ error: "Já existe uma conta com esse e-mail." }, { status: 409 });
  }

  const tempPassword = generateTempPassword();
  const passwordHash = await bcrypt.hash(tempPassword, 10);
  await prisma.companyMember.create({
    data: { companyId: company.id, name, email, passwordHash, role: "member" },
  });

  // Envia a senha temporária por e-mail (além de devolvê-la uma vez ao owner).
  void sendCompanyMemberInviteEmail(email, { companyName: company.name, tempPassword });

  return NextResponse.json({ ok: true, tempPassword });
}
