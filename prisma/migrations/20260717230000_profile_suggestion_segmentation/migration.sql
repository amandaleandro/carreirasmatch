-- AlterTable
ALTER TABLE "ProfileSuggestion" ADD COLUMN "gapAddressed" TEXT NOT NULL DEFAULT '';
ALTER TABLE "ProfileSuggestion" ADD COLUMN "modality" TEXT NOT NULL DEFAULT '';
ALTER TABLE "ProfileSuggestion" ADD COLUMN "city" TEXT NOT NULL DEFAULT '';
