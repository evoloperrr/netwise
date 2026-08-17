-- Add a merchant reference (sent to VLPAY as metadata.referenceId) and VLPAY's
-- own order number to CashOut, backfilling any existing rows before the
-- reference column is made required/unique.
ALTER TABLE "CashOut" ADD COLUMN "reference" TEXT;
ALTER TABLE "CashOut" ADD COLUMN "vlpayOrderNo" TEXT;

UPDATE "CashOut"
SET "reference" = 'NW-' || "id" || '-' || floor(extract(epoch from "createdAt"))::text
WHERE "reference" IS NULL;

ALTER TABLE "CashOut" ALTER COLUMN "reference" SET NOT NULL;

CREATE UNIQUE INDEX "CashOut_reference_key" ON "CashOut"("reference");
