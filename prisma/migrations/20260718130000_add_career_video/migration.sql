-- CreateTable
CREATE TABLE "CareerVideo" (
    "id" TEXT NOT NULL,
    "videoId" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "channel" TEXT NOT NULL,
    "description" TEXT NOT NULL DEFAULT '',
    "thumbnail" TEXT NOT NULL DEFAULT '',
    "area" TEXT NOT NULL,
    "durationSec" INTEGER NOT NULL DEFAULT 0,
    "publishedAt" TIMESTAMP(3),
    "active" BOOLEAN NOT NULL DEFAULT true,
    "source" TEXT NOT NULL DEFAULT 'youtube',
    "lastSeenAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "CareerVideo_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "CareerVideo_videoId_key" ON "CareerVideo"("videoId");

-- CreateIndex
CREATE INDEX "CareerVideo_active_area_idx" ON "CareerVideo"("active", "area");

-- CreateIndex
CREATE INDEX "CareerVideo_source_lastSeenAt_idx" ON "CareerVideo"("source", "lastSeenAt");
