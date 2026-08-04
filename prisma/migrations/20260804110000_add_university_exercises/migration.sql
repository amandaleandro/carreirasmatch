ALTER TABLE "UniversitySubject" ADD COLUMN "exercises" TEXT;
ALTER TABLE "UniversitySubject" ADD COLUMN "exercisesGeneratedAt" TIMESTAMP(3);

CREATE TABLE "CurriculumSubjectExerciseSet" (
    "id" TEXT NOT NULL,
    "curriculumSubjectId" TEXT NOT NULL,
    "questions" TEXT NOT NULL,
    "generatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "CurriculumSubjectExerciseSet_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX "CurriculumSubjectExerciseSet_curriculumSubjectId_key" ON "CurriculumSubjectExerciseSet"("curriculumSubjectId");

ALTER TABLE "CurriculumSubjectExerciseSet" ADD CONSTRAINT "CurriculumSubjectExerciseSet_curriculumSubjectId_fkey" FOREIGN KEY ("curriculumSubjectId") REFERENCES "CurriculumSubject"("id") ON DELETE CASCADE ON UPDATE CASCADE;
