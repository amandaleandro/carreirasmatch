-- CreateTable
CREATE TABLE "CompanyMember" (
    "id" TEXT NOT NULL,
    "companyId" TEXT NOT NULL,
    "name" TEXT NOT NULL DEFAULT '',
    "email" TEXT NOT NULL,
    "passwordHash" TEXT NOT NULL,
    "role" TEXT NOT NULL DEFAULT 'member',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "CompanyMember_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "CompanyMember_email_key" ON "CompanyMember"("email");

-- CreateIndex
CREATE INDEX "CompanyMember_companyId_idx" ON "CompanyMember"("companyId");

-- AddForeignKey
ALTER TABLE "CompanyMember" ADD CONSTRAINT "CompanyMember_companyId_fkey" FOREIGN KEY ("companyId") REFERENCES "Company"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- Backfill: cada empresa existente vira um membro "owner" espelhando o login
-- atual (mesmo e-mail e hash de senha), para que os logins continuem funcionando.
INSERT INTO "CompanyMember" ("id", "companyId", "name", "email", "passwordHash", "role", "createdAt", "updatedAt")
SELECT
    md5(random()::text || "id" || clock_timestamp()::text),
    "id",
    "name",
    "email",
    "passwordHash",
    'owner',
    "createdAt",
    CURRENT_TIMESTAMP
FROM "Company"
WHERE "passwordHash" <> '';
