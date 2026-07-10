-- CreateTable
CREATE TABLE "Lead" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "name" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "phone" TEXT NOT NULL,
    "source" TEXT NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_Analysis" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "resumeId" TEXT NOT NULL,
    "leadId" TEXT,
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
    "recruiterMessage" TEXT NOT NULL,
    "alternativeRoles" TEXT NOT NULL,
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
    "experienceSuggestions" TEXT NOT NULL DEFAULT '[]',
    "atsChecklist" TEXT NOT NULL DEFAULT '[]',
    "currentSummary" TEXT NOT NULL DEFAULT '',
    "resumeStructured" TEXT NOT NULL DEFAULT '{}',
    "resumeOverride" TEXT,
    "actionPlanProgress" TEXT NOT NULL DEFAULT '[]',
    "interviewProgress" TEXT NOT NULL DEFAULT '{}',
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "Analysis_resumeId_fkey" FOREIGN KEY ("resumeId") REFERENCES "Resume" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "Analysis_leadId_fkey" FOREIGN KEY ("leadId") REFERENCES "Lead" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);
INSERT INTO "new_Analysis" ("actionPlanProgress", "alternativeRoles", "applicationStatus", "applicationStatusReason", "applicationStrategy", "atsChecklist", "atsScore", "bridgeRoles", "careerTrack", "createdAt", "currentSummary", "experienceScore", "experienceSuggestions", "feedbackAnalysis", "fixes", "id", "interviewProgress", "interviewQuestions", "jobText", "jobTitle", "keywordsFound", "keywordsMissing", "overallScore", "pastFeedback", "recruiterMessage", "recruiterObjections", "resumeId", "resumeOverride", "resumeStructured", "seniorityScore", "strengths", "studyPlan", "suggestedSummary", "talkAboutYourselfAnswer", "technicalScore", "transferableSkills", "transitionNarrative", "weaknesses", "weeklyApplicationPlan", "whyCareerChangeAnswer") SELECT "actionPlanProgress", "alternativeRoles", "applicationStatus", "applicationStatusReason", "applicationStrategy", "atsChecklist", "atsScore", "bridgeRoles", "careerTrack", "createdAt", "currentSummary", "experienceScore", "experienceSuggestions", "feedbackAnalysis", "fixes", "id", "interviewProgress", "interviewQuestions", "jobText", "jobTitle", "keywordsFound", "keywordsMissing", "overallScore", "pastFeedback", "recruiterMessage", "recruiterObjections", "resumeId", "resumeOverride", "resumeStructured", "seniorityScore", "strengths", "studyPlan", "suggestedSummary", "talkAboutYourselfAnswer", "technicalScore", "transferableSkills", "transitionNarrative", "weaknesses", "weeklyApplicationPlan", "whyCareerChangeAnswer" FROM "Analysis";
DROP TABLE "Analysis";
ALTER TABLE "new_Analysis" RENAME TO "Analysis";
CREATE TABLE "new_VocationTestResult" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "userId" TEXT,
    "leadId" TEXT,
    "areaSlug" TEXT NOT NULL,
    "answers" TEXT NOT NULL,
    "result" TEXT NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "VocationTestResult_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "VocationTestResult_leadId_fkey" FOREIGN KEY ("leadId") REFERENCES "Lead" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);
INSERT INTO "new_VocationTestResult" ("answers", "areaSlug", "createdAt", "id", "result", "userId") SELECT "answers", "areaSlug", "createdAt", "id", "result", "userId" FROM "VocationTestResult";
DROP TABLE "VocationTestResult";
ALTER TABLE "new_VocationTestResult" RENAME TO "VocationTestResult";
CREATE INDEX "VocationTestResult_userId_areaSlug_idx" ON "VocationTestResult"("userId", "areaSlug");
CREATE INDEX "VocationTestResult_leadId_idx" ON "VocationTestResult"("leadId");
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;

-- CreateIndex
CREATE INDEX "Lead_email_idx" ON "Lead"("email");
