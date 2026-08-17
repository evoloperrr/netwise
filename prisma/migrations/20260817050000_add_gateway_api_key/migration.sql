-- Add a live API key to the singleton GatewayConfig row, backfilling any
-- existing row before the column is made required.
CREATE EXTENSION IF NOT EXISTS pgcrypto;

ALTER TABLE "GatewayConfig" ADD COLUMN "apiKey" TEXT;

UPDATE "GatewayConfig"
SET "apiKey" = 'nw_live_' || encode(gen_random_bytes(24), 'hex')
WHERE "apiKey" IS NULL;

ALTER TABLE "GatewayConfig" ALTER COLUMN "apiKey" SET NOT NULL;

CREATE UNIQUE INDEX "GatewayConfig_apiKey_key" ON "GatewayConfig"("apiKey");
