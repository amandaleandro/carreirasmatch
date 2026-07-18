-- AlterTable
ALTER TABLE "Company" ADD COLUMN "screeningCredits" INTEGER NOT NULL DEFAULT 0;

-- CreateTable
CREATE TABLE "CompanyPayment" (
    "id" TEXT NOT NULL,
    "companyId" TEXT NOT NULL,
    "kind" TEXT NOT NULL,
    "credits" INTEGER NOT NULL,
    "amount" INTEGER NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'pending',
    "mpPaymentId" TEXT NOT NULL,
    "paidAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "CompanyPayment_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "CompanyPayment_mpPaymentId_key" ON "CompanyPayment"("mpPaymentId");

-- CreateIndex
CREATE INDEX "CompanyPayment_companyId_idx" ON "CompanyPayment"("companyId");

-- CreateIndex
CREATE INDEX "CompanyPayment_status_idx" ON "CompanyPayment"("status");

-- AddForeignKey
ALTER TABLE "CompanyPayment" ADD CONSTRAINT "CompanyPayment_companyId_fkey" FOREIGN KEY ("companyId") REFERENCES "Company"("id") ON DELETE CASCADE ON UPDATE CASCADE;
