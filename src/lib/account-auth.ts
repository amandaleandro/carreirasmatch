import { NextResponse } from "next/server";
import { redirect } from "next/navigation";
import type { Session } from "next-auth";

/**
 * Núcleo compartilhado por requireCompanyPage/requirePartnerPage e
 * requireCompanyApi/requirePartnerApi — os dois domínios (empresa, parceiro)
 * seguem exatamente o mesmo formato: checar accountType da sessão, checar o
 * id do dono do recurso, carregar a entidade e tratar sessão órfã. Recebe a
 * sessão já resolvida pelo chamador para evitar uma segunda chamada a auth().
 */
export async function requireAccountPage<T>(
  session: Session | null,
  accountType: string,
  ownerId: string | null | undefined,
  loadEntity: () => Promise<T | null>,
  loginPath: string,
): Promise<{ session: Session; entity: T }> {
  if (session?.user?.accountType !== accountType || !ownerId) {
    redirect(loginPath);
  }
  const entity = await loadEntity();
  if (!entity) redirect(loginPath);
  return { session, entity };
}

export async function requireAccountApi<T>(
  session: Session | null,
  accountType: string,
  ownerId: string | null | undefined,
  loadEntity: () => Promise<T | null>,
  messages: { noSession: string; wrongAccountType: string; expired: string },
): Promise<{ entity: T | null; response: NextResponse | null }> {
  if (!session?.user?.id) {
    return { entity: null, response: NextResponse.json({ error: messages.noSession }, { status: 401 }) };
  }
  if (session.user.accountType !== accountType || !ownerId) {
    return { entity: null, response: NextResponse.json({ error: messages.wrongAccountType }, { status: 403 }) };
  }
  const entity = await loadEntity();
  if (!entity) {
    return { entity: null, response: NextResponse.json({ error: messages.expired }, { status: 401 }) };
  }
  return { entity, response: null };
}
