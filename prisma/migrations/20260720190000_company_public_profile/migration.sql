-- AlterTable
ALTER TABLE "Company" ADD COLUMN "slug" TEXT;
ALTER TABLE "Company" ADD COLUMN "publicProfile" BOOLEAN NOT NULL DEFAULT false;
ALTER TABLE "Company" ADD COLUMN "description" TEXT NOT NULL DEFAULT '';

-- CreateIndex (slug único; múltiplos NULLs são permitidos no Postgres)
CREATE UNIQUE INDEX "Company_slug_key" ON "Company"("slug");
