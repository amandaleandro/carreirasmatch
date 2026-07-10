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
    "resumeOverride" TEXT,
    "actionPlanProgress" TEXT NOT NULL DEFAULT '[]',
    "interviewProgress" TEXT NOT NULL DEFAULT '{}',
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "Analysis_resumeId_fkey" FOREIGN KEY ("resumeId") REFERENCES "Resume" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);
INSERT INTO "new_Analysis" ("actionPlanProgress", "alternativeRoles", "applicationStatus", "applicationStatusReason", "applicationStrategy", "atsChecklist", "atsScore", "bridgeRoles", "careerTrack", "createdAt", "currentSummary", "experienceScore", "experienceSuggestions", "feedbackAnalysis", "fixes", "id", "interviewQuestions", "jobText", "jobTitle", "keywordsFound", "keywordsMissing", "overallScore", "pastFeedback", "recruiterMessage", "recruiterObjections", "resumeId", "resumeOverride", "seniorityScore", "strengths", "studyPlan", "suggestedSummary", "talkAboutYourselfAnswer", "technicalScore", "transferableSkills", "transitionNarrative", "weaknesses", "weeklyApplicationPlan", "whyCareerChangeAnswer") SELECT "actionPlanProgress", "alternativeRoles", "applicationStatus", "applicationStatusReason", "applicationStrategy", "atsChecklist", "atsScore", "bridgeRoles", "careerTrack", "createdAt", "currentSummary", "experienceScore", "experienceSuggestions", "feedbackAnalysis", "fixes", "id", "interviewQuestions", "jobText", "jobTitle", "keywordsFound", "keywordsMissing", "overallScore", "pastFeedback", "recruiterMessage", "recruiterObjections", "resumeId", "resumeOverride", "seniorityScore", "strengths", "studyPlan", "suggestedSummary", "talkAboutYourselfAnswer", "technicalScore", "transferableSkills", "transitionNarrative", "weaknesses", "weeklyApplicationPlan", "whyCareerChangeAnswer" FROM "Analysis";
DROP TABLE "Analysis";
ALTER TABLE "new_Analysis" RENAME TO "Analysis";
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;
