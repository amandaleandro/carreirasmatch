import { redirect } from "next/navigation";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { normalizeCareerSegment } from "@/lib/career-segments";
import { OnboardingWizard } from "@/components/onboarding/onboarding-wizard";
import { BrandLogo } from "@/components/brand-logo";
import Link from "next/link";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Vamos descobrir seu próximo passo | CarreirasMatch",
  robots: { index: false, follow: false },
};

export default async function OnboardingPage() {
  const session = await auth();
  if (!session?.user?.id) redirect("/login");

  const user = await prisma.user.findUnique({
    where: { id: session.user.id },
    select: { careerSegment: true, targetProfessionalArea: true, professionalArea: true },
  });

  return (
    <div className="min-h-screen bg-slate-50/60 dark:bg-slate-950">
      <header className="border-b border-slate-200/80 bg-white px-4 py-4 dark:border-slate-800 dark:bg-slate-950">
        <div className="mx-auto max-w-xl space-y-1">
          <Link href="/" aria-label="CarreirasMatch">
            <BrandLogo heightClassName="h-8" />
          </Link>
          <p className="text-xs font-medium text-slate-500 dark:text-slate-400">
            O copiloto da sua carreira inteira: vamos entender onde você está pra mostrar o próximo passo certo.
          </p>
        </div>
      </header>
      <OnboardingWizard
        initialSegment={normalizeCareerSegment(user?.careerSegment)}
        initialArea={user?.targetProfessionalArea ?? user?.professionalArea ?? null}
      />
    </div>
  );
}
