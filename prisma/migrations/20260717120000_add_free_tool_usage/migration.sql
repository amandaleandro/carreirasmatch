CREATE TABLE "FreeToolUsage" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "userId" TEXT NOT NULL,
    "tool" TEXT NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "FreeToolUsage_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

CREATE UNIQUE INDEX "FreeToolUsage_userId_tool_key" ON "FreeToolUsage"("userId", "tool");
CREATE INDEX "FreeToolUsage_createdAt_idx" ON "FreeToolUsage"("createdAt");
