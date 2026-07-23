-- Requisitos eliminatórios por triagem (empresa) + flag de eliminação por candidato
ALTER TABLE "CompanyJob" ADD COLUMN "eliminatoryRequirements" TEXT NOT NULL DEFAULT '[]';
ALTER TABLE "CompanyCandidate" ADD COLUMN "eliminated" BOOLEAN NOT NULL DEFAULT false;
ALTER TABLE "CompanyCandidate" ADD COLUMN "eliminationReason" TEXT NOT NULL DEFAULT '';
