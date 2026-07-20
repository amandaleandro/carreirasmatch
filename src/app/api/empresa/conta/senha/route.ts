import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { requireCompanyApi } from "@/lib/company-auth";
import { prisma } from "@/lib/prisma";

// Troca a senha da conta do membro logado: exige a senha atual.
export async function POST(req: Request) {
  const { company, memberId, response } = await requireCompanyApi();
  if (!company) return response;
  if (!memberId) {
    return NextResponse.json({ error: "Sessão inválida. Entre novamente." }, { status: 401 });
  }

  let body: { currentPassword?: string; newPassword?: string };
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Requisição inválida." }, { status: 400 });
  }

  const currentPassword = body.currentPassword ?? "";
  const newPassword = body.newPassword ?? "";
  if (newPassword.length < 8) {
    return NextResponse.json({ error: "A nova senha precisa ter ao menos 8 caracteres." }, { status: 400 });
  }

  const member = await prisma.companyMember.findUnique({
    where: { id: memberId },
    select: { passwordHash: true },
  });
  if (!member?.passwordHash) {
    return NextResponse.json({ error: "Conta sem senha definida." }, { status: 400 });
  }

  const valid = await bcrypt.compare(currentPassword, member.passwordHash);
  if (!valid) {
    return NextResponse.json({ error: "Senha atual incorreta." }, { status: 403 });
  }

  const passwordHash = await bcrypt.hash(newPassword, 10);
  await prisma.companyMember.update({ where: { id: memberId }, data: { passwordHash } });

  return NextResponse.json({ ok: true });
}
