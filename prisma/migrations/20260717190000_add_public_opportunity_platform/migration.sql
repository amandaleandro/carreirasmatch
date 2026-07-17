CREATE TABLE "OpportunitySource" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "name" TEXT NOT NULL,
    "url" TEXT NOT NULL,
    "kind" TEXT NOT NULL DEFAULT 'job',
    "parser" TEXT NOT NULL DEFAULT 'links',
    "state" TEXT NOT NULL DEFAULT '',
    "city" TEXT NOT NULL DEFAULT '',
    "active" BOOLEAN NOT NULL DEFAULT true,
    "official" BOOLEAN NOT NULL DEFAULT true,
    "lastRunAt" DATETIME,
    "lastSuccessAt" DATETIME,
    "lastError" TEXT NOT NULL DEFAULT '',
    "itemCount" INTEGER NOT NULL DEFAULT 0,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL
);
CREATE UNIQUE INDEX "OpportunitySource_url_key" ON "OpportunitySource"("url");
CREATE INDEX "OpportunitySource_active_kind_idx" ON "OpportunitySource"("active", "kind");
CREATE INDEX "OpportunitySource_state_city_idx" ON "OpportunitySource"("state", "city");

CREATE TABLE "PublicOpportunity" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "sourceId" TEXT NOT NULL,
    "externalKey" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "company" TEXT NOT NULL DEFAULT '',
    "description" TEXT NOT NULL DEFAULT '',
    "url" TEXT NOT NULL,
    "city" TEXT NOT NULL DEFAULT '',
    "state" TEXT NOT NULL DEFAULT '',
    "area" TEXT NOT NULL DEFAULT '',
    "education" TEXT NOT NULL DEFAULT '',
    "experience" TEXT NOT NULL DEFAULT '',
    "salary" TEXT NOT NULL DEFAULT '',
    "quantity" INTEGER,
    "publishedAt" DATETIME,
    "expiresAt" DATETIME,
    "official" BOOLEAN NOT NULL DEFAULT true,
    "active" BOOLEAN NOT NULL DEFAULT true,
    "lastSeenAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "PublicOpportunity_sourceId_fkey" FOREIGN KEY ("sourceId") REFERENCES "OpportunitySource" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);
CREATE UNIQUE INDEX "PublicOpportunity_sourceId_externalKey_key" ON "PublicOpportunity"("sourceId", "externalKey");
CREATE INDEX "PublicOpportunity_active_state_city_idx" ON "PublicOpportunity"("active", "state", "city");
CREATE INDEX "PublicOpportunity_active_area_publishedAt_idx" ON "PublicOpportunity"("active", "area", "publishedAt");
CREATE INDEX "PublicOpportunity_active_expiresAt_idx" ON "PublicOpportunity"("active", "expiresAt");

CREATE TABLE "JobAlert" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "userId" TEXT NOT NULL,
    "query" TEXT NOT NULL DEFAULT '',
    "city" TEXT NOT NULL DEFAULT '',
    "state" TEXT NOT NULL DEFAULT '',
    "frequency" TEXT NOT NULL DEFAULT 'daily',
    "active" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "JobAlert_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);
CREATE INDEX "JobAlert_userId_active_idx" ON "JobAlert"("userId", "active");

CREATE TABLE "OpportunityClick" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "opportunityId" TEXT NOT NULL,
    "sessionId" TEXT NOT NULL DEFAULT '',
    "campaign" TEXT NOT NULL DEFAULT '',
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "OpportunityClick_opportunityId_fkey" FOREIGN KEY ("opportunityId") REFERENCES "PublicOpportunity" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);
CREATE INDEX "OpportunityClick_opportunityId_createdAt_idx" ON "OpportunityClick"("opportunityId", "createdAt");
CREATE INDEX "OpportunityClick_campaign_createdAt_idx" ON "OpportunityClick"("campaign", "createdAt");

CREATE TABLE "OpportunityReport" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "opportunityId" TEXT NOT NULL,
    "userId" TEXT,
    "reason" TEXT NOT NULL,
    "details" TEXT NOT NULL DEFAULT '',
    "status" TEXT NOT NULL DEFAULT 'open',
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "OpportunityReport_opportunityId_fkey" FOREIGN KEY ("opportunityId") REFERENCES "PublicOpportunity" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "OpportunityReport_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);
CREATE INDEX "OpportunityReport_status_createdAt_idx" ON "OpportunityReport"("status", "createdAt");
CREATE INDEX "OpportunityReport_opportunityId_idx" ON "OpportunityReport"("opportunityId");
