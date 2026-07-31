-- CreateTable
CREATE TABLE "FeatureUsageReservation" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "periodId" TEXT NOT NULL,
    "featureKey" TEXT NOT NULL,
    "idempotencyKey" TEXT NOT NULL,
    "quantity" INTEGER NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'reserved',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    CONSTRAINT "FeatureUsageReservation_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX "FeatureUsageReservation_userId_idempotencyKey_key" ON "FeatureUsageReservation"("userId", "idempotencyKey");
CREATE INDEX "FeatureUsageReservation_periodId_featureKey_status_idx" ON "FeatureUsageReservation"("periodId", "featureKey", "status");
CREATE INDEX "FeatureUsageReservation_userId_featureKey_status_idx" ON "FeatureUsageReservation"("userId", "featureKey", "status");

ALTER TABLE "FeatureUsageReservation" ADD CONSTRAINT "FeatureUsageReservation_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "FeatureUsageReservation" ADD CONSTRAINT "FeatureUsageReservation_periodId_fkey" FOREIGN KEY ("periodId") REFERENCES "FeatureUsagePeriod"("id") ON DELETE CASCADE ON UPDATE CASCADE;
