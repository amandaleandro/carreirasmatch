import { prisma } from "@/lib/prisma";
import { InternshipChecklistView } from "./InternshipChecklistView";
import { requireAuthPage } from "@/lib/require-auth-page";

export default async function InternshipChecklistPage() {
  const session = await requireAuthPage();

  const user = await prisma.user.findUnique({
    where: { id: session.user.id },
    select: { internshipChecklistProgress: true },
  });

  let initialChecked: string[] = [];
  try {
    initialChecked = JSON.parse(user?.internshipChecklistProgress ?? "[]");
  } catch {
    initialChecked = [];
  }

  return <InternshipChecklistView initialChecked={initialChecked} />;
}
