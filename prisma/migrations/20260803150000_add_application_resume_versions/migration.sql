CREATE TABLE "ApplicationResumeVersion" (
    "id" TEXT NOT NULL,
    "applicationId" TEXT NOT NULL,
    "analysisId" TEXT,
    "label" TEXT NOT NULL,
    "summary" TEXT NOT NULL DEFAULT '',
    "resumeStructured" TEXT NOT NULL DEFAULT '{}',
    "approvedSuggestions" TEXT NOT NULL DEFAULT '[]',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "ApplicationResumeVersion_pkey" PRIMARY KEY ("id")
);
CREATE INDEX "ApplicationResumeVersion_applicationId_createdAt_idx" ON "ApplicationResumeVersion"("applicationId", "createdAt");
CREATE INDEX "ApplicationResumeVersion_analysisId_idx" ON "ApplicationResumeVersion"("analysisId");
ALTER TABLE "ApplicationResumeVersion" ADD CONSTRAINT "ApplicationResumeVersion_applicationId_fkey" FOREIGN KEY ("applicationId") REFERENCES "Application"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "ApplicationResumeVersion" ADD CONSTRAINT "ApplicationResumeVersion_analysisId_fkey" FOREIGN KEY ("analysisId") REFERENCES "Analysis"("id") ON DELETE SET NULL ON UPDATE CASCADE;
