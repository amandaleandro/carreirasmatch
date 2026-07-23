-- AlterTable
ALTER TABLE "Job" ADD COLUMN "subarea" TEXT NOT NULL DEFAULT '';

-- AlterTable
ALTER TABLE "PublicOpportunity" ADD COLUMN "subarea" TEXT NOT NULL DEFAULT '';

-- AlterTable
ALTER TABLE "CompanyVaga" ADD COLUMN "subarea" TEXT NOT NULL DEFAULT '';

-- AlterTable
ALTER TABLE "CareerVideo" ADD COLUMN "subarea" TEXT NOT NULL DEFAULT '';
