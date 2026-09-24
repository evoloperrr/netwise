-- Cash-out fee is now a flat PHP 35 per transaction (was 25).
ALTER TABLE "GatewayConfig" ALTER COLUMN "processingFeePhp" SET DEFAULT 35;
UPDATE "GatewayConfig" SET "processingFeePhp" = 35 WHERE id = 1;
