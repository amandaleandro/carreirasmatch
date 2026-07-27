ALTER TABLE "FreelanceContract" ADD COLUMN "platformFeeCents" INTEGER NOT NULL DEFAULT 0;
ALTER TABLE "FreelanceContract" ADD COLUMN "freelancerPayoutCents" INTEGER NOT NULL DEFAULT 0;

UPDATE "FreelanceContract"
SET "platformFeeCents" = ROUND("agreedCents" * 0.05)::INTEGER,
    "freelancerPayoutCents" = "agreedCents" - ROUND("agreedCents" * 0.05)::INTEGER
WHERE "platformFeeCents" = 0 AND "agreedCents" > 0;
