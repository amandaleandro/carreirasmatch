import { NextRequest, NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";

export async function POST(req: NextRequest) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Faça login para continuar." }, { status: 401 });
  }

  let body: { currentPassword?: string; newPassword?: string; confirmPassword?: string };
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Requisição inválida." }, { status: 400 });
  }

  const { currentPassword, newPassword, confirmPassword } = body;

  if (typeof newPassword !== "string" || newPassword.length < 6) {
    return NextResponse.json({ error: "A nova senha deve ter no mínimo 6 caracteres." }, { status: 400 });
  }

  if (newPassword !== confirmPassword) {
    return NextResponse.json({ error: "As senhas não coincidem." }, { status: 400 });
  }

  const user = await prisma.user.findUnique({
    where: { id: session.user.id },
    select: { passwordHash: true },
  });

  if (!user) {
    return NextResponse.json({ error: "Usuário não encontrado." }, { status: 404 });
  }

  // Se o usuário possui senha configurada, exige a verificação da senha atual
  if (user.passwordHash) {
    if (!currentPassword || typeof currentPassword !== "string") {
      return NextResponse.json({ error: "Informe a sua senha atual." }, { status: 400 });
    }
    const valid = await bcrypt.compare(currentPassword, user.passwordHash);
    if (!valid) {
      return NextResponse.json({ error: "Senha atual incorreta." }, { status: 400 });
    }
  }

  const newPasswordHash = await bcrypt.hash(newPassword, 10);
  await prisma.user.update({
    where: { id: session.user.id },
    data: { passwordHash: newPasswordHash },
  });

  return NextResponse.json({ ok: true, message: "Senha alterada com sucesso!" });
}
