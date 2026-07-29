import { NextRequest, NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";

export async function POST(req: NextRequest) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Faça login para continuar." }, { status: 401 });
  }

  let body: { password?: string; confirmation?: string };
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Requisição inválida." }, { status: 400 });
  }

  if (body.confirmation !== "EXCLUIR") {
    return NextResponse.json(
      { error: 'Digite "EXCLUIR" para confirmar a exclusão da conta.' },
      { status: 400 }
    );
  }

  const user = await prisma.user.findUnique({
    where: { id: session.user.id },
    select: { passwordHash: true },
  });

  if (!user) {
    return NextResponse.json({ error: "Usuário não encontrado." }, { status: 404 });
  }

  if (user.passwordHash) {
    if (!body.password || typeof body.password !== "string") {
      return NextResponse.json({ error: "Informe sua senha para confirmar." }, { status: 400 });
    }
    const valid = await bcrypt.compare(body.password, user.passwordHash);
    if (!valid) {
      return NextResponse.json({ error: "Senha incorreta." }, { status: 400 });
    }
  }

  await prisma.user.delete({ where: { id: session.user.id } });

  return NextResponse.json({ ok: true });
}
