-- Tradutor de corporativês (jobDecoded/jobRedFlags) + loop de perguntas de esclarecimento
-- (clarifyingQuestions/clarifyingAnswers/refinedAt) para refinar keywords/scores sem re-análise completa.
ALTER TABLE "Analysis" ADD COLUMN "jobDecoded" TEXT;
ALTER TABLE "Analysis" ADD COLUMN "jobRedFlags" TEXT;
ALTER TABLE "Analysis" ADD COLUMN "clarifyingQuestions" TEXT;
ALTER TABLE "Analysis" ADD COLUMN "clarifyingAnswers" TEXT;
ALTER TABLE "Analysis" ADD COLUMN "refinedAt" TIMESTAMP(3);
