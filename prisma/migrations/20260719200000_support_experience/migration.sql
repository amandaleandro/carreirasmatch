ALTER TABLE "SupportTicket"
ADD COLUMN "firstResponseAt" TIMESTAMP(3),
ADD COLUMN "resolvedAt" TIMESTAMP(3),
ADD COLUMN "reopenCount" INTEGER NOT NULL DEFAULT 0;

CREATE TABLE "SupportAttachment" (
    "id" TEXT NOT NULL,
    "messageId" TEXT NOT NULL,
    "fileName" TEXT NOT NULL,
    "mimeType" TEXT NOT NULL,
    "size" INTEGER NOT NULL,
    "data" BYTEA NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "SupportAttachment_pkey" PRIMARY KEY ("id")
);

CREATE INDEX "SupportAttachment_messageId_idx" ON "SupportAttachment"("messageId");

ALTER TABLE "SupportAttachment"
ADD CONSTRAINT "SupportAttachment_messageId_fkey"
FOREIGN KEY ("messageId") REFERENCES "SupportMessage"("id")
ON DELETE CASCADE ON UPDATE CASCADE;
