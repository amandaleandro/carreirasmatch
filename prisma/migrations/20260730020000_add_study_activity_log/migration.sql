-- CreateTable
CREATE TABLE "StudyActivityLog" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "tool" TEXT NOT NULL,
    "score" INTEGER,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "StudyActivityLog_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "StudyActivityLog_userId_createdAt_idx" ON "StudyActivityLog"("userId", "createdAt");

-- AddForeignKey
ALTER TABLE "StudyActivityLog" ADD CONSTRAINT "StudyActivityLog_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
