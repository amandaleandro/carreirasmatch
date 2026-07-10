-- Rename abacateBillingId to mpPaymentId (preserves existing data) and drop checkoutUrl
ALTER TABLE "Payment" RENAME COLUMN "abacateBillingId" TO "mpPaymentId";
ALTER TABLE "Payment" DROP COLUMN "checkoutUrl";
