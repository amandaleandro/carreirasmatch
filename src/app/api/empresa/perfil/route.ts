import { NextResponse } from "next/server";
import { requireCompanyApi } from "@/lib/company-auth";
import { prisma } from "@/lib/prisma";

// Atualiza os dados cadastrais da empresa (organização). O e-mail/senha de acesso
// são da conta do membro (ver /api/empresa/conta), não da empresa.
export async function PATCH(req: Request) {
  const { company, response } = await requireCompanyApi();
  if (!company) return response;

  let body: { name?: string; cnpj?: string; city?: string; state?: string; logoUrl?: string; phone?: string };
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Requisição inválida." }, { status: 400 });
  }

  const name = (body.name ?? "").trim();
  if (name.length < 2) {
    return NextResponse.json({ error: "Informe o nome da empresa." }, { status: 400 });
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
      phone: (body.phone ?? "").trim(),
    },
  });

  return NextResponse.json({ ok: true });
}
