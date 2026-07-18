-- CreateTable
CREATE TABLE "TalentContactRequest" (
    "id" TEXT NOT NULL,
    "companyId" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "jobTitle" TEXT NOT NULL DEFAULT '',
    "message" TEXT NOT NULL DEFAULT '',
    "status" TEXT NOT NULL DEFAULT 'pending',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "TalentContactRequest_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "TalentContactRequest_companyId_userId_key" ON "TalentContactRequest"("companyId", "userId");

-- CreateIndex
CREATE INDEX "TalentContactRequest_userId_status_idx" ON "TalentContactRequest"("userId", "status");

-- CreateIndex
CREATE INDEX "TalentContactRequest_companyId_status_idx" ON "TalentContactRequest"("companyId", "status");

-- AddForeignKey
ALTER TABLE "TalentContactRequest" ADD CONSTRAINT "TalentContactRequest_companyId_fkey" FOREIGN KEY ("companyId") REFERENCES "Company"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "TalentContactRequest" ADD CONSTRAINT "TalentContactRequest_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
