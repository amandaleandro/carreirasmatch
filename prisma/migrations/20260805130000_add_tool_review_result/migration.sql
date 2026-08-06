CREATE TABLE "ToolReviewResult" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "input" TEXT NOT NULL,
    "result" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "ToolReviewResult_pkey" PRIMARY KEY ("id")
);

CREATE INDEX "ToolReviewResult_userId_idx" ON "ToolReviewResult"("userId");

CREATE UNIQUE INDEX "ToolReviewResult_userId_type_key" ON "ToolReviewResult"("userId", "type");

ALTER TABLE "ToolReviewResult" ADD CONSTRAINT "ToolReviewResult_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
