import Link from "next/link";
import { redirect } from "next/navigation";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { SettingsForm } from "@/components/settings-form";
import { ProfileForm } from "@/components/profile-form";
import { ChangePasswordForm } from "@/components/change-password-form";
import { InterestedRolesForm } from "@/components/interested-roles-form";
import { CourseListForm } from "@/components/course-list-form";
import { BillingSection } from "@/components/billing-section";
import { JobAlertManager } from "@/components/job-alert-manager";
import { DiscoverableToggle } from "@/components/discoverable-toggle";
import { WhatsappOptInToggle } from "@/components/whatsapp-optin-toggle";
import { ContactRequestsInbox } from "@/components/contact-requests-inbox";
import { normalizeCareerSegment } from "@/lib/career-segments";
import { CAREER_OFFER_BY_SEGMENT } from "@/lib/career-offers";

export const dynamic = "force-dynamic";

export default async function SettingsPage({
  searchParams,
}: {
  searchParams: Promise<{ upgrade?: string }>;
}) {
  const session = await auth();
  if (!session?.user?.id) redirect("/login");

  const { upgrade } = await searchParams;

  const [user, courses, subscription, jobAlerts, contactRequests] = await Promise.all([
    prisma.user.findUnique({
      where: { id: session.user.id },
      select: {
        name: true,
        image: true,
        careerSegment: true,
        professionalArea: true,
        currentProfessionalArea: true,
        targetProfessionalArea: true,
        studyCourse: true,
        city: true,
        state: true,
        hasFormalEducation: true,
        interestedRoles: true,
        discoverable: true,
        phone: true,
        whatsappMarketingOptIn: true,
      },
    }),
    prisma.userCourse.findMany({
      where: { userId: session.user.id },
      orderBy: { createdAt: "desc" },
      select: { id: true, title: true, provider: true, url: true, status: true },
    }),
    prisma.subscription.findUnique({
      where: { userId: session.user.id },
      select: { status: true, currentPeriodEnd: true },
    }),
    prisma.jobAlert.findMany({
      where: { userId: session.user.id, active: true },
      orderBy: { createdAt: "desc" },
      select: { id: true, query: true, city: true, state: true, frequency: true },
    }),
    prisma.talentContactRequest.findMany({
      where: { userId: session.user.id },
      orderBy: { createdAt: "desc" },
      select: {
        id: true,
        jobTitle: true,
        message: true,
        status: true,
        createdAt: true,
        company: { select: { name: true } },
      },
    }),
  ]);

  const segment = normalizeCareerSegment(user?.careerSegment);
  const offer = segment ? CAREER_OFFER_BY_SEGMENT[segment] : null;

  let interestedRoles: string[] = [];
  try {
    const parsed = JSON.parse(user?.interestedRoles ?? "[]");
    if (Array.isArray(parsed)) interestedRoles = parsed.filter((r) => typeof r === "string");
  } catch {
    interestedRoles = [];
  }

  return (
    <main className="max-w-2xl mx-auto px-4 md:px-8 py-12 w-full space-y-6">
      <Link href="/dashboard" className="text-sm font-semibold text-blue-600 dark:text-blue-400 hover:underline">
        ← Voltar ao Painel
      </Link>
      <header>
        <span className="inline-flex items-center gap-1.5 text-[11px] font-semibold uppercase tracking-wider rounded-full px-3 py-1 mb-3 bg-blue-50 text-blue-600 border border-blue-200 dark:bg-blue-950/40 dark:text-blue-300 dark:border-blue-900">
          Sua conta
        </span>
        <h1 className="text-2xl md:text-3xl font-bold tracking-tight">Perfil</h1>
        <p className="text-neutral-600 dark:text-neutral-400 mt-2">
          Atualize o seu momento de carreira e área de atuação para receber recomendações mais precisas.
        </p>
      </header>

      {upgrade === "1" && (
        <div className="rounded-xl border border-blue-200 dark:border-blue-900 bg-blue-50/60 dark:bg-blue-950/30 p-4 text-sm text-blue-900 dark:text-blue-200">
          Essa ferramenta faz parte do plano mensal. Assine abaixo para continuar.
        </div>
      )}

      <section className="rounded-2xl border border-neutral-200/80 dark:border-neutral-800 bg-white dark:bg-neutral-950 p-6 shadow-sm shadow-slate-900/5">
        <h2 className="text-lg font-semibold mb-4">Dados pessoais</h2>
        <ProfileForm
          initialName={user?.name ?? session.user.name ?? ""}
          initialImage={user?.image ?? null}
        />
      </section>

      <section className="rounded-2xl border border-neutral-200/80 dark:border-neutral-800 bg-white dark:bg-neutral-950 p-6 shadow-sm shadow-slate-900/5">
        <h2 className="text-lg font-semibold mb-1">Segurança & Senha</h2>
        <p className="text-xs text-neutral-500 dark:text-neutral-400 mb-4">
          Altere a senha da sua conta a qualquer momento.
        </p>
        <ChangePasswordForm />
      </section>

      <section className="rounded-2xl border border-neutral-200/80 dark:border-neutral-800 bg-white dark:bg-neutral-950 p-6 shadow-sm shadow-slate-900/5">
        <h2 className="text-lg font-semibold mb-4">Momento de carreira</h2>
        <SettingsForm
          initialSegment={normalizeCareerSegment(user?.careerSegment)}
          initialArea={user?.professionalArea ?? null}
          initialCurrentArea={user?.currentProfessionalArea ?? null}
          initialTargetArea={user?.targetProfessionalArea ?? null}
          initialStudyCourse={user?.studyCourse ?? null}
          initialHasFormalEducation={user?.hasFormalEducation ?? null}
          initialCity={user?.city ?? null}
          initialState={user?.state ?? null}
        />
      </section>

      <section className="rounded-2xl border border-neutral-200/80 dark:border-neutral-800 bg-white dark:bg-neutral-950 p-6 shadow-sm shadow-slate-900/5">
        <InterestedRolesForm initialRoles={interestedRoles} />
      </section>

      {offer && (
        <section className="rounded-2xl border border-neutral-200/80 dark:border-neutral-800 bg-white dark:bg-neutral-950 p-6 shadow-sm shadow-slate-900/5">
          <h2 className="text-lg font-semibold mb-4">Pagamento</h2>
          <BillingSection
            monthlyPrice={offer.monthlyPrice}
            monthlyName={offer.monthlyName}
            subscriptionStatus={subscription?.status ?? null}
            currentPeriodEnd={subscription?.currentPeriodEnd?.toISOString() ?? null}
            payerEmail={session.user.email ?? ""}
          />
        </section>
      )}

      <section className="rounded-2xl border border-neutral-200/80 dark:border-neutral-800 bg-white dark:bg-neutral-950 p-6 shadow-sm shadow-slate-900/5">
        <CourseListForm courses={courses} professionalArea={user?.professionalArea ?? null} />
      </section>

      <section className="rounded-2xl border border-neutral-200/80 dark:border-neutral-800 bg-white dark:bg-neutral-950 p-6 shadow-sm shadow-slate-900/5">
        <JobAlertManager initialAlerts={jobAlerts} />
      </section>

      <section className="rounded-2xl border border-neutral-200/80 dark:border-neutral-800 bg-white dark:bg-neutral-950 p-6 shadow-sm shadow-slate-900/5">
        <DiscoverableToggle initialValue={user?.discoverable ?? false} />
      </section>

      <section className="rounded-2xl border border-neutral-200/80 dark:border-neutral-800 bg-white dark:bg-neutral-950 p-6 shadow-sm shadow-slate-900/5">
        <WhatsappOptInToggle
          initialValue={user?.whatsappMarketingOptIn ?? false}
          initialPhone={user?.phone ?? null}
        />
      </section>

      {(user?.discoverable || contactRequests.length > 0) && (
        <section className="rounded-2xl border border-neutral-200/80 dark:border-neutral-800 bg-white dark:bg-neutral-950 p-6 shadow-sm shadow-slate-900/5">
          <ContactRequestsInbox
            initialRequests={contactRequests.map((r) => ({
              id: r.id,
              companyName: r.company.name,
              jobTitle: r.jobTitle,
              message: r.message,
              status: r.status,
              createdAt: r.createdAt.toISOString(),
            }))}
          />
        </section>
      )}
    </main>
  );
}
