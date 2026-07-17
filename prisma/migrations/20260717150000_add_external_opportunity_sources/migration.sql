CREATE TABLE "ExternalCourse" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "title" TEXT NOT NULL,
    "provider" TEXT NOT NULL,
    "url" TEXT NOT NULL,
    "area" TEXT NOT NULL,
    "city" TEXT NOT NULL DEFAULT '',
    "state" TEXT NOT NULL DEFAULT '',
    "modality" TEXT NOT NULL DEFAULT 'online',
    "free" BOOLEAN NOT NULL DEFAULT true,
    "certificate" BOOLEAN NOT NULL DEFAULT false,
    "active" BOOLEAN NOT NULL DEFAULT true,
    "source" TEXT NOT NULL,
    "lastSeenAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL
);
CREATE UNIQUE INDEX "ExternalCourse_url_key" ON "ExternalCourse"("url");
CREATE INDEX "ExternalCourse_active_area_idx" ON "ExternalCourse"("active", "area");
CREATE INDEX "ExternalCourse_state_city_idx" ON "ExternalCourse"("state", "city");
CREATE INDEX "ExternalCourse_source_lastSeenAt_idx" ON "ExternalCourse"("source", "lastSeenAt");

CREATE TABLE "PublicJobBulletin" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "title" TEXT NOT NULL,
    "url" TEXT NOT NULL,
    "source" TEXT NOT NULL,
    "city" TEXT NOT NULL,
    "state" TEXT NOT NULL,
    "publishedAt" DATETIME,
    "active" BOOLEAN NOT NULL DEFAULT true,
    "lastSeenAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL
);
CREATE UNIQUE INDEX "PublicJobBulletin_url_key" ON "PublicJobBulletin"("url");
CREATE INDEX "PublicJobBulletin_active_state_city_idx" ON "PublicJobBulletin"("active", "state", "city");
CREATE INDEX "PublicJobBulletin_source_publishedAt_idx" ON "PublicJobBulletin"("source", "publishedAt");

CREATE TABLE "SourceSync" (
    "key" TEXT NOT NULL PRIMARY KEY,
    "label" TEXT NOT NULL,
    "kind" TEXT NOT NULL,
    "active" BOOLEAN NOT NULL DEFAULT true,
    "lastRunAt" DATETIME,
    "lastSuccessAt" DATETIME,
    "itemCount" INTEGER NOT NULL DEFAULT 0,
    "lastError" TEXT NOT NULL DEFAULT '',
    "updatedAt" DATETIME NOT NULL
);
