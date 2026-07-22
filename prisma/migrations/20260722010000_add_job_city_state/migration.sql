-- AlterTable
ALTER TABLE "Job" ADD COLUMN "city" TEXT NOT NULL DEFAULT '';
ALTER TABLE "Job" ADD COLUMN "state" TEXT NOT NULL DEFAULT '';

-- CreateIndex
CREATE INDEX "Job_state_city_idx" ON "Job"("state", "city");

-- CreateIndex
CREATE INDEX "Job_active_state_createdAt_idx" ON "Job"("active", "state", "createdAt");
