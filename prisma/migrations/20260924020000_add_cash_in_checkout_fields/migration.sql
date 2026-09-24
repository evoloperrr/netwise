-- Checkout-created cash-ins carry VLPAY's pay-in order number and the hosted
-- payment URL the customer is sent to.
ALTER TABLE "CashIn" ADD COLUMN "vlpayOrderNo" TEXT;
ALTER TABLE "CashIn" ADD COLUMN "checkoutUrl" TEXT;
