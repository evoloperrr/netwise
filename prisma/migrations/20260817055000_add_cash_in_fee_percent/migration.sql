-- Cash-ins charge a percentage of the gross amount (2.5%), separate from
-- the flat processingFeePhp used by cash-outs.
ALTER TABLE "GatewayConfig" ADD COLUMN "cashInFeePercent" DOUBLE PRECISION NOT NULL DEFAULT 2.5;
