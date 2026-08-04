ALTER TABLE "University" ADD COLUMN "nationalCode" TEXT;
ALTER TABLE "University" ADD COLUMN "category" TEXT NOT NULL DEFAULT '';
ALTER TABLE "University" ADD COLUMN "organization" TEXT NOT NULL DEFAULT '';
ALTER TABLE "University" ADD COLUMN "priority" INTEGER NOT NULL DEFAULT 100;
ALTER TABLE "University" ADD COLUMN "discoveryStatus" TEXT NOT NULL DEFAULT 'pending';
ALTER TABLE "University" ADD COLUMN "discoveryError" TEXT;
ALTER TABLE "University" ADD COLUMN "catalogLastSeenAt" TIMESTAMP(3);

ALTER TABLE "UniversityCourse" ADD COLUMN "nationalCode" TEXT;
ALTER TABLE "UniversityCourse" ADD COLUMN "degree" TEXT NOT NULL DEFAULT '';
ALTER TABLE "UniversityCourse" ADD COLUMN "campus" TEXT NOT NULL DEFAULT '';
ALTER TABLE "UniversityCourse" ADD COLUMN "catalogLastSeenAt" TIMESTAMP(3);
ALTER TABLE "UniversityCourse" ADD COLUMN "collectionStatus" TEXT NOT NULL DEFAULT 'pending';
ALTER TABLE "UniversityCourse" ADD COLUMN "collectionError" TEXT;

CREATE TABLE "UniversityScrapeJob" (
    "id" TEXT NOT NULL,
    "universityId" TEXT NOT NULL,
    "universityCourseId" TEXT,
    "url" TEXT NOT NULL,
    "adapter" TEXT NOT NULL DEFAULT 'auto',
    "status" TEXT NOT NULL DEFAULT 'pending',
    "priority" INTEGER NOT NULL DEFAULT 100,
    "attempts" INTEGER NOT NULL DEFAULT 0,
    "nextAttemptAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "lastAttemptAt" TIMESTAMP(3),
    "processedAt" TIMESTAMP(3),
    "lastError" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    CONSTRAINT "UniversityScrapeJob_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX "University_nationalCode_key" ON "University"("nationalCode");
CREATE UNIQUE INDEX "UniversityScrapeJob_universityId_url_key" ON "UniversityScrapeJob"("universityId", "url");
CREATE INDEX "UniversityScrapeJob_status_nextAttemptAt_priority_idx" ON "UniversityScrapeJob"("status", "nextAttemptAt", "priority");
CREATE INDEX "UniversityScrapeJob_universityId_status_idx" ON "UniversityScrapeJob"("universityId", "status");

ALTER TABLE "UniversityScrapeJob" ADD CONSTRAINT "UniversityScrapeJob_universityId_fkey" FOREIGN KEY ("universityId") REFERENCES "University"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "UniversityScrapeJob" ADD CONSTRAINT "UniversityScrapeJob_universityCourseId_fkey" FOREIGN KEY ("universityCourseId") REFERENCES "UniversityCourse"("id") ON DELETE CASCADE ON UPDATE CASCADE;
