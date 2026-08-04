import { redirect } from "next/navigation";
import { auth } from "@/auth";
import { hasActiveSubscriptionAccess } from "@/lib/entitlements";
import type { Session } from "next-auth";

type AuthenticatedSession = Session & {
  user: NonNullable<Session["user"]> & { id: string };
};

/** For page components: requires login and an active subscription, else redirects to the upgrade prompt. */
export async function requireSubscriptionPage(): Promise<AuthenticatedSession> {
  const session = await auth();
  if (!session?.user?.id) redirect("/login");

  if (!(await hasActiveSubscriptionAccess(session.user.id))) {
    redirect("/settings?upgrade=1");
  }

  return session as AuthenticatedSession;
}
