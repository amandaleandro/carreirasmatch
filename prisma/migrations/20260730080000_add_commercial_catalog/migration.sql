ALTER TABLE "Subscription" ADD COLUMN "planKey" TEXT NOT NULL DEFAULT 'pro';

CREATE TABLE "Plan" (
    "id" TEXT NOT NULL,
    "key" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "priceCents" INTEGER NOT NULL,
    "recurring" BOOLEAN NOT NULL DEFAULT true,
    "durationDays" INTEGER,
    "highlighted" BOOLEAN NOT NULL DEFAULT false,
    "active" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    CONSTRAINT "Plan_pkey" PRIMARY KEY ("id")
);
CREATE UNIQUE INDEX "Plan_key_key" ON "Plan"("key");

CREATE TABLE "FeatureDefinition" (
    "id" TEXT NOT NULL,
    "key" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "active" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    CONSTRAINT "FeatureDefinition_pkey" PRIMARY KEY ("id")
);
CREATE UNIQUE INDEX "FeatureDefinition_key_key" ON "FeatureDefinition"("key");

CREATE TABLE "PlanEntitlement" (
    "id" TEXT NOT NULL,
    "planId" TEXT NOT NULL,
    "featureDefinitionId" TEXT NOT NULL,
    "limit" INTEGER,
    "active" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    CONSTRAINT "PlanEntitlement_pkey" PRIMARY KEY ("id")
);
CREATE UNIQUE INDEX "PlanEntitlement_planId_featureDefinitionId_key" ON "PlanEntitlement"("planId", "featureDefinitionId");
CREATE INDEX "PlanEntitlement_featureDefinitionId_idx" ON "PlanEntitlement"("featureDefinitionId");

INSERT INTO "Plan" ("id", "key", "name", "priceCents", "recurring", "highlighted", "active", "updatedAt")
VALUES ('commercial-plan-pro', 'pro', 'Pro', 2990, true, true, true, CURRENT_TIMESTAMP);

ALTER TABLE "Subscription" ADD CONSTRAINT "Subscription_planKey_fkey" FOREIGN KEY ("planKey") REFERENCES "Plan"("key") ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "PlanEntitlement" ADD CONSTRAINT "PlanEntitlement_planId_fkey" FOREIGN KEY ("planId") REFERENCES "Plan"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "PlanEntitlement" ADD CONSTRAINT "PlanEntitlement_featureDefinitionId_fkey" FOREIGN KEY ("featureDefinitionId") REFERENCES "FeatureDefinition"("id") ON DELETE CASCADE ON UPDATE CASCADE;
