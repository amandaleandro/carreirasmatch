ALTER TABLE "Payment" ADD COLUMN "sessionId" TEXT NOT NULL DEFAULT '';
ALTER TABLE "Payment" ADD COLUMN "source" TEXT NOT NULL DEFAULT '';
ALTER TABLE "Payment" ADD COLUMN "medium" TEXT NOT NULL DEFAULT '';
ALTER TABLE "Payment" ADD COLUMN "campaign" TEXT NOT NULL DEFAULT '';
ALTER TABLE "Payment" ADD COLUMN "content" TEXT NOT NULL DEFAULT '';

ALTER TABLE "Lead" ADD COLUMN "sessionId" TEXT NOT NULL DEFAULT '';
ALTER TABLE "Lead" ADD COLUMN "attributionSource" TEXT NOT NULL DEFAULT '';
ALTER TABLE "Lead" ADD COLUMN "medium" TEXT NOT NULL DEFAULT '';
ALTER TABLE "Lead" ADD COLUMN "campaign" TEXT NOT NULL DEFAULT '';
ALTER TABLE "Lead" ADD COLUMN "content" TEXT NOT NULL DEFAULT '';

CREATE TABLE "FunnelEvent" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "sessionId" TEXT NOT NULL DEFAULT '',
    "userId" TEXT,
    "analysisId" TEXT,
    "paymentId" TEXT,
    "segment" TEXT NOT NULL DEFAULT '',
    "source" TEXT NOT NULL DEFAULT '',
    "medium" TEXT NOT NULL DEFAULT '',
    "campaign" TEXT NOT NULL DEFAULT '',
    "content" TEXT NOT NULL DEFAULT '',
    "path" TEXT NOT NULL DEFAULT '',
    "properties" TEXT NOT NULL DEFAULT '{}',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "FunnelEvent_pkey" PRIMARY KEY ("id")
);

CREATE INDEX "Payment_campaign_createdAt_idx" ON "Payment"("campaign", "createdAt");
CREATE INDEX "FunnelEvent_name_createdAt_idx" ON "FunnelEvent"("name", "createdAt");
CREATE INDEX "FunnelEvent_sessionId_createdAt_idx" ON "FunnelEvent"("sessionId", "createdAt");
CREATE INDEX "FunnelEvent_userId_createdAt_idx" ON "FunnelEvent"("userId", "createdAt");
CREATE INDEX "FunnelEvent_campaign_createdAt_idx" ON "FunnelEvent"("campaign", "createdAt");
CREATE INDEX "FunnelEvent_paymentId_idx" ON "FunnelEvent"("paymentId");
