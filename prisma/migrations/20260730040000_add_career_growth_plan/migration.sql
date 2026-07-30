-- CreateTable
CREATE TABLE "CareerGrowthPlan" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "currentRole" TEXT NOT NULL,
    "currentSeniority" TEXT NOT NULL DEFAULT '',
    "targetRole" TEXT NOT NULL,
    "competencyGaps" TEXT,
    "developmentActions" TEXT,
    "negotiationTalkingPoints" TEXT,
    "leadershipReadiness" TEXT,
    "generatedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "CareerGrowthPlan_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "CareerGrowthPlan_userId_key" ON "CareerGrowthPlan"("userId");

-- AddForeignKey
ALTER TABLE "CareerGrowthPlan" ADD CONSTRAINT "CareerGrowthPlan_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

