-- AlterTable
ALTER TABLE "TalentContactRequest" ADD COLUMN "note" TEXT NOT NULL DEFAULT '';

-- AlterTable
ALTER TABLE "TalentContactRequest" ADD COLUMN "interviewAt" TIMESTAMP(3);
