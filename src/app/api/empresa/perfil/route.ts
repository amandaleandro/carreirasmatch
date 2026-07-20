import { NextResponse } from "next/server";
import { requireCompanyApi } from "@/lib/company-auth";
import { prisma } from "@/lib/prisma";
import { normalizeEmail, isValidEmail } from "@/lib/email";

// Atualiza os dados cadastrais da empresa (inclui e-mail de login).
export async function PATCH(req: Request) {
  const { company, response } = await requireCompanyApi();
  if (!company) return response;

  let body: { name?: string; cnpj?: string; city?: string; state?: string; logoUrl?: string; email?: string };
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Requisição inválida." }, { status: 400 });
  }

  const name = (body.name ?? "").trim();
  if (name.length < 2) {
    return NextResponse.json({ error: "Informe o nome da empresa." }, { status: 400 });
  }

  const email = normalizeEmail(body.email);
  if (!email || !isValidEmail(email)) {
    return NextResponse.json({ error: "E-mail inválido." }, { status: 400 });
  }
  // E-mail é a chave de login: não pode colidir com outra empresa.
  if (email !== company.email) {
    const existing = await prisma.company.findUnique({ where: { email }, select: { id: true } });
    if (existing && existing.id !== company.id) {
      return NextResponse.json({ error: "Já existe uma empresa com esse e-mail." }, { status: 409 });
    }
  }

  const logoUrl = (body.logoUrl ?? "").trim();
  if (logoUrl && !/^https?:\/\//i.test(logoUrl)) {
    return NextResponse.json({ error: "A URL do logo deve começar com http(s)://." }, { status: 400 });
  }

  await prisma.company.update({
    where: { id: company.id },
    data: {
      name,
      cnpj: (body.cnpj ?? "").trim(),
      city: (body.city ?? "").trim(),
      state: (body.state ?? "").trim().toUpperCase().slice(0, 2),
      logoUrl,
      email,
    },
  });

  return NextResponse.json({ ok: true });
}
