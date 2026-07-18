-- AlterTable
ALTER TABLE "User" ADD COLUMN "discoverable" BOOLEAN NOT NULL DEFAULT false;

-- CreateTable
CREATE TABLE "Company" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "cnpj" TEXT NOT NULL DEFAULT '',
    "email" TEXT NOT NULL,
    "passwordHash" TEXT NOT NULL,
    "logoUrl" TEXT NOT NULL DEFAULT '',
    "city" TEXT NOT NULL DEFAULT '',
    "state" TEXT NOT NULL DEFAULT '',
    "screeningCount" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Company_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "CompanyJob" (
    "id" TEXT NOT NULL,
    "companyId" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "recommendation" TEXT NOT NULL DEFAULT '',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "CompanyJob_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "CompanyCandidate" (
    "id" TEXT NOT NULL,
    "jobId" TEXT NOT NULL,
    "fileName" TEXT NOT NULL,
    "candidateName" TEXT NOT NULL DEFAULT '',
    "rawText" TEXT NOT NULL,
    "fitScore" INTEGER NOT NULL DEFAULT 0,
    "reason" TEXT NOT NULL DEFAULT '',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "CompanyCandidate_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Company_email_key" ON "Company"("email");

-- CreateIndex
CREATE INDEX "Company_email_idx" ON "Company"("email");

-- CreateIndex
CREATE INDEX "CompanyJob_companyId_createdAt_idx" ON "CompanyJob"("companyId", "createdAt");

-- CreateIndex
CREATE INDEX "CompanyCandidate_jobId_fitScore_idx" ON "CompanyCandidate"("jobId", "fitScore");

-- AddForeignKey
ALTER TABLE "CompanyJob" ADD CONSTRAINT "CompanyJob_companyId_fkey" FOREIGN KEY ("companyId") REFERENCES "Company"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CompanyCandidate" ADD CONSTRAINT "CompanyCandidate_jobId_fkey" FOREIGN KEY ("jobId") REFERENCES "CompanyJob"("id") ON DELETE CASCADE ON UPDATE CASCADE;
