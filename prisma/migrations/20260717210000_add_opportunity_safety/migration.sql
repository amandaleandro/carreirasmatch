ALTER TABLE "PublicOpportunity" ADD COLUMN "riskScore" INTEGER NOT NULL DEFAULT 0;
ALTER TABLE "PublicOpportunity" ADD COLUMN "riskReasons" TEXT NOT NULL DEFAULT '[]';
ALTER TABLE "PublicOpportunity" ADD COLUMN "linkStatus" TEXT NOT NULL DEFAULT 'unknown';
ALTER TABLE "PublicOpportunity" ADD COLUMN "lastCheckedAt" DATETIME;
