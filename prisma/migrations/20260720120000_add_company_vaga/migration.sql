-- CreateTable
CREATE TABLE "CompanyVaga" (
    "id" TEXT NOT NULL,
    "companyId" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "area" TEXT NOT NULL DEFAULT '',
    "state" TEXT NOT NULL DEFAULT '',
    "status" TEXT NOT NULL DEFAULT 'open',
    "matchesJson" TEXT NOT NULL DEFAULT '',
    "lastMatchedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "CompanyVaga_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "CompanyVaga_companyId_createdAt_idx" ON "CompanyVaga"("companyId", "createdAt");

-- AddForeignKey
ALTER TABLE "CompanyVaga" ADD CONSTRAINT "CompanyVaga_companyId_fkey" FOREIGN KEY ("companyId") REFERENCES "Company"("id") ON DELETE CASCADE ON UPDATE CASCADE;
