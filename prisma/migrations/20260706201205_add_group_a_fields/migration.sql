/*
  Warnings:

  - Added the required column `alternativeRoles` to the `Analysis` table without a default value. This is not possible if the table is not empty.
  - Added the required column `recruiterMessage` to the `Analysis` table without a default value. This is not possible if the table is not empty.

*/
-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_Analysis" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "resumeId" TEXT NOT NULL,
    "careerTrack" TEXT NOT NULL,
    "jobTitle" TEXT NOT NULL,
    "jobText" TEXT NOT NULL,
    "overallScore" INTEGER NOT NULL,
    "technicalScore" INTEGER NOT NULL,
    "experienceScore" INTEGER NOT NULL,
    "seniorityScore" INTEGER NOT NULL,
    "atsScore" INTEGER NOT NULL,
    "applicationStatus" TEXT NOT NULL,
    "applicationStatusReason" TEXT NOT NULL,
    "keywordsFound" TEXT NOT NULL,
    "keywordsMissing" TEXT NOT NULL,
    "suggestedSummary" TEXT NOT NULL,
    "strengths" TEXT NOT NULL,
    "weaknesses" TEXT NOT NULL,
    "fixes" TEXT NOT NULL,
    "interviewQuestions" TEXT NOT NULL,
    "studyPlan" TEXT NOT NULL,
    "recruiterMessage" TEXT NOT NULL DEFAULT '',
    "alternativeRoles" TEXT NOT NULL DEFAULT '[]',
    "talkAboutYourselfAnswer" TEXT,
    "transferableSkills" TEXT,
    "transitionNarrative" TEXT,
    "whyCareerChangeAnswer" TEXT,
    "bridgeRoles" TEXT,
    "recruiterObjections" TEXT,
    "applicationStrategy" TEXT,
    "weeklyApplicationPlan" TEXT,
    "pastFeedback" TEXT,
    "feedbackAnalysis" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "Analysis_resumeId_fkey" FOREIGN KEY ("resumeId") REFERENCES "Resume" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);
INSERT INTO "new_Analysis" ("applicationStatus", "applicationStatusReason", "atsScore", "bridgeRoles", "careerTrack", "createdAt", "experienceScore", "fixes", "id", "interviewQuestions", "jobText", "jobTitle", "keywordsFound", "keywordsMissing", "overallScore", "resumeId", "seniorityScore", "strengths", "studyPlan", "suggestedSummary", "talkAboutYourselfAnswer", "technicalScore", "transferableSkills", "transitionNarrative", "weaknesses", "whyCareerChangeAnswer") SELECT "applicationStatus", "applicationStatusReason", "atsScore", "bridgeRoles", "careerTrack", "createdAt", "experienceScore", "fixes", "id", "interviewQuestions", "jobText", "jobTitle", "keywordsFound", "keywordsMissing", "overallScore", "resumeId", "seniorityScore", "strengths", "studyPlan", "suggestedSummary", "talkAboutYourselfAnswer", "technicalScore", "transferableSkills", "transitionNarrative", "weaknesses", "whyCareerChangeAnswer" FROM "Analysis";
DROP TABLE "Analysis";
ALTER TABLE "new_Analysis" RENAME TO "Analysis";
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;
