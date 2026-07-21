-- Adiciona o regime de contratação (CLT, PJ, Estagio, Aprendiz, Temporario) às vagas
ALTER TABLE "Job" ADD COLUMN "contractType" TEXT NOT NULL DEFAULT '';

CREATE INDEX "Job_active_contractType_createdAt_idx" ON "Job"("active", "contractType", "createdAt");
