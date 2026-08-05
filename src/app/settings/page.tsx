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
import { FeatureUsageSection } from "@/components/feature-usage-section";
import { JobAlertManager } from "@/components/job-alert-manager";
import { DiscoverableToggle } from "@/components/discoverable-toggle";
import { WhatsappOptInToggle } from "@/components/whatsapp-optin-toggle";
import { ContactRequestsInbox } from "@/components/contact-requests-inbox";
import { DataPrivacySection } from "@/components/data-privacy-section";
import { normalizeCareerSegment } from "@/lib/career-segments";
import { CAREER_OFFER_BY_SEGMENT } from "@/lib/career-offers";
import { COMMERCIAL_PLANS } from "@/lib/commercial-plan-catalog";
import { ArrowLeft, User, Shield, CreditCard, Award, Lock } from "lucide-react";

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
        passwordHash: true,
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
    <main className="max-w-3xl mx-auto px-4 sm:px-6 md:px-8 py-7 md:py-10 w-full space-y-6">
      {/* Top Header */}
      <div className="flex items-center justify-between">
        <Link
          href="/dashboard"
          className="text-xs font-semibold text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-slate-100 transition-colors inline-flex items-center gap-1.5"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          <span>Voltar ao Painel</span>
        </Link>

        <span className="inline-flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wider rounded-full px-3 py-1 bg-slate-100 dark:bg-slate-800/80 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-700/60">
          <User className="w-3.5 h-3.5 text-slate-500" />
          <span>Minha Conta</span>
        </span>
      </div>

      <header className="space-y-1">
        <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-slate-900 dark:text-white">
          Configurações do Perfil
        </h1>
        <p className="text-slate-600 dark:text-slate-400 text-sm sm:text-base">
          Gerencie suas preferências, dados pessoais e orientações de carreira.
        </p>
      </header>

      {upgrade === "1" && (
        <div className="rounded-2xl border border-amber-200/80 dark:border-amber-900/60 bg-amber-50/50 dark:bg-amber-950/20 p-4 text-xs sm:text-sm text-slate-800 dark:text-slate-200">
          Essa ferramenta faz parte do plano PRO. Atualize a sua assinatura abaixo para continuar aproveitando.
        </div>
      )}

      <section className="rounded-xl border border-slate-200/80 dark:border-slate-800 bg-white dark:bg-slate-900 p-5 shadow-sm space-y-4">
        <h2 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
          <User className="w-4 h-4 text-slate-500" />
          Dados Pessoais
        </h2>
        <ProfileForm
          initialName={user?.name ?? session.user.name ?? ""}
          initialImage={user?.image ?? null}
        />
      </section>

      <section className="rounded-xl border border-slate-200/80 dark:border-slate-800 bg-white dark:bg-slate-900 p-5 shadow-sm space-y-4">
        <div>
          <h2 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
            <Lock className="w-4 h-4 text-slate-500" />
            Segurança & Senha
          </h2>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
            Altere a senha da sua conta para manter seus acessos protegidos.
          </p>
        </div>
        <ChangePasswordForm />
      </section>

      <section className="rounded-xl border border-slate-200/80 dark:border-slate-800 bg-white dark:bg-slate-900 p-5 shadow-sm space-y-4">
        <h2 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
          <Award className="w-4 h-4 text-slate-500" />
          Momento de Carreira
        </h2>
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

      <section className="rounded-2xl border border-slate-200/80 dark:border-slate-800 bg-white dark:bg-slate-900 p-6 shadow-sm">
        <InterestedRolesForm initialRoles={interestedRoles} initialArea={user?.professionalArea ?? null} />
      </section>

      {offer && (
        <section className="rounded-2xl border border-slate-200/80 dark:border-slate-800 bg-white dark:bg-slate-900 p-6 shadow-sm space-y-4">
          <h2 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
            <CreditCard className="w-4 h-4 text-slate-500" />
            Plano & Assinatura
          </h2>
          <BillingSection
            monthlyPrice={`R$ ${(COMMERCIAL_PLANS.pro.priceCents / 100).toFixed(2).replace(".", ",")}/mês`}
            monthlyName={offer.monthlyName}
            subscriptionStatus={subscription?.status ?? null}
            currentPeriodEnd={subscription?.currentPeriodEnd?.toISOString() ?? null}
            payerEmail={session.user.email ?? ""}
          />
        </section>
      )}

      <section className="rounded-2xl border border-slate-200/80 dark:border-slate-800 bg-white dark:bg-slate-900 p-6 shadow-sm space-y-4">
        <div>
          <h2 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
            <CreditCard className="w-4 h-4 text-slate-500" />
            Uso este mês
          </h2>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
            Acompanhe quanto você já usou de cada recurso do seu plano neste ciclo.
          </p>
        </div>
        <FeatureUsageSection userId={session.user.id} />
      </section>

      <section className="rounded-2xl border border-slate-200/80 dark:border-slate-800 bg-white dark:bg-slate-900 p-6 shadow-sm">
        <CourseListForm courses={courses} professionalArea={user?.professionalArea ?? null} />
      </section>

      <section className="rounded-2xl border border-slate-200/80 dark:border-slate-800 bg-white dark:bg-slate-900 p-6 shadow-sm">
        <JobAlertManager initialAlerts={jobAlerts} />
      </section>

      <section className="rounded-2xl border border-slate-200/80 dark:border-slate-800 bg-white dark:bg-slate-900 p-6 shadow-sm">
        <DiscoverableToggle initialValue={user?.discoverable ?? false} />
      </section>

      <section className="rounded-2xl border border-slate-200/80 dark:border-slate-800 bg-white dark:bg-slate-900 p-6 shadow-sm">
        <WhatsappOptInToggle
          initialValue={user?.whatsappMarketingOptIn ?? false}
          initialPhone={user?.phone ?? null}
        />
      </section>

      {(user?.discoverable || contactRequests.length > 0) && (
        <section className="rounded-2xl border border-slate-200/80 dark:border-slate-800 bg-white dark:bg-slate-900 p-6 shadow-sm">
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

      <section className="rounded-2xl border border-slate-200/80 dark:border-slate-800 bg-white dark:bg-slate-900 p-6 shadow-sm space-y-4">
        <div>
          <h2 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
            <Shield className="w-4 h-4 text-slate-500" />
            Dados & Privacidade (LGPD)
          </h2>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
            Exporte seus dados ou gerencie os privilégios da sua conta.
          </p>
        </div>
        <DataPrivacySection hasPassword={Boolean(user?.passwordHash)} />
      </section>
    </main>
  );
}
