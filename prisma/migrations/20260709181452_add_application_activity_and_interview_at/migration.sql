-- AlterTable
ALTER TABLE "Application" ADD COLUMN "interviewAt" DATETIME;

-- CreateTable
CREATE TABLE "ApplicationActivity" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "applicationId" TEXT NOT NULL,
    "fromStatus" TEXT,
    "toStatus" TEXT NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "ApplicationActivity_applicationId_fkey" FOREIGN KEY ("applicationId") REFERENCES "Application" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateIndex
CREATE INDEX "ApplicationActivity_applicationId_createdAt_idx" ON "ApplicationActivity"("applicationId", "createdAt");
