-- Merchant cash-ins recorded from the dashboard are charged 1.5%; payments
-- from the merchant's users (API/checkout) stay on the 2.5% split rate.
ALTER TABLE "GatewayConfig" ADD COLUMN "dashboardCashInFeePercent" DOUBLE PRECISION NOT NULL DEFAULT 1.5;
