-- Split the cash-in fee into VLPAY's cut and our own markup so each is
-- visible separately (was a single blended cashInFeePercent). New total
-- (1.3 + 0.2 = 1.5%) replaces the old flat 2.5%.
ALTER TABLE "GatewayConfig" ADD COLUMN "cashInVlpayFeePercent" DOUBLE PRECISION NOT NULL DEFAULT 1.3;
ALTER TABLE "GatewayConfig" ADD COLUMN "cashInMarkupPercent" DOUBLE PRECISION NOT NULL DEFAULT 0.2;

ALTER TABLE "GatewayConfig" DROP COLUMN "cashInFeePercent";
