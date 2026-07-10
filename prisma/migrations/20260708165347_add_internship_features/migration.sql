-- AlterTable
ALTER TABLE "Application" ADD COLUMN "deadline" DATETIME;

-- CreateTable
CREATE TABLE "ClassScheduleItem" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "userId" TEXT NOT NULL,
    "dayOfWeek" INTEGER NOT NULL,
    "startTime" TEXT NOT NULL,
    "endTime" TEXT NOT NULL,
    "subject" TEXT NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "ClassScheduleItem_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_User" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "name" TEXT,
    "email" TEXT,
    "emailVerified" DATETIME,
    "image" TEXT,
    "passwordHash" TEXT,
    "careerSegment" TEXT,
    "professionalArea" TEXT,
    "hasFormalEducation" BOOLEAN,
    "interestedRoles" TEXT NOT NULL DEFAULT '[]',
    "themePreference" TEXT NOT NULL DEFAULT 'system',
    "internshipChecklistProgress" TEXT NOT NULL DEFAULT '[]',
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
);
INSERT INTO "new_User" ("careerSegment", "createdAt", "email", "emailVerified", "hasFormalEducation", "id", "image", "interestedRoles", "name", "passwordHash", "professionalArea", "themePreference") SELECT "careerSegment", "createdAt", "email", "emailVerified", "hasFormalEducation", "id", "image", "interestedRoles", "name", "passwordHash", "professionalArea", "themePreference" FROM "User";
DROP TABLE "User";
ALTER TABLE "new_User" RENAME TO "User";
CREATE UNIQUE INDEX "User_email_key" ON "User"("email");
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;

-- CreateIndex
CREATE INDEX "ClassScheduleItem_userId_idx" ON "ClassScheduleItem"("userId");
