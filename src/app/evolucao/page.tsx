import { requireAuthPage } from "@/lib/require-auth-page";
import { prisma } from "@/lib/prisma";
import { CareerGrowthHub } from "@/components/career-growth-hub";
import type { Metadata } from "next";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Evolução Profissional | CarreirasMatch",
  description: "Do seu cargo atual ao próximo: gaps de competência, plano de desenvolvimento e argumentos de negociação.",
};

export default async function CareerGrowthPage() {
  const session = await requireAuthPage();

  const plan = await prisma.careerGrowthPlan.findUnique({ where: { userId: session.user.id } });

  return (
    <CareerGrowthHub
      plan={
        plan
          ? {
              currentRole: plan.currentRole,
              currentSeniority: plan.currentSeniority,
              targetRole: plan.targetRole,
              result:
                plan.competencyGaps && plan.developmentActions && plan.negotiationTalkingPoints && plan.leadershipReadiness
                  ? {
                      competencyGaps: JSON.parse(plan.competencyGaps),
                      developmentActions: JSON.parse(plan.developmentActions),
                      negotiationTalkingPoints: JSON.parse(plan.negotiationTalkingPoints),
                      leadershipReadiness: plan.leadershipReadiness,
                    }
                  : null,
            }
          : null
      }
    />
  );
}
