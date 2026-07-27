ALTER TABLE "FreelancerProfile" ADD COLUMN "pixKey" TEXT NOT NULL DEFAULT '';
ALTER TABLE "FreelanceContract" ADD COLUMN "paymentStatus" TEXT NOT NULL DEFAULT 'pending';
ALTER TABLE "FreelanceContract" ADD COLUMN "mpPaymentId" TEXT;
ALTER TABLE "FreelanceContract" ADD COLUMN "paymentPaidAt" TIMESTAMP(3);
ALTER TABLE "FreelanceContract" ADD COLUMN "freelancerConfirmedAt" TIMESTAMP(3);
ALTER TABLE "FreelanceContract" ADD COLUMN "clientConfirmedAt" TIMESTAMP(3);
ALTER TABLE "FreelanceContract" ADD COLUMN "payoutStatus" TEXT NOT NULL DEFAULT 'waiting';
ALTER TABLE "FreelanceContract" ADD COLUMN "payoutReleasedAt" TIMESTAMP(3);
CREATE UNIQUE INDEX "FreelanceContract_mpPaymentId_key" ON "FreelanceContract"("mpPaymentId");
