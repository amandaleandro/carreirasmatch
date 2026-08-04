ALTER TABLE "Application" ADD COLUMN "outcomeNote" TEXT NOT NULL DEFAULT '';
ALTER TABLE "Application" ADD COLUMN "rejectionReason" TEXT NOT NULL DEFAULT '';
ALTER TABLE "Application" ADD COLUMN "responseAt" TIMESTAMP(3);
