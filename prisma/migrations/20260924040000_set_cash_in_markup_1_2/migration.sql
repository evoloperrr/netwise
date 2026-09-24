-- Cash-in charge is now 2.5% total: 1.3% VLPAY + 1.2% our markup (was 0.2%).
ALTER TABLE "GatewayConfig" ALTER COLUMN "cashInMarkupPercent" SET DEFAULT 1.2;
UPDATE "GatewayConfig" SET "cashInMarkupPercent" = 1.2 WHERE id = 1;
