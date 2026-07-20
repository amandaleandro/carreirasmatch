-- AlterTable
ALTER TABLE "CompanyVaga" ADD COLUMN "salaryMin" INTEGER;
ALTER TABLE "CompanyVaga" ADD COLUMN "workModel" TEXT NOT NULL DEFAULT '';
ALTER TABLE "CompanyVaga" ADD COLUMN "seniority" TEXT NOT NULL DEFAULT '';
ALTER TABLE "CompanyVaga" ADD COLUMN "jobType" TEXT NOT NULL DEFAULT '';

-- AlterTable
ALTER TABLE "CompanyJobApplication" ADD COLUMN "note" TEXT NOT NULL DEFAULT '';
