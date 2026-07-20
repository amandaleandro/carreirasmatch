-- AlterTable
ALTER TABLE "CompanyVaga" ADD COLUMN "publishedToFeed" BOOLEAN NOT NULL DEFAULT false;
ALTER TABLE "CompanyVaga" ADD COLUMN "feedJobId" TEXT;

-- CreateTable
CREATE TABLE "CompanyJobApplication" (
    "id" TEXT NOT NULL,
    "vagaId" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "message" TEXT NOT NULL DEFAULT '',
    "status" TEXT NOT NULL DEFAULT 'new',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "CompanyJobApplication_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "CompanyJobApplication_vagaId_userId_key" ON "CompanyJobApplication"("vagaId", "userId");

-- CreateIndex
CREATE INDEX "CompanyJobApplication_vagaId_createdAt_idx" ON "CompanyJobApplication"("vagaId", "createdAt");

-- AddForeignKey
ALTER TABLE "CompanyJobApplication" ADD CONSTRAINT "CompanyJobApplication_vagaId_fkey" FOREIGN KEY ("vagaId") REFERENCES "CompanyVaga"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CompanyJobApplication" ADD CONSTRAINT "CompanyJobApplication_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
