ALTER TABLE "Job" ADD COLUMN "company" TEXT NOT NULL DEFAULT '';
ALTER TABLE "Job" ADD COLUMN "area" TEXT NOT NULL DEFAULT '';
ALTER TABLE "Job" ADD COLUMN "seniority" TEXT NOT NULL DEFAULT '';
ALTER TABLE "Job" ADD COLUMN "workModel" TEXT NOT NULL DEFAULT '';
ALTER TABLE "Job" ADD COLUMN "entryLevel" BOOLEAN NOT NULL DEFAULT false;
ALTER TABLE "Job" ADD COLUMN "salaryMin" INTEGER;
ALTER TABLE "Job" ADD COLUMN "expiresAt" DATETIME;

CREATE INDEX "Job_active_entryLevel_createdAt_idx" ON "Job"("active", "entryLevel", "createdAt");
CREATE INDEX "Job_active_area_createdAt_idx" ON "Job"("active", "area", "createdAt");
CREATE INDEX "Job_active_seniority_createdAt_idx" ON "Job"("active", "seniority", "createdAt");
CREATE INDEX "Job_active_workModel_createdAt_idx" ON "Job"("active", "workModel", "createdAt");
