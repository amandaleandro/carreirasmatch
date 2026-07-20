-- AlterTable
ALTER TABLE "CompanyCandidate" ADD COLUMN "status" TEXT NOT NULL DEFAULT 'none';

-- AlterTable
ALTER TABLE "TalentContactRequest" ADD COLUMN "viewedByCompany" BOOLEAN NOT NULL DEFAULT false;
