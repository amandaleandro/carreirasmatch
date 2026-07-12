import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { ActionPlan } from "@/components/action-plan";
import { requireSubscriptionPage } from "@/lib/require-subscription-page";

export const dynamic = "force-dynamic";

type StudyPlanPhased = { essential: string[]; niceToHave: string[]; later: string[] };

export default async function ActionPlanPage() {
  const session = await requireSubscriptionPage();

  const analyses = await prisma.analysis.findMany({
    where: { resume: { userId: session.user.id } },
    orderBy: { createdAt: "desc" },
  });

  if (analyses.length === 0) {
    return (
      <div className="max-w-3xl mx-auto px-4 py-16 w-full text-center">
        <h1 className="text-2xl font-bold tracking-tight">Seu plano de ação</h1>
        <p className="text-neutral-600 dark:text-neutral-400 mt-2">
          Faça sua primeira análise de vaga para receber um plano de ação
          personalizado.
        </p>
        <Link
          href="/"
          className="inline-block mt-6 rounded-xl bg-blue-600 text-white font-semibold px-6 py-3 shadow-sm shadow-blue-600/20 hover:bg-blue-700 transition-all"
        >
          Fazer minha primeira análise
        </Link>
      </div>
    );
  }

  const latest = analyses[0];

  const skillHistory: Record<string, { found: number; missing: number }> = {};
  for (const a of analyses) {
    const found: string[] = JSON.parse(a.keywordsFound || "[]");
    const missing: string[] = JSON.parse(a.keywordsMissing || "[]");
    for (const skill of found) {
      const key = skill.toLowerCase();
      skillHistory[key] = skillHistory[key] ?? { found: 0, missing: 0 };
      skillHistory[key].found += 1;
    }
    for (const skill of missing) {
      const key = skill.toLowerCase();
      skillHistory[key] = skillHistory[key] ?? { found: 0, missing: 0 };
      skillHistory[key].missing += 1;
    }
  }

  const keywordsMissing: string[] = JSON.parse(latest.keywordsMissing || "[]");
  const studyPlan: StudyPlanPhased = JSON.parse(
    latest.studyPlan || '{"essential":[],"niceToHave":[],"later":[]}'
  );
  const fixes: string[] = JSON.parse(latest.fixes || "[]");

  const priorityGaps = keywordsMissing.slice(0, 5).map((skill) => {
    const stats = skillHistory[skill.toLowerCase()] ?? { found: 0, missing: 1 };
    const total = stats.found + stats.missing;
    const proficiency = total > 0 ? Math.round((stats.found / total) * 100) : 0;
    return { skill, proficiency };
  });

  const applyNowCount = analyses.filter((a) => a.applicationStatus === "apply_now").length;

  const checkedItems: string[] = JSON.parse(latest.actionPlanProgress || "[]");

  const bridgeRoles: string[] = latest.bridgeRoles ? JSON.parse(latest.bridgeRoles) : [];

  return (
    <ActionPlan
      analysisId={latest.id}
      jobTitle={latest.jobTitle}
      overallScore={latest.overallScore}
      fixes={fixes}
      studyPlan={studyPlan}
      priorityGaps={priorityGaps}
      applyNowCount={applyNowCount}
      initialChecked={checkedItems}
      careerTrack={latest.careerTrack}
      bridgeRoles={bridgeRoles}
      transitionNarrative={latest.transitionNarrative}
      whyCareerChangeAnswer={latest.whyCareerChangeAnswer}
    />
  );
}
