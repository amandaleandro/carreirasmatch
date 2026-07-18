-- AlterTable
ALTER TABLE "User" ADD COLUMN "signupCouponId" TEXT;

-- AlterTable
ALTER TABLE "Coupon" ADD COLUMN "ownerUserId" TEXT;

-- CreateIndex
CREATE INDEX "User_signupCouponId_idx" ON "User"("signupCouponId");

-- CreateIndex
CREATE UNIQUE INDEX "Coupon_ownerUserId_key" ON "Coupon"("ownerUserId");

-- AddForeignKey
ALTER TABLE "User" ADD CONSTRAINT "User_signupCouponId_fkey" FOREIGN KEY ("signupCouponId") REFERENCES "Coupon"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Coupon" ADD CONSTRAINT "Coupon_ownerUserId_fkey" FOREIGN KEY ("ownerUserId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;
