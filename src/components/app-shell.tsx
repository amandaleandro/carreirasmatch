import dynamic from "next/dynamic";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { isAdminEmail } from "@/lib/admin";
import { isInfluencerUser } from "@/lib/influencer";
import { hasActiveSubscriptionAccess } from "@/lib/entitlements";
import { DesafioBanner } from "@/components/desafio-banner";
import { SubscriptionNudgeProvider } from "@/components/subscription-nudge";
import { normalizeCareerSegment } from "@/lib/career-segments";

// Code-splitting: essas telas só renderizam para quem está logado como candidato, mas
// como AppShell é um único componente com branches, sem dynamic() o Next empacotava o JS
// delas no bundle compartilhado de toda página (inclusive a home para visitante anônimo).
const SidebarNav = dynamic(() => import("@/components/sidebar-nav").then((m) => m.SidebarNav));
const Topbar = dynamic(() => import("@/components/topbar").then((m) => m.Topbar));
const GuidedTour = dynamic(() => import("@/components/guided-tour").then((m) => m.GuidedTour));
const UpcomingFeaturesModal = dynamic(() =>
  import("@/components/upcoming-features-modal").then((m) => m.UpcomingFeaturesModal)
);
const UiPanelsProvider = dynamic(() => import("@/components/ui-panels").then((m) => m.UiPanelsProvider));

export async function AppShell({ children }: { children: React.ReactNode }) {
  const session = await auth();

  if (!session?.user) {
    return (
      <SubscriptionNudgeProvider enabled segment="career_pro">
        <DesafioBanner />
        <div className="public-workspace" data-public-workspace>
          {children}
        </div>
      </SubscriptionNudgeProvider>
    );
  }

  // Sessão de empresa ou parceiro não usa o shell de candidato (sidebar/topbar): as páginas
  // de /empresa e /parceiro carregam o próprio header, e o resto do app redireciona
  // no middleware. data-authenticated ainda precisa ir junto, senão
  // o header público de "Entrar / Criar conta" aparece nas páginas de conteúdo
  // público (blog, vagas públicas) mesmo com a conta de empresa/parceiro logada.
  if (session.user.accountType === "company" || session.user.accountType === "partner") {
    return (
      <div data-authenticated>
        <DesafioBanner />
        <div className="public-workspace" data-public-workspace>
          {children}
        </div>
      </div>
    );
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
  // Intentional exception: drives the global subscription-nudge provider for the whole app shell
  // (any paid plan vs free), not a single feature's monthly limit — no natural catalog featureKey.
  const isSubscribed = await hasActiveSubscriptionAccess(session.user.id);

  return (
    <UiPanelsProvider>
      <SubscriptionNudgeProvider enabled={!isSubscribed} segment={segment ?? "career_pro"}>
        <div className="flex min-h-screen">
          <SidebarNav isAdmin={isAdmin} isInfluencer={isInfluencer} segment={segment} />
          <div className="flex-1 flex flex-col min-w-0">
            <Topbar
              userName={userName}
              userEmail={userEmail}
              userImage={userImage}
              segment={segment}
              isAdmin={isAdmin}
              isInfluencer={isInfluencer}
            />
            <DesafioBanner />
            {/* data-authenticated: o app já tem Topbar + Sidebar, então o CSS esconde
                o header público (.public-header) das páginas de marketing/conteúdo
                renderizadas aqui dentro, evitando barra de navegação duplicada. */}
            <main className="flex-1 app-workspace" data-authenticated>
              {children}
            </main>
          </div>
          <GuidedTour segment={segment} />
          <UpcomingFeaturesModal />
        </div>
      </SubscriptionNudgeProvider>
    </UiPanelsProvider>
  );
}
