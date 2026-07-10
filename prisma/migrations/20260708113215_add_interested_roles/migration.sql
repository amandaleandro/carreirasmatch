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
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
);
INSERT INTO "new_User" ("careerSegment", "createdAt", "email", "emailVerified", "hasFormalEducation", "id", "image", "name", "passwordHash", "professionalArea") SELECT "careerSegment", "createdAt", "email", "emailVerified", "hasFormalEducation", "id", "image", "name", "passwordHash", "professionalArea" FROM "User";
DROP TABLE "User";
ALTER TABLE "new_User" RENAME TO "User";
CREATE UNIQUE INDEX "User_email_key" ON "User"("email");
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;
