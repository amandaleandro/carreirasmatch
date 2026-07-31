CREATE TABLE "MoodLog" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "mood" TEXT NOT NULL,
    "dayKey" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "MoodLog_pkey" PRIMARY KEY ("id")
);
CREATE UNIQUE INDEX "MoodLog_userId_dayKey_key" ON "MoodLog"("userId", "dayKey");
CREATE INDEX "MoodLog_userId_createdAt_idx" ON "MoodLog"("userId", "createdAt");
ALTER TABLE "MoodLog" ADD CONSTRAINT "MoodLog_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
