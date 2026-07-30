import { prisma } from "@/lib/prisma";
import { PartnerShell } from "@/components/partner-shell";
import { requirePartnerPage } from "@/lib/partner-auth";
import { EmployabilityDashboard } from "@/components/employability-dashboard";

export const dynamic = "force-dynamic";

const MIN_STUDENTS_FOR_METRIC = 5;

export default async function PartnerEmployabilityPage() {
  const { partner } = await requirePartnerPage();

  if (!partner.universityId) {
    return (
      <PartnerShell partnerName={partner.name} logoUrl={partner.logoUrl} credits={partner.credits}>
        <EmployabilityDashboard linked={false} metrics={null} />
      </PartnerShell>
    );
  }

  const university = await prisma.university.findUnique({ where: { id: partner.universityId } });

  const courses = await prisma.universityCourse.findMany({
    where: { universityId: partner.universityId },
    select: { id: true, title: true },
  });
  const courseIds = courses.map((c) => c.id);

  const enrollments = await prisma.universityEnrollment.findMany({
    where: { universityCourseId: { in: courseIds } },
    select: { userId: true, universityCourseId: true },
  });
  const studentIds = enrollments.map((e) => e.userId);

  const courseBreakdown = courses
    .map((course) => ({
      title: course.title,
      count: enrollments.filter((e) => e.universityCourseId === course.id).length,
    }))
    .filter((c) => c.count >= MIN_STUDENTS_FOR_METRIC)
    .sort((a, b) => b.count - a.count);

  let employability: {
    totalStudents: number;
    withResume: number;
    withAnalysis: number;
    avgMatchScore: number | null;
    withApplications: number;
  } | null = null;

  if (studentIds.length >= MIN_STUDENTS_FOR_METRIC) {
    const [resumeOwners, analyses, applicants] = await Promise.all([
      prisma.resume.findMany({ where: { userId: { in: studentIds } }, select: { userId: true }, distinct: ["userId"] }),
      prisma.analysis.findMany({
        where: { resume: { userId: { in: studentIds } } },
        select: { overallScore: true, resume: { select: { userId: true } } },
      }),
      prisma.application.findMany({ where: { userId: { in: studentIds } }, select: { userId: true }, distinct: ["userId"] }),
    ]);

    const studentsWithAnalysis = new Set(analyses.map((a) => a.resume.userId));

    employability = {
      totalStudents: studentIds.length,
      withResume: resumeOwners.length,
      withAnalysis: studentsWithAnalysis.size,
      avgMatchScore: analyses.length > 0 ? Math.round(analyses.reduce((sum, a) => sum + a.overallScore, 0) / analyses.length) : null,
      withApplications: applicants.length,
    };
  }

  return (
    <PartnerShell partnerName={partner.name} logoUrl={partner.logoUrl} credits={partner.credits}>
      <EmployabilityDashboard
        linked
        universityName={university?.name ?? null}
        metrics={employability}
        courseBreakdown={courseBreakdown}
        minThreshold={MIN_STUDENTS_FOR_METRIC}
      />
    </PartnerShell>
  );
}
