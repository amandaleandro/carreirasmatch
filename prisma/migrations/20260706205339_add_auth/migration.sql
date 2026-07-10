-- CreateTable
CREATE TABLE "User" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "name" TEXT,
    "email" TEXT,
    "emailVerified" DATETIME,
    "image" TEXT,
    "passwordHash" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- CreateTable
CREATE TABLE "Account" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "userId" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "provider" TEXT NOT NULL,
    "providerAccountId" TEXT NOT NULL,
    "refresh_token" TEXT,
    "access_token" TEXT,
    "expires_at" INTEGER,
    "token_type" TEXT,
    "scope" TEXT,
    "id_token" TEXT,
    "session_state" TEXT,
    CONSTRAINT "Account_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "Session" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "sessionToken" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "expires" DATETIME NOT NULL,
    CONSTRAINT "Session_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "VerificationToken" (
    "identifier" TEXT NOT NULL,
    "token" TEXT NOT NULL,
    "expires" DATETIME NOT NULL
);

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
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "Analysis_resumeId_fkey" FOREIGN KEY ("resumeId") REFERENCES "Resume" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);
INSERT INTO "new_Analysis" ("alternativeRoles", "applicationStatus", "applicationStatusReason", "applicationStrategy", "atsScore", "bridgeRoles", "careerTrack", "createdAt", "experienceScore", "feedbackAnalysis", "fixes", "id", "interviewQuestions", "jobText", "jobTitle", "keywordsFound", "keywordsMissing", "overallScore", "pastFeedback", "recruiterMessage", "recruiterObjections", "resumeId", "seniorityScore", "strengths", "studyPlan", "suggestedSummary", "talkAboutYourselfAnswer", "technicalScore", "transferableSkills", "transitionNarrative", "weaknesses", "weeklyApplicationPlan", "whyCareerChangeAnswer") SELECT "alternativeRoles", "applicationStatus", "applicationStatusReason", "applicationStrategy", "atsScore", "bridgeRoles", "careerTrack", "createdAt", "experienceScore", "feedbackAnalysis", "fixes", "id", "interviewQuestions", "jobText", "jobTitle", "keywordsFound", "keywordsMissing", "overallScore", "pastFeedback", "recruiterMessage", "recruiterObjections", "resumeId", "seniorityScore", "strengths", "studyPlan", "suggestedSummary", "talkAboutYourselfAnswer", "technicalScore", "transferableSkills", "transitionNarrative", "weaknesses", "weeklyApplicationPlan", "whyCareerChangeAnswer" FROM "Analysis";
DROP TABLE "Analysis";
ALTER TABLE "new_Analysis" RENAME TO "Analysis";
CREATE TABLE "new_Resume" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "userId" TEXT,
    "fileName" TEXT NOT NULL,
    "rawText" TEXT NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "Resume_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);
INSERT INTO "new_Resume" ("createdAt", "fileName", "id", "rawText") SELECT "createdAt", "fileName", "id", "rawText" FROM "Resume";
DROP TABLE "Resume";
ALTER TABLE "new_Resume" RENAME TO "Resume";
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;

-- CreateIndex
CREATE UNIQUE INDEX "User_email_key" ON "User"("email");

-- CreateIndex
CREATE UNIQUE INDEX "Account_provider_providerAccountId_key" ON "Account"("provider", "providerAccountId");

-- CreateIndex
CREATE UNIQUE INDEX "Session_sessionToken_key" ON "Session"("sessionToken");

-- CreateIndex
CREATE UNIQUE INDEX "VerificationToken_token_key" ON "VerificationToken"("token");

-- CreateIndex
CREATE UNIQUE INDEX "VerificationToken_identifier_token_key" ON "VerificationToken"("identifier", "token");
