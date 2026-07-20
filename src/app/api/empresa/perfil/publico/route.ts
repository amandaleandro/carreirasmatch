import { NextResponse } from "next/server";
import { requireCompanyApi } from "@/lib/company-auth";
import { prisma } from "@/lib/prisma";

function slugify(text: string): string {
  return text
    .normalize("NFD")
    .replace(/\p{Diacritic}/gu, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 60);
}

async function uniqueSlug(base: string, companyId: string): Promise<string> {
  const root = base || "empresa";
  for (let i = 0; i < 50; i++) {
    const candidate = i === 0 ? root : `${root}-${i + 1}`;
    const existing = await prisma.company.findUnique({ where: { slug: candidate }, select: { id: true } });
    if (!existing || existing.id === companyId) return candidate;
  }
  // Fallback improvável: sufixo com fragmento do id.
  return `${root}-${companyId.slice(0, 6)}`;
}

// Ativa/desativa a página pública da empresa e salva a descrição.
export async function PATCH(req: Request) {
  const { company, response } = await requireCompanyApi();
  if (!company) return response;

  let body: { publicProfile?: boolean; description?: string };
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Requisição inválida." }, { status: 400 });
  }

  const publicProfile = Boolean(body.publicProfile);
  const description = (body.description ?? "").slice(0, 2000);

  // Gera o slug na primeira ativação (se ainda não houver).
  let slug = company.slug ?? undefined;
  if (publicProfile && !slug) {
    slug = await uniqueSlug(slugify(company.name), company.id);
  }

  await prisma.company.update({
    where: { id: company.id },
    data: { publicProfile, description, ...(slug ? { slug } : {}) },
  });

  return NextResponse.json({ ok: true, slug: slug ?? null });
}
