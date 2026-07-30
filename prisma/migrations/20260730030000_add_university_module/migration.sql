-- CreateTable
CREATE TABLE "CurriculumSubjectInsight" (
    "id" TEXT NOT NULL,
    "curriculumSubjectId" TEXT NOT NULL,
    "competencies" TEXT NOT NULL,
    "relatedProfessions" TEXT NOT NULL,
    "suggestedProject" TEXT NOT NULL,
    "generatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "CurriculumSubjectInsight_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "UniversityEnrollment" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "institution" TEXT NOT NULL DEFAULT '',
    "courseName" TEXT NOT NULL DEFAULT '',
    "period" TEXT NOT NULL DEFAULT '',
    "universityCourseId" TEXT,
    "currentSemester" INTEGER,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "UniversityEnrollment_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "UniversitySubject" (
    "id" TEXT NOT NULL,
    "enrollmentId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "competencies" TEXT,
    "relatedProfessions" TEXT,
    "suggestedProject" TEXT,
    "generatedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "UniversitySubject_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "CurriculumSubjectInsight_curriculumSubjectId_key" ON "CurriculumSubjectInsight"("curriculumSubjectId");

-- CreateIndex
CREATE UNIQUE INDEX "UniversityEnrollment_userId_key" ON "UniversityEnrollment"("userId");

-- CreateIndex
CREATE INDEX "UniversitySubject_enrollmentId_idx" ON "UniversitySubject"("enrollmentId");

-- AddForeignKey
ALTER TABLE "CurriculumSubjectInsight" ADD CONSTRAINT "CurriculumSubjectInsight_curriculumSubjectId_fkey" FOREIGN KEY ("curriculumSubjectId") REFERENCES "CurriculumSubject"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "UniversityEnrollment" ADD CONSTRAINT "UniversityEnrollment_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "UniversityEnrollment" ADD CONSTRAINT "UniversityEnrollment_universityCourseId_fkey" FOREIGN KEY ("universityCourseId") REFERENCES "UniversityCourse"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "UniversitySubject" ADD CONSTRAINT "UniversitySubject_enrollmentId_fkey" FOREIGN KEY ("enrollmentId") REFERENCES "UniversityEnrollment"("id") ON DELETE CASCADE ON UPDATE CASCADE;
