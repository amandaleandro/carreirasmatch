-- CreateTable
CREATE TABLE "StudyScheduleItem" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "userId" TEXT NOT NULL,
    "areaSlug" TEXT NOT NULL,
    "weekStart" DATETIME NOT NULL,
    "focus" TEXT NOT NULL,
    "task" TEXT NOT NULL,
    "done" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "StudyScheduleItem_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateIndex
CREATE INDEX "StudyScheduleItem_userId_areaSlug_idx" ON "StudyScheduleItem"("userId", "areaSlug");
