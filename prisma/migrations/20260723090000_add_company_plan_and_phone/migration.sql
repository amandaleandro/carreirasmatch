-- AlterTable
ALTER TABLE "Company" ADD COLUMN "phone" TEXT NOT NULL DEFAULT '';
ALTER TABLE "Company" ADD COLUMN "planStatus" TEXT NOT NULL DEFAULT 'inactive';
ALTER TABLE "Company" ADD COLUMN "planCurrentPeriodEnd" TIMESTAMP(3);
