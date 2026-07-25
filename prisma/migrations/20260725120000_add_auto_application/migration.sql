CREATE TABLE "AutoApplicationSettings" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "enabled" BOOLEAN NOT NULL DEFAULT false,
    "minMatchScore" INTEGER NOT NULL DEFAULT 75,
    "autoTailorResume" BOOLEAN NOT NULL DEFAULT true,
    "externalAutomationEnabled" BOOLEAN NOT NULL DEFAULT false,
    "applicationProfile" TEXT NOT NULL DEFAULT '{}',
    "preferredPlatforms" TEXT NOT NULL DEFAULT '["linkedin", "gupy", "indeed"]',
    "dailyLimit" INTEGER NOT NULL DEFAULT 10,
    "notifyOnApplication" BOOLEAN NOT NULL DEFAULT true,
    "consentedAt" TIMESTAMP(3),
    "externalConsentedAt" TIMESTAMP(3),
    "lastRunAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "AutoApplicationSettings_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "AutoApplicationQueue" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "jobId" TEXT,
    "jobTitle" TEXT NOT NULL,
    "company" TEXT NOT NULL,
    "jobUrl" TEXT NOT NULL,
    "fitScore" INTEGER NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'queued',
    "tailoredResumeId" TEXT,
    "failureReason" TEXT,
    "appliedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "AutoApplicationQueue_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX "AutoApplicationSettings_userId_key" ON "AutoApplicationSettings"("userId");
CREATE INDEX "AutoApplicationQueue_userId_status_idx" ON "AutoApplicationQueue"("userId", "status");
CREATE UNIQUE INDEX "AutoApplicationQueue_userId_jobId_key" ON "AutoApplicationQueue"("userId", "jobId");

ALTER TABLE "AutoApplicationSettings"
ADD CONSTRAINT "AutoApplicationSettings_userId_fkey"
FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE "AutoApplicationQueue"
ADD CONSTRAINT "AutoApplicationQueue_userId_fkey"
FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE "AutoApplicationQueue"
ADD CONSTRAINT "AutoApplicationQueue_jobId_fkey"
FOREIGN KEY ("jobId") REFERENCES "Job"("id") ON DELETE SET NULL ON UPDATE CASCADE;
