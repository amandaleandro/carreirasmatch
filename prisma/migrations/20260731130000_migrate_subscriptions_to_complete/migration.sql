INSERT INTO "Plan" ("id", "key", "name", "priceCents", "recurring", "highlighted", "active", "updatedAt")
VALUES ('commercial-plan-complete', 'complete', 'Completo', 4990, true, false, true, CURRENT_TIMESTAMP)
ON CONFLICT ("key") DO NOTHING;

ALTER TABLE "Subscription" ALTER COLUMN "planKey" SET DEFAULT 'complete';
UPDATE "Subscription" SET "planKey" = 'complete' WHERE "planKey" <> 'complete';
