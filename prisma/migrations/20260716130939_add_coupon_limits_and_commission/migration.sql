-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_Coupon" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "code" TEXT NOT NULL,
    "influencerName" TEXT NOT NULL,
    "active" BOOLEAN NOT NULL DEFAULT true,
    "discountType" TEXT NOT NULL DEFAULT 'fixed',
    "oneOffDiscountCents" INTEGER NOT NULL DEFAULT 200,
    "subscriptionDiscountCents" INTEGER NOT NULL DEFAULT 400,
    "oneOffDiscountPercent" INTEGER NOT NULL DEFAULT 0,
    "subscriptionDiscountPercent" INTEGER NOT NULL DEFAULT 0,
    "commissionPercent" INTEGER NOT NULL DEFAULT 0,
    "expiresAt" DATETIME,
    "maxRedemptions" INTEGER,
    "usageCount" INTEGER NOT NULL DEFAULT 0,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL
);
INSERT INTO "new_Coupon" ("active", "code", "createdAt", "id", "influencerName", "oneOffDiscountCents", "subscriptionDiscountCents", "updatedAt", "usageCount") SELECT "active", "code", "createdAt", "id", "influencerName", "oneOffDiscountCents", "subscriptionDiscountCents", "updatedAt", "usageCount" FROM "Coupon";
DROP TABLE "Coupon";
ALTER TABLE "new_Coupon" RENAME TO "Coupon";
CREATE UNIQUE INDEX "Coupon_code_key" ON "Coupon"("code");
CREATE INDEX "Coupon_active_idx" ON "Coupon"("active");
CREATE TABLE "new_Payment" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "userId" TEXT NOT NULL,
    "kind" TEXT NOT NULL,
    "segment" TEXT NOT NULL,
    "amount" INTEGER NOT NULL,
    "discountCents" INTEGER NOT NULL DEFAULT 0,
    "status" TEXT NOT NULL DEFAULT 'pending',
    "mpPaymentId" TEXT NOT NULL,
    "analysisId" TEXT,
    "couponId" TEXT,
    "paidAt" DATETIME,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "Payment_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "Payment_analysisId_fkey" FOREIGN KEY ("analysisId") REFERENCES "Analysis" ("id") ON DELETE SET NULL ON UPDATE CASCADE,
    CONSTRAINT "Payment_couponId_fkey" FOREIGN KEY ("couponId") REFERENCES "Coupon" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);
INSERT INTO "new_Payment" ("amount", "analysisId", "couponId", "createdAt", "id", "kind", "mpPaymentId", "paidAt", "segment", "status", "updatedAt", "userId") SELECT "amount", "analysisId", "couponId", "createdAt", "id", "kind", "mpPaymentId", "paidAt", "segment", "status", "updatedAt", "userId" FROM "Payment";
DROP TABLE "Payment";
ALTER TABLE "new_Payment" RENAME TO "Payment";
CREATE UNIQUE INDEX "Payment_mpPaymentId_key" ON "Payment"("mpPaymentId");
CREATE INDEX "Payment_userId_idx" ON "Payment"("userId");
CREATE INDEX "Payment_status_idx" ON "Payment"("status");
CREATE INDEX "Payment_analysisId_idx" ON "Payment"("analysisId");
CREATE INDEX "Payment_couponId_idx" ON "Payment"("couponId");
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;
