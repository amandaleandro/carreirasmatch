-- AlterTable
ALTER TABLE "User" ADD COLUMN "whatsappMarketingOptIn" BOOLEAN NOT NULL DEFAULT false;

-- CreateTable
CREATE TABLE "WhatsappLog" (
    "id" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "dedupeKey" TEXT NOT NULL,
    "phone" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "WhatsappLog_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "WhatsappLog_phone_idx" ON "WhatsappLog"("phone");

-- CreateIndex
CREATE UNIQUE INDEX "WhatsappLog_type_dedupeKey_key" ON "WhatsappLog"("type", "dedupeKey");
