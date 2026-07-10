-- CreateTable
CREATE TABLE "SoftSkillTestResult" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "userId" TEXT NOT NULL,
    "answers" TEXT NOT NULL,
    "skillScores" TEXT NOT NULL,
    "personalityType" TEXT NOT NULL,
    "personalityLabel" TEXT NOT NULL,
    "summary" TEXT NOT NULL DEFAULT '',
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "SoftSkillTestResult_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateIndex
CREATE INDEX "SoftSkillTestResult_userId_idx" ON "SoftSkillTestResult"("userId");
