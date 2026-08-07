import { requireAuthPage } from "@/lib/require-auth-page";
import { prisma } from "@/lib/prisma";
import { UniversityHub } from "@/components/university/university-hub";
import type { SubjectExercise } from "@/lib/university";
import type { Metadata } from "next";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Universidade | CarreirasMatch",
  description: "Seu curso, seu período e como cada disciplina se conecta com sua carreira.",
};

export default async function UniversityPage() {
  const session = await requireAuthPage();

  const enrollment = await prisma.universityEnrollment.findUnique({
    where: { userId: session.user.id },
    include: {
      manualSubjects: { orderBy: { createdAt: "asc" } },
      universityCourse: {
        include: {
          university: { select: { name: true } },
          subjects: { orderBy: [{ semester: "asc" }, { order: "asc" }], include: { insight: true, exercises: true, studyMaterial: true } },
        },
      },
    },
  });

  const availableSemesters = enrollment?.universityCourse
    ? Array.from(new Set(enrollment.universityCourse.subjects.map((s) => s.semester).filter((s): s is number => s !== null))).sort((a, b) => a - b)
    : [];

  const catalogSubjects = enrollment?.universityCourse
    ? enrollment.universityCourse.subjects.filter((s) => s.semester === enrollment.currentSemester || enrollment.currentSemester === null)
    : [];
  const subjectProgress = {
    total: catalogSubjects.length,
    connected: catalogSubjects.filter((s) => s.insight !== null).length,
  };

  return (
    <UniversityHub
      enrollment={
        enrollment
          ? {
              institution: enrollment.institution,
              courseName: enrollment.courseName,
              period: enrollment.period,
              currentSemester: enrollment.currentSemester,
              universityCourseId: enrollment.universityCourseId,
              universityCourseTitle: enrollment.universityCourse?.title ?? null,
              universityName: enrollment.universityCourse?.university.name ?? null,
            }
          : null
      }
      availableSemesters={availableSemesters}
      catalogSubjects={catalogSubjects.map((s) => ({
        id: s.id,
        name: s.name,
        semester: s.semester,
        insight: s.insight
          ? {
              competencies: JSON.parse(s.insight.competencies) as string[],
              relatedProfessions: JSON.parse(s.insight.relatedProfessions) as string[],
              suggestedProject: s.insight.suggestedProject,
            }
          : null,
        exercises: s.exercises ? (JSON.parse(s.exercises.questions) as SubjectExercise[]) : null,
        studyMaterial: s.studyMaterial
          ? {
              summary: s.studyMaterial.summary,
              topics: JSON.parse(s.studyMaterial.topics) as string[],
              keyPoints: JSON.parse(s.studyMaterial.keyPoints) as string[],
            }
          : null,
      }))}
      manualSubjects={
        enrollment?.manualSubjects.map((s) => ({
          id: s.id,
          name: s.name,
          hasSyllabus: !!s.syllabus,
          insight:
            s.competencies && s.relatedProfessions && s.suggestedProject
              ? {
                  competencies: JSON.parse(s.competencies) as string[],
                  relatedProfessions: JSON.parse(s.relatedProfessions) as string[],
                  suggestedProject: s.suggestedProject,
                }
              : null,
          exercises: s.exercises ? (JSON.parse(s.exercises) as SubjectExercise[]) : null,
          studyMaterial:
            s.studyMaterialSummary && s.studyMaterialTopics && s.studyMaterialKeyPoints
              ? {
                  summary: s.studyMaterialSummary,
                  topics: JSON.parse(s.studyMaterialTopics) as string[],
                  keyPoints: JSON.parse(s.studyMaterialKeyPoints) as string[],
                }
              : null,
        })) ?? []
      }
      subjectProgress={subjectProgress}
    />
  );
}
