-- CreateTable
CREATE TABLE "CashIn" (
    "id" SERIAL NOT NULL,
    "reference" TEXT NOT NULL,
    "channel" TEXT NOT NULL,
    "grossPhp" DOUBLE PRECISION NOT NULL,
    "feePhp" DOUBLE PRECISION NOT NULL,
    "netCreditPhp" DOUBLE PRECISION NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'pending',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "CashIn_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "CashOut" (
    "id" SERIAL NOT NULL,
    "recipientName" TEXT NOT NULL,
    "destination" TEXT NOT NULL,
    "bank" TEXT NOT NULL,
    "grossPhp" DOUBLE PRECISION NOT NULL,
    "feePhp" DOUBLE PRECISION NOT NULL,
    "netPhp" DOUBLE PRECISION NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'processing',
    "remark" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "CashOut_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "AccessGrant" (
    "id" SERIAL NOT NULL,
    "email" TEXT NOT NULL,
    "role" TEXT NOT NULL DEFAULT 'view_only',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "AccessGrant_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "GatewayConfig" (
    "id" INTEGER NOT NULL DEFAULT 1,
    "minPerTransactionPhp" DOUBLE PRECISION NOT NULL DEFAULT 100,
    "maxPerTransactionPhp" DOUBLE PRECISION NOT NULL DEFAULT 5000,
    "processingFeePhp" DOUBLE PRECISION NOT NULL DEFAULT 25,
    "cashOutsEnabled" BOOLEAN NOT NULL DEFAULT true,

    CONSTRAINT "GatewayConfig_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "CashIn_reference_key" ON "CashIn"("reference");

-- CreateIndex
CREATE INDEX "CashIn_status_idx" ON "CashIn"("status");

-- CreateIndex
CREATE INDEX "CashIn_createdAt_idx" ON "CashIn"("createdAt");

-- CreateIndex
CREATE INDEX "CashOut_status_idx" ON "CashOut"("status");

-- CreateIndex
CREATE INDEX "CashOut_createdAt_idx" ON "CashOut"("createdAt");

-- CreateIndex
CREATE UNIQUE INDEX "AccessGrant_email_key" ON "AccessGrant"("email");
