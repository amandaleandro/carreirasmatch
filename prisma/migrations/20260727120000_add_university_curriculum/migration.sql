-- CreateTable
CREATE TABLE "University" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "city" TEXT NOT NULL DEFAULT '',
    "state" TEXT NOT NULL DEFAULT '',
    "website" TEXT NOT NULL DEFAULT '',
    "source" TEXT NOT NULL,
    "active" BOOLEAN NOT NULL DEFAULT true,
    "lastSeenAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "University_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "UniversityCourse" (
    "id" TEXT NOT NULL,
    "universityId" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "area" TEXT NOT NULL,
    "subarea" TEXT NOT NULL DEFAULT '',
    "url" TEXT NOT NULL,
    "modality" TEXT NOT NULL DEFAULT 'presencial',
    "active" BOOLEAN NOT NULL DEFAULT true,
    "source" TEXT NOT NULL,
    "lastSeenAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "UniversityCourse_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "CurriculumSubject" (
    "id" TEXT NOT NULL,
    "universityCourseId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "semester" INTEGER,
    "order" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "CurriculumSubject_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "University_slug_key" ON "University"("slug");

-- CreateIndex
CREATE INDEX "University_state_city_idx" ON "University"("state", "city");

-- CreateIndex
CREATE UNIQUE INDEX "UniversityCourse_slug_key" ON "UniversityCourse"("slug");

-- CreateIndex
CREATE UNIQUE INDEX "UniversityCourse_url_key" ON "UniversityCourse"("url");

-- CreateIndex
CREATE INDEX "UniversityCourse_universityId_idx" ON "UniversityCourse"("universityId");

-- CreateIndex
CREATE INDEX "UniversityCourse_active_area_idx" ON "UniversityCourse"("active", "area");

-- CreateIndex
CREATE INDEX "UniversityCourse_source_lastSeenAt_idx" ON "UniversityCourse"("source", "lastSeenAt");

-- CreateIndex
CREATE INDEX "CurriculumSubject_universityCourseId_idx" ON "CurriculumSubject"("universityCourseId");

-- AddForeignKey
ALTER TABLE "UniversityCourse" ADD CONSTRAINT "UniversityCourse_universityId_fkey" FOREIGN KEY ("universityId") REFERENCES "University"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CurriculumSubject" ADD CONSTRAINT "CurriculumSubject_universityCourseId_fkey" FOREIGN KEY ("universityCourseId") REFERENCES "UniversityCourse"("id") ON DELETE CASCADE ON UPDATE CASCADE;
