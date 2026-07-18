import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { isAdminEmail } from "@/lib/admin";
import { isInfluencerUser } from "@/lib/influencer";
import { SidebarNav } from "@/components/sidebar-nav";
import { Topbar } from "@/components/topbar";
import { GuidedTour } from "@/components/guided-tour";
import { UpcomingFeaturesModal } from "@/components/upcoming-features-modal";
import { UiPanelsProvider } from "@/components/ui-panels";
import { normalizeCareerSegment } from "@/lib/career-segments";

export async function AppShell({ children }: { children: React.ReactNode }) {
  const session = await auth();

  if (!session?.user) {
    return <>{children}</>;
  }

  const dbUser = session.user.id
    ? await prisma.user.findUnique({
        where: { id: session.user.id },
        select: { name: true, image: true, careerSegment: true },
      })
    : null;

  const userName = dbUser?.name ?? session.user.name ?? session.user.email ?? "Usuário";
  const userEmail = session.user.email ?? "";
  const userImage = dbUser?.image ?? null;
  const isAdmin = isAdminEmail(session.user.email);
  const isInfluencer = await isInfluencerUser(session.user.id);
  const segment = normalizeCareerSegment(dbUser?.careerSegment);

  return (
    <UiPanelsProvider>
      <div className="flex min-h-screen">
        <SidebarNav isAdmin={isAdmin} isInfluencer={isInfluencer} />
        <div className="flex-1 flex flex-col min-w-0">
          <Topbar userName={userName} userEmail={userEmail} userImage={userImage} />
          <main className="flex-1">{children}</main>
        </div>
        <GuidedTour segment={segment} />
        <UpcomingFeaturesModal />
      </div>
    </UiPanelsProvider>
  );
}
