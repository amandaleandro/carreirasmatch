-- AlterTable
ALTER TABLE "UniversitySubject" ADD COLUMN "syllabus" TEXT;
ALTER TABLE "UniversitySubject" ADD COLUMN "studyMaterialSummary" TEXT;
ALTER TABLE "UniversitySubject" ADD COLUMN "studyMaterialTopics" TEXT;
ALTER TABLE "UniversitySubject" ADD COLUMN "studyMaterialKeyPoints" TEXT;
ALTER TABLE "UniversitySubject" ADD COLUMN "studyMaterialGeneratedAt" TIMESTAMP(3);

-- CreateTable
CREATE TABLE "CurriculumSubjectStudyMaterial" (
    "id" TEXT NOT NULL,
    "curriculumSubjectId" TEXT NOT NULL,
    "summary" TEXT NOT NULL,
    "topics" TEXT NOT NULL,
    "keyPoints" TEXT NOT NULL,
    "generatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "CurriculumSubjectStudyMaterial_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "CurriculumSubjectStudyMaterial_curriculumSubjectId_key" ON "CurriculumSubjectStudyMaterial"("curriculumSubjectId");

-- AddForeignKey
ALTER TABLE "CurriculumSubjectStudyMaterial" ADD CONSTRAINT "CurriculumSubjectStudyMaterial_curriculumSubjectId_fkey" FOREIGN KEY ("curriculumSubjectId") REFERENCES "CurriculumSubject"("id") ON DELETE CASCADE ON UPDATE CASCADE;
