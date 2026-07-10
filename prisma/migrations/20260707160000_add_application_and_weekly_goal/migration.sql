-- CreateTable
CREATE TABLE "Application" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "userId" TEXT NOT NULL,
    "jobId" TEXT,
    "analysisId" TEXT,
    "company" TEXT NOT NULL DEFAULT '',
    "jobTitle" TEXT NOT NULL,
    "jobUrl" TEXT NOT NULL DEFAULT '',
    "fitScore" INTEGER,
    "status" TEXT NOT NULL DEFAULT 'saved',
    "notes" TEXT NOT NULL DEFAULT '',
    "appliedAt" DATETIME,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "Application_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "Application_jobId_fkey" FOREIGN KEY ("jobId") REFERENCES "Job" ("id") ON DELETE SET NULL ON UPDATE CASCADE,
    CONSTRAINT "Application_analysisId_fkey" FOREIGN KEY ("analysisId") REFERENCES "Analysis" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "WeeklyGoal" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "userId" TEXT NOT NULL,
    "weekStart" DATETIME NOT NULL,
    "targetApplications" INTEGER NOT NULL DEFAULT 8,
    "targetResumeTweaks" INTEGER NOT NULL DEFAULT 2,
    "targetInterviews" INTEGER NOT NULL DEFAULT 3,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "WeeklyGoal_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateIndex
CREATE INDEX "Application_userId_status_idx" ON "Application"("userId", "status");

-- CreateIndex
CREATE INDEX "Application_userId_jobUrl_idx" ON "Application"("userId", "jobUrl");

-- CreateIndex
CREATE UNIQUE INDEX "WeeklyGoal_userId_weekStart_key" ON "WeeklyGoal"("userId", "weekStart");

