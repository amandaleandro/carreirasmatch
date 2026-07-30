import { prisma } from "@/lib/prisma";
import { ProfileSuggestions, ProfileSuggestionType, ProfileSuggestionStatus } from "@/components/profile-suggestions";
import { CareerProfileHub } from "@/components/career-profile-hub";
import { requireSubscriptionPage } from "@/lib/require-subscription-page";
import { rankCourses } from "@/lib/course-match";
import { normalizeCareerSegment } from "@/lib/career-segments";
import { findObjective } from "@/lib/onboarding-objectives";

export const dynamic = "force-dynamic";

export default async function ProfilePage() {
  const session = await requireSubscriptionPage();
  const userId = session.user.id;

  const [
    suggestions,
    user,
    externalCourses,
    latestResume,
    analysesCount,
    applicationsCount,
    softSkillResult,
    vocationResult,
    coursesCount,
  ] = await Promise.all([
    prisma.profileSuggestion.findMany({ where: { userId }, orderBy: { impactScore: "desc" } }),
    prisma.user.findUnique({
      where: { id: userId },
      select: { professionalArea: true, city: true, state: true, careerSegment: true, objective: true },
    }),
    prisma.externalCourse.findMany({ where: { active: true }, orderBy: { lastSeenAt: "desc" }, take: 100 }),
    prisma.resume.findFirst({ where: { userId }, orderBy: { createdAt: "desc" }, select: { id: true, fileName: true, createdAt: true } }),
    prisma.analysis.count({ where: { resume: { userId } } }),
    prisma.application.count({ where: { userId } }),
    prisma.softSkillTestResult.findFirst({ where: { userId }, orderBy: { createdAt: "desc" }, select: { personalityLabel: true, createdAt: true } }),
    prisma.vocationTestResult.findFirst({ where: { userId }, orderBy: { createdAt: "desc" }, select: { areaSlug: true, createdAt: true } }),
    prisma.userCourse.count({ where: { userId } }),
  ]);

  // Com área definida, ranqueia por relevância (descarta os sem match); sem área, mostra
  // os mais recentes como fallback para a página não ficar vazia. Cursos presenciais na
  // cidade/estado do usuário sobem no ranking (ver bônus de região em course-match.ts).
  const area = user?.professionalArea ?? "";
  const relevantCourses = (
    area.trim()
      ? rankCourses(externalCourses, { area, city: user?.city, state: user?.state })
      : externalCourses
  ).slice(0, 12);

  const objective = findObjective(normalizeCareerSegment(user?.careerSegment), user?.objective ?? "");

  return (
    <div className="space-y-8">
      <CareerProfileHub
        objectiveLabel={objective?.label ?? null}
        resume={latestResume}
        analysesCount={analysesCount}
        applicationsCount={applicationsCount}
        softSkillResult={softSkillResult}
        vocationResult={vocationResult}
        coursesCount={coursesCount}
      />
      <ProfileSuggestions
        initialSuggestions={suggestions.map((s) => ({
          ...s,
          type: s.type as ProfileSuggestionType,
          status: s.status as ProfileSuggestionStatus,
        }))}
        externalCourses={relevantCourses}
      />
    </div>
  );
}
