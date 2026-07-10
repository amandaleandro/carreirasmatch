import { redirect } from "next/navigation";
import { auth } from "@/auth";
import { hasActiveSubscriptionAccess } from "@/lib/entitlements";

/** For page components: requires login and an active subscription, else redirects to the upgrade prompt. */
export async function requireSubscriptionPage() {
  const session = await auth();
  if (!session?.user?.id) redirect("/login");

  if (!(await hasActiveSubscriptionAccess(session.user.id))) {
    redirect("/settings?upgrade=1");
  }

  return session;
}
