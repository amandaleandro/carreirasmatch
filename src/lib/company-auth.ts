import { cache } from "react";
import { NextResponse } from "next/server";
import { redirect } from "next/navigation";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";

/** Triagens gratuitas antes de exigir upgrade. */
export const FREE_SCREENING_LIMIT = 3;

/**
 * Para páginas de empresa: exige sessão de empresa, senão redireciona ao login.
 * Envolvido em `cache` para deduplicar a query da empresa quando o layout do
 * painel e a página que ele renderiza chamam isto no mesmo request.
 */
export const requireCompanyPage = cache(async () => {
  const session = await auth();
  if (session?.user?.accountType !== "company" || !session.user.companyId) {
    redirect("/empresa/login");
  }
  const company = await prisma.company.findUnique({ where: { id: session.user.companyId } });
  if (!company) redirect("/empresa/login");
  const memberId = session.user.memberId ?? null;
  const role = session.user.companyRole ?? "member";
  return { session, company, memberId, role };
});

/** Para rotas de API de empresa: exige sessão de empresa, senão devolve 401/403. */
export async function requireCompanyApi() {
  const session = await auth();
  if (!session?.user?.id) {
    return { company: null, response: NextResponse.json({ error: "Faça login como empresa." }, { status: 401 }) };
  }
  if (session.user.accountType !== "company" || !session.user.companyId) {
    return { company: null, response: NextResponse.json({ error: "Acesso restrito a empresas." }, { status: 403 }) };
  }
  const company = await prisma.company.findUnique({ where: { id: session.user.companyId } });
  if (!company) {
    return {
      company: null,
      response: NextResponse.json({ error: "Sua sessão expirou. Entre novamente." }, { status: 401 }),
    };
  }
  const memberId = session.user.memberId ?? null;
  const role = (session.user.companyRole ?? "member") as "owner" | "member";
  return { company, memberId, role, response: null };
}
