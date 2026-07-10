-- CreateIndex
CREATE INDEX "Job_active_createdAt_idx" ON "Job"("active", "createdAt");

-- CreateIndex
CREATE INDEX "JobMatch_resumeId_status_fitScore_idx" ON "JobMatch"("resumeId", "status", "fitScore");

-- CreateIndex
CREATE INDEX "JobMatch_jobId_idx" ON "JobMatch"("jobId");
