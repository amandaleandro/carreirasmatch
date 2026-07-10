import { prisma } from "@/lib/prisma";

const FULL_ACCESS_EMAILS = new Set(["amandaleandrosoares@gmail.com"]);

export function hasFullAccessEmail(email: string | null | undefined): boolean {
  return FULL_ACCESS_EMAILS.has(email?.trim().toLowerCase() ?? "");
}

export async function hasFullAccessUserId(userId: string | null | undefined): Promise<boolean> {
  if (!userId) return false;

  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: { email: true },
  });

  return hasFullAccessEmail(user?.email);
}
