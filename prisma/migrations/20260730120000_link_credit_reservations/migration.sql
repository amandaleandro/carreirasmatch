ALTER TABLE "FeatureUsageReservation" ADD COLUMN "creditTransactionId" TEXT;
CREATE INDEX "FeatureUsageReservation_creditTransactionId_idx" ON "FeatureUsageReservation"("creditTransactionId");
