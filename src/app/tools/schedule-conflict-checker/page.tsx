import { prisma } from "@/lib/prisma";
import { ScheduleConflictForm } from "./ScheduleConflictForm";
import { requireAuthPage } from "@/lib/require-auth-page";

export default async function ScheduleConflictCheckerPage() {
  const session = await requireAuthPage();

  const classItems = await prisma.classScheduleItem.findMany({
    where: { userId: session.user.id },
    orderBy: [{ dayOfWeek: "asc" }, { startTime: "asc" }],
  });

  return <ScheduleConflictForm initialClassItems={classItems} />;
}
