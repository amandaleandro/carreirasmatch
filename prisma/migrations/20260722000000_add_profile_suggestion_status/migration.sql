-- AlterTable
ALTER TABLE "ProfileSuggestion" ADD COLUMN "status" TEXT NOT NULL DEFAULT 'pending';

-- Remove eventuais duplicatas antes de criar o índice único (mantém a mais recente)
DELETE FROM "ProfileSuggestion" a USING "ProfileSuggestion" b
WHERE a."userId" = b."userId"
  AND a."title" = b."title"
  AND a."provider" = b."provider"
  AND a."createdAt" < b."createdAt";

-- CreateIndex
CREATE UNIQUE INDEX "ProfileSuggestion_userId_title_provider_key" ON "ProfileSuggestion"("userId", "title", "provider");
