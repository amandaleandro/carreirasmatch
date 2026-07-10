/*
  Warnings:

  - Added the required column `applicationStatus` to the `Analysis` table without a default value. This is not possible if the table is not empty.
  - Added the required column `applicationStatusReason` to the `Analysis` table without a default value. This is not possible if the table is not empty.
  - Added the required column `keywordsFound` to the `Analysis` table without a default value. This is not possible if the table is not empty.
  - Added the required column `keywordsMissing` to the `Analysis` table without a default value. This is not possible if the table is not empty.

*/
-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_Analysis" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "resumeId" TEXT NOT NULL,
    "jobTitle" TEXT NOT NULL,
    "jobText" TEXT NOT NULL,
    "overallScore" INTEGER NOT NULL,
    "technicalScore" INTEGER NOT NULL,
    "experienceScore" INTEGER NOT NULL,
    "seniorityScore" INTEGER NOT NULL,
    "atsScore" INTEGER NOT NULL,
    "applicationStatus" TEXT NOT NULL DEFAULT 'adjust_first',
    "applicationStatusReason" TEXT NOT NULL DEFAULT '',
    "keywordsFound" TEXT NOT NULL DEFAULT '[]',
    "keywordsMissing" TEXT NOT NULL DEFAULT '[]',
    "strengths" TEXT NOT NULL,
    "weaknesses" TEXT NOT NULL,
    "fixes" TEXT NOT NULL,
    "interviewQuestions" TEXT NOT NULL,
    "studyPlan" TEXT NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "Analysis_resumeId_fkey" FOREIGN KEY ("resumeId") REFERENCES "Resume" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);
INSERT INTO "new_Analysis" ("atsScore", "createdAt", "experienceScore", "fixes", "id", "interviewQuestions", "jobText", "jobTitle", "overallScore", "resumeId", "seniorityScore", "strengths", "studyPlan", "technicalScore", "weaknesses") SELECT "atsScore", "createdAt", "experienceScore", "fixes", "id", "interviewQuestions", "jobText", "jobTitle", "overallScore", "resumeId", "seniorityScore", "strengths", "studyPlan", "technicalScore", "weaknesses" FROM "Analysis";
DROP TABLE "Analysis";
ALTER TABLE "new_Analysis" RENAME TO "Analysis";
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;
