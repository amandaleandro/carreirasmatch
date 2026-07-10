-- CreateTable
CREATE TABLE "VocationTestResult" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "userId" TEXT NOT NULL,
    "areaSlug" TEXT NOT NULL,
    "answers" TEXT NOT NULL,
    "result" TEXT NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "VocationTestResult_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateIndex
CREATE INDEX "VocationTestResult_userId_areaSlug_idx" ON "VocationTestResult"("userId", "areaSlug");

-- RedefineIndex
DROP INDEX "Payment_abacateBillingId_key";
CREATE UNIQUE INDEX "Payment_mpPaymentId_key" ON "Payment"("mpPaymentId");
