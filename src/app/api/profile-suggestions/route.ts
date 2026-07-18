import { NextResponse } from "next/server";
import { requireAuth, requireActiveSubscription } from "@/lib/require-auth";
import { prisma } from "@/lib/prisma";
import { generateProfileSuggestions } from "@/lib/groq";
import { getCoursesForArea } from "@/lib/course-catalog";
import { rankCourses } from "@/lib/course-match";

export async function GET() {
  const { session, response } = await requireAuth();
  if (!session) return response!;

  const suggestions = await prisma.profileSuggestion.findMany({
    where: { userId: session.user.id },
    orderBy: { impactScore: "desc" },
  });

  return NextResponse.json({ suggestions });
}

export async function POST() {
  const { session, response } = await requireActiveSubscription();
  if (!session) return response!;

  const userId = session.user.id;

  const [user, analyses, courses, externalCourses] = await Promise.all([
    prisma.user.findUnique({
      where: { id: userId },
      select: { professionalArea: true, careerSegment: true, hasFormalEducation: true },
    }),
    prisma.analysis.findMany({
      where: { resume: { userId } },
      orderBy: { createdAt: "desc" },
    }),
    prisma.userCourse.findMany({ where: { userId }, select: { title: true } }),
    prisma.externalCourse.findMany({ where: { active: true }, orderBy: { lastSeenAt: "desc" }, take: 500 }),
  ]);

  const gapCounts = new Map<string, number>();
  for (const a of analyses) {
    const missing: string[] = JSON.parse(a.keywordsMissing || "[]");
    for (const skill of missing) {
      const key = skill.trim();
      if (!key) continue;
      gapCounts.set(key, (gapCounts.get(key) ?? 0) + 1);
    }
  }
  const topSkillGaps = [...gapCounts.entries()]
    .sort((a, b) => b[1] - a[1])
    .slice(0, 10)
    .map(([skill]) => skill);

  const latestResumeStructured = analyses[0]
    ? JSON.parse(analyses[0].resumeStructured || "{}")
    : {};
  const knownSkills: string[] = Array.isArray(latestResumeStructured.skills)
    ? latestResumeStructured.skills
    : [];

  const completedCourses = courses.map((c) => c.title);

  // Relevância por sobreposição de tokens contra área + lacunas (substitui o `includes`),
  // priorizando cursos que atacam as lacunas mais frequentes das análises do candidato.
  const liveOptions = rankCourses(externalCourses, {
    area: user?.professionalArea,
    skillGaps: topSkillGaps,
  })
    .slice(0, 30)
    .map((course) => ({
      title: course.title,
      provider: course.provider,
      free: course.free,
      modality: course.modality,
      city: course.city,
      certificate: course.certificate,
    }));
  const curatedOptions = [...getCoursesForArea(user?.professionalArea).map((c) => ({
    title: c.title,
    provider: c.provider,
    free: c.free,
  })), ...liveOptions];

  const result = await generateProfileSuggestions({
    professionalArea: user?.professionalArea,
    careerSegment: user?.careerSegment,
    hasFormalEducation: user?.hasFormalEducation,
    topSkillGaps,
    knownSkills,
    completedCourses,
    curatedOptions,
  });

  const [, suggestions] = await prisma.$transaction([
    prisma.profileSuggestion.deleteMany({ where: { userId } }),
    prisma.profileSuggestion.createManyAndReturn({
      data: result.suggestions.map((s) => ({
        userId,
        type: s.type,
        title: s.title,
        provider: s.provider,
        url: s.url ?? "",
        priceLabel: s.priceLabel,
        impactScore: s.impactScore,
        impactReason: s.impactReason,
        gapAddressed: s.gapAddressed ?? "",
        modality: s.type === "course" ? (s.modality ?? "") : "",
        city: "",
      })),
    }),
  ]);

  return NextResponse.json({ suggestions });
}
