import { cache } from "react";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { requireAccountPage, requireAccountApi } from "@/lib/account-auth";

/** Triagens gratuitas antes de exigir upgrade. */
export const FREE_SCREENING_LIMIT = 3;

/**
 * Para páginas de empresa: exige sessão de empresa, senão redireciona ao login.
 * Envolvido em `cache` para deduplicar a query da empresa quando o layout do
 * painel e a página que ele renderiza chamam isto no mesmo request.
 */
export const requireCompanyPage = cache(async () => {
  const session = await auth();
  const { entity: company } = await requireAccountPage(
    session,
    "company",
    session?.user?.companyId,
    () => prisma.company.findUnique({ where: { id: session!.user.companyId! } }),
    "/empresa/login",
  );
  const memberId = session!.user.memberId ?? null;
  const role = session!.user.companyRole ?? "member";
  return { session: session!, company, memberId, role };
});

/** Para rotas de API de empresa: exige sessão de empresa, senão devolve 401/403. */
export async function requireCompanyApi() {
  const session = await auth();
  const { entity: company, response } = await requireAccountApi(
    session,
    "company",
    session?.user?.companyId,
    () => prisma.company.findUnique({ where: { id: session!.user.companyId! } }),
    {
      noSession: "Faça login como empresa.",
      wrongAccountType: "Acesso restrito a empresas.",
      expired: "Sua sessão expirou. Entre novamente.",
    },
  );
  if (!company) return { company: null, response };
  const memberId = session!.user.memberId ?? null;
  const role = (session!.user.companyRole ?? "member") as "owner" | "member";
  return { company, memberId, role, response: null };
}
