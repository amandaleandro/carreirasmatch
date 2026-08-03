ALTER TABLE "Company" ADD COLUMN "planKind" TEXT;
ALTER TABLE "Company" ADD COLUMN "planScreeningsUsed" INTEGER NOT NULL DEFAULT 0;

-- Empresas já ativas no antigo plano único viram "pro" (era a única opção, sem limite até aqui).
UPDATE "Company" SET "planKind" = 'pro' WHERE "planStatus" = 'active';
