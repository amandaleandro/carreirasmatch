-- CreateTable
CREATE TABLE "FreelancerProfile" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "headline" TEXT NOT NULL DEFAULT '',
    "bio" TEXT NOT NULL DEFAULT '',
    "category" TEXT NOT NULL DEFAULT '',
    "skills" TEXT NOT NULL DEFAULT '[]',
    "hourlyRateCents" INTEGER,
    "portfolio" TEXT NOT NULL DEFAULT '[]',
    "available" BOOLEAN NOT NULL DEFAULT true,
    "published" BOOLEAN NOT NULL DEFAULT false,
    "ratingSum" INTEGER NOT NULL DEFAULT 0,
    "ratingCount" INTEGER NOT NULL DEFAULT 0,
    "completedCount" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "FreelancerProfile_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "FreelanceProject" (
    "id" TEXT NOT NULL,
    "clientUserId" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "category" TEXT NOT NULL DEFAULT '',
    "skills" TEXT NOT NULL DEFAULT '[]',
    "budgetType" TEXT NOT NULL DEFAULT 'fixed',
    "budgetMinCents" INTEGER,
    "budgetMaxCents" INTEGER,
    "workModel" TEXT NOT NULL DEFAULT 'remoto',
    "deadline" TIMESTAMP(3),
    "status" TEXT NOT NULL DEFAULT 'open',
    "proposalCount" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "FreelanceProject_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "FreelanceProposal" (
    "id" TEXT NOT NULL,
    "projectId" TEXT NOT NULL,
    "freelancerUserId" TEXT NOT NULL,
    "coverLetter" TEXT NOT NULL,
    "bidCents" INTEGER NOT NULL,
    "estimatedDays" INTEGER,
    "status" TEXT NOT NULL DEFAULT 'pending',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "FreelanceProposal_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "FreelanceContract" (
    "id" TEXT NOT NULL,
    "projectId" TEXT NOT NULL,
    "proposalId" TEXT NOT NULL,
    "clientUserId" TEXT NOT NULL,
    "freelancerUserId" TEXT NOT NULL,
    "agreedCents" INTEGER NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'active',
    "deliveredAt" TIMESTAMP(3),
    "completedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "FreelanceContract_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "FreelanceReview" (
    "id" TEXT NOT NULL,
    "contractId" TEXT NOT NULL,
    "authorUserId" TEXT NOT NULL,
    "targetUserId" TEXT NOT NULL,
    "direction" TEXT NOT NULL,
    "rating" INTEGER NOT NULL,
    "comment" TEXT NOT NULL DEFAULT '',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "FreelanceReview_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "FreelanceThread" (
    "id" TEXT NOT NULL,
    "projectId" TEXT NOT NULL,
    "clientUserId" TEXT NOT NULL,
    "freelancerUserId" TEXT NOT NULL,
    "lastMessageAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "FreelanceThread_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "FreelanceMessage" (
    "id" TEXT NOT NULL,
    "threadId" TEXT NOT NULL,
    "senderUserId" TEXT NOT NULL,
    "body" TEXT NOT NULL,
    "readByClient" BOOLEAN NOT NULL DEFAULT false,
    "readByFreelancer" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "FreelanceMessage_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "FreelancerProfile_userId_key" ON "FreelancerProfile"("userId");
CREATE INDEX "FreelancerProfile_published_available_category_idx" ON "FreelancerProfile"("published", "available", "category");

-- CreateIndex
CREATE INDEX "FreelanceProject_status_createdAt_idx" ON "FreelanceProject"("status", "createdAt");
CREATE INDEX "FreelanceProject_status_category_createdAt_idx" ON "FreelanceProject"("status", "category", "createdAt");
CREATE INDEX "FreelanceProject_clientUserId_createdAt_idx" ON "FreelanceProject"("clientUserId", "createdAt");

-- CreateIndex
CREATE UNIQUE INDEX "FreelanceProposal_projectId_freelancerUserId_key" ON "FreelanceProposal"("projectId", "freelancerUserId");
CREATE INDEX "FreelanceProposal_freelancerUserId_status_idx" ON "FreelanceProposal"("freelancerUserId", "status");
CREATE INDEX "FreelanceProposal_projectId_createdAt_idx" ON "FreelanceProposal"("projectId", "createdAt");

-- CreateIndex
CREATE UNIQUE INDEX "FreelanceContract_projectId_key" ON "FreelanceContract"("projectId");
CREATE UNIQUE INDEX "FreelanceContract_proposalId_key" ON "FreelanceContract"("proposalId");
CREATE INDEX "FreelanceContract_clientUserId_status_idx" ON "FreelanceContract"("clientUserId", "status");
CREATE INDEX "FreelanceContract_freelancerUserId_status_idx" ON "FreelanceContract"("freelancerUserId", "status");

-- CreateIndex
CREATE UNIQUE INDEX "FreelanceReview_contractId_authorUserId_key" ON "FreelanceReview"("contractId", "authorUserId");
CREATE INDEX "FreelanceReview_targetUserId_createdAt_idx" ON "FreelanceReview"("targetUserId", "createdAt");

-- CreateIndex
CREATE UNIQUE INDEX "FreelanceThread_projectId_freelancerUserId_key" ON "FreelanceThread"("projectId", "freelancerUserId");
CREATE INDEX "FreelanceThread_clientUserId_lastMessageAt_idx" ON "FreelanceThread"("clientUserId", "lastMessageAt");
CREATE INDEX "FreelanceThread_freelancerUserId_lastMessageAt_idx" ON "FreelanceThread"("freelancerUserId", "lastMessageAt");

-- CreateIndex
CREATE INDEX "FreelanceMessage_threadId_createdAt_idx" ON "FreelanceMessage"("threadId", "createdAt");

-- AddForeignKey
ALTER TABLE "FreelancerProfile" ADD CONSTRAINT "FreelancerProfile_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "FreelanceProject" ADD CONSTRAINT "FreelanceProject_clientUserId_fkey" FOREIGN KEY ("clientUserId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "FreelanceProposal" ADD CONSTRAINT "FreelanceProposal_projectId_fkey" FOREIGN KEY ("projectId") REFERENCES "FreelanceProject"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "FreelanceProposal" ADD CONSTRAINT "FreelanceProposal_freelancerUserId_fkey" FOREIGN KEY ("freelancerUserId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "FreelanceContract" ADD CONSTRAINT "FreelanceContract_projectId_fkey" FOREIGN KEY ("projectId") REFERENCES "FreelanceProject"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "FreelanceContract" ADD CONSTRAINT "FreelanceContract_proposalId_fkey" FOREIGN KEY ("proposalId") REFERENCES "FreelanceProposal"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "FreelanceContract" ADD CONSTRAINT "FreelanceContract_clientUserId_fkey" FOREIGN KEY ("clientUserId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "FreelanceContract" ADD CONSTRAINT "FreelanceContract_freelancerUserId_fkey" FOREIGN KEY ("freelancerUserId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "FreelanceReview" ADD CONSTRAINT "FreelanceReview_contractId_fkey" FOREIGN KEY ("contractId") REFERENCES "FreelanceContract"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "FreelanceReview" ADD CONSTRAINT "FreelanceReview_authorUserId_fkey" FOREIGN KEY ("authorUserId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "FreelanceReview" ADD CONSTRAINT "FreelanceReview_targetUserId_fkey" FOREIGN KEY ("targetUserId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "FreelanceThread" ADD CONSTRAINT "FreelanceThread_projectId_fkey" FOREIGN KEY ("projectId") REFERENCES "FreelanceProject"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "FreelanceThread" ADD CONSTRAINT "FreelanceThread_clientUserId_fkey" FOREIGN KEY ("clientUserId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "FreelanceThread" ADD CONSTRAINT "FreelanceThread_freelancerUserId_fkey" FOREIGN KEY ("freelancerUserId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "FreelanceMessage" ADD CONSTRAINT "FreelanceMessage_threadId_fkey" FOREIGN KEY ("threadId") REFERENCES "FreelanceThread"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "FreelanceMessage" ADD CONSTRAINT "FreelanceMessage_senderUserId_fkey" FOREIGN KEY ("senderUserId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
