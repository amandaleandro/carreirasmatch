-- CreateTable
CREATE TABLE "RadarItem" (
    "id" TEXT NOT NULL,
    "kind" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "url" TEXT NOT NULL,
    "source" TEXT NOT NULL,
    "summary" TEXT NOT NULL DEFAULT '',
    "publishedAt" TIMESTAMP(3),
    "active" BOOLEAN NOT NULL DEFAULT true,
    "lastSeenAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "RadarItem_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "RadarItem_url_key" ON "RadarItem"("url");

-- CreateIndex
CREATE INDEX "RadarItem_kind_active_publishedAt_idx" ON "RadarItem"("kind", "active", "publishedAt");

-- CreateIndex
CREATE INDEX "RadarItem_source_lastSeenAt_idx" ON "RadarItem"("source", "lastSeenAt");
