CREATE TABLE "ProfessionalEvidence" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "category" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "metrics" TEXT,
    "verifiedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "ProfessionalEvidence_pkey" PRIMARY KEY ("id")
);

CREATE INDEX "ProfessionalEvidence_userId_category_idx" ON "ProfessionalEvidence"("userId", "category");
CREATE INDEX "ProfessionalEvidence_userId_createdAt_idx" ON "ProfessionalEvidence"("userId", "createdAt");

ALTER TABLE "ProfessionalEvidence" ADD CONSTRAINT "ProfessionalEvidence_userId_fkey"
  FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
