-- CreateTable
CREATE TABLE "FeatureUsagePeriod" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "periodStart" TIMESTAMP(3) NOT NULL,
    "periodEnd" TIMESTAMP(3) NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "FeatureUsagePeriod_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "FeatureUsageRecord" (
    "id" TEXT NOT NULL,
    "periodId" TEXT NOT NULL,
    "featureKey" TEXT NOT NULL,
    "count" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "FeatureUsageRecord_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "FeatureUsagePeriod_userId_idx" ON "FeatureUsagePeriod"("userId");

-- CreateIndex
CREATE UNIQUE INDEX "FeatureUsagePeriod_userId_periodStart_key" ON "FeatureUsagePeriod"("userId", "periodStart");

-- CreateIndex
CREATE UNIQUE INDEX "FeatureUsageRecord_periodId_featureKey_key" ON "FeatureUsageRecord"("periodId", "featureKey");

-- AddForeignKey
ALTER TABLE "FeatureUsagePeriod" ADD CONSTRAINT "FeatureUsagePeriod_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "FeatureUsageRecord" ADD CONSTRAINT "FeatureUsageRecord_periodId_fkey" FOREIGN KEY ("periodId") REFERENCES "FeatureUsagePeriod"("id") ON DELETE CASCADE ON UPDATE CASCADE;
