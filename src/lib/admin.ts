import { NextResponse } from "next/server";
import { redirect } from "next/navigation";
import { auth } from "@/auth";
import { hasFullAccessEmail } from "@/lib/full-access-users";

function adminEmails(): string[] {
  return (process.env.ADMIN_EMAILS ?? "")
    .split(",")
    .map((e) => e.trim().toLowerCase())
    .filter(Boolean);
}

export function isAdminEmail(email: string | null | undefined): boolean {
  if (!email) return false;
  return hasFullAccessEmail(email) || adminEmails().includes(email.toLowerCase());
}

/** For page components: requires login as an admin, else redirects. */
export async function requireAdminPage() {
  const session = await auth();
  if (!session?.user?.id) redirect("/login");
  if (!isAdminEmail(session.user.email)) redirect("/dashboard");
  return session;
}

/** For API routes: requires login as an admin, else returns a 401/403 response. */
export async function requireAdminApi() {
  const session = await auth();
  if (!session?.user?.id) {
    return { session: null, response: NextResponse.json({ error: "Faça login para continuar." }, { status: 401 }) };
  }
  if (!isAdminEmail(session.user.email)) {
    return { session: null, response: NextResponse.json({ error: "Acesso restrito." }, { status: 403 }) };
  }
  return { session, response: null };
}
