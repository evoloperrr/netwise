import { randomBytes } from "crypto";

import { CHANNELS } from "./channels";
import { getGatewayConfig } from "./config";
import { prisma } from "./prisma";
import { createVlpayPayin, type VlpayPayinParams } from "./vlpay";

export type CreateCashInInput = {
  reference?: unknown;
  channel: unknown;
  amount: unknown;
};

export type CreateCashInResult =
  | { ok: true; cashIn: Awaited<ReturnType<typeof prisma.cashIn.create>> }
  | { ok: false; error: string; status: number };

// "dashboard": a merchant recording a cash-in in their own dashboard.
// "api": a payment from the merchant's users (public API / checkout).
export type CashInSource = "dashboard" | "api";

async function computeCashInFee(grossPhp: number, source: CashInSource) {
  const config = await getGatewayConfig();
  const feePercent =
    source === "dashboard" ? config.dashboardCashInFeePercent : config.cashInVlpayFeePercent + config.cashInMarkupPercent;
  const feePhp = Math.round(grossPhp * (feePercent / 100) * 100) / 100;
  return { feePhp, netCreditPhp: Math.max(grossPhp - feePhp, 0) };
}

// Shared by the session-protected dashboard form (POST /api/cash-ins) and the
// API-key-protected public endpoint (POST /api/v1/cash-ins) so a manually
// recorded cash-in goes through the exact same validation and fee logic as
// one reported by an integration. The dashboard form leaves `reference`
// blank (it has no merchant order id to record); the public API requires it.
export async function createCashIn(input: CreateCashInInput, source: CashInSource): Promise<CreateCashInResult> {
  const { channel, amount } = input;

  if (typeof channel !== "string" || !CHANNELS.includes(channel as (typeof CHANNELS)[number])) {
    return { ok: false, error: `channel must be one of: ${CHANNELS.join(", ")}.`, status: 422 };
  }

  const grossPhp = Number(amount);
  if (!Number.isFinite(grossPhp) || grossPhp <= 0) {
    return { ok: false, error: "amount must be a positive number.", status: 422 };
  }

  const reference =
    typeof input.reference === "string" && input.reference.trim() !== ""
      ? input.reference.trim()
      : `NW-CI-${Date.now()}-${randomBytes(3).toString("hex")}`;

  const existing = await prisma.cashIn.findUnique({ where: { reference } });
  if (existing) {
    return { ok: false, error: "That reference already exists.", status: 409 };
  }

  const { feePhp, netCreditPhp } = await computeCashInFee(grossPhp, source);

  const cashIn = await prisma.cashIn.create({
    data: {
      reference,
      channel,
      grossPhp,
      feePhp,
      netCreditPhp,
      status: "pending",
    },
  });

  return { ok: true, cashIn };
}

// Card is deliberately absent: it is not available for checkout yet.
const CHECKOUT_CHANNELS: Record<string, VlpayPayinParams["channel"]> = {
  GCash: "GCASH",
  Maya: "MAYA",
  GoTyme: "GOTYME",
  QRPH: "QRPH",
};

export type CreateCheckoutInput = {
  reference: unknown;
  channel: unknown;
  amount: unknown;
  description?: unknown;
  customer?: unknown;
};

// Creates a pending cash-in and the hosted payment page the customer pays on.
// The record flips to approved/rejected/expired when VLPAY's callback hits
// /api/vlpay/webhook -- unlike POST /api/v1/cash-ins, nobody reconciles by hand.
export async function createCheckout(input: CreateCheckoutInput): Promise<CreateCashInResult> {
  const { reference, channel, amount, description, customer } = input;

  if (typeof reference !== "string" || reference.trim() === "") {
    return { ok: false, error: "reference is required.", status: 422 };
  }

  if (typeof channel !== "string" || !(channel in CHECKOUT_CHANNELS)) {
    return {
      ok: false,
      error: `channel must be one of: ${Object.keys(CHECKOUT_CHANNELS).join(", ")}.`,
      status: 422,
    };
  }

  const grossPhp = Number(amount);
  if (!Number.isFinite(grossPhp) || grossPhp < 1) {
    return { ok: false, error: "amount must be at least 1 (PHP).", status: 422 };
  }

  const trimmedReference = reference.trim();
  const existing = await prisma.cashIn.findUnique({ where: { reference: trimmedReference } });
  if (existing) {
    return { ok: false, error: "That reference already exists.", status: 409 };
  }

  const appUrl = process.env.NEXT_PUBLIC_APP_URL;
  if (!appUrl) {
    return { ok: false, error: "Checkout is not configured (missing callback URL).", status: 503 };
  }

  const customerInfo = (customer && typeof customer === "object" ? customer : {}) as Record<string, unknown>;
  const str = (value: unknown) => (typeof value === "string" && value.trim() !== "" ? value.trim() : undefined);

  let payin;
  try {
    payin = await createVlpayPayin({
      amountCentavos: Math.round(grossPhp * 100),
      type: "QR",
      channel: CHECKOUT_CHANNELS[channel],
      callbackUrl: `${appUrl}/api/vlpay/webhook`,
      referenceId: trimmedReference,
      description: str(description) ?? "NetWise Pay checkout",
      customer: {
        name: str(customerInfo.name),
        lastName: str(customerInfo.lastName),
        email: str(customerInfo.email),
      },
    });
  } catch (cause) {
    return {
      ok: false,
      error: cause instanceof Error ? cause.message : "The payment provider could not be reached.",
      status: 502,
    };
  }

  if (!payin.ok) {
    return { ok: false, error: payin.errorMessage, status: 502 };
  }

  const { feePhp, netCreditPhp } = await computeCashInFee(grossPhp, "api");

  const cashIn = await prisma.cashIn.create({
    data: {
      reference: trimmedReference,
      channel,
      grossPhp,
      feePhp,
      netCreditPhp,
      status: "pending",
      vlpayOrderNo: payin.orderNo,
      checkoutUrl: payin.paymentUrl,
    },
  });

  return { ok: true, cashIn };
}
