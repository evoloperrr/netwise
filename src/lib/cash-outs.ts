import { randomBytes } from "crypto";

import { VLPAY_BANK_INFO } from "./banks";
import { getGatewayConfig } from "./config";
import { prisma } from "./prisma";
import { createVlpayPayout } from "./vlpay";

// E-wallet payouts use the recipient's mobile number as the account number:
// a leading "0" instead of "63" (see VLPAY API Documentation_v1.pdf).
function normalizeEwalletNumber(raw: string) {
  const digits = raw.replace(/\D/g, "");
  if (digits.startsWith("63")) return `0${digits.slice(2)}`;
  if (digits.startsWith("0")) return digits;
  return `0${digits}`;
}

export type CreateCashOutInput = {
  amount: unknown;
  bank: unknown;
  destination: unknown;
  recipientName: unknown;
};

export type CreateCashOutResult =
  | { ok: true; cashOut: Awaited<ReturnType<typeof prisma.cashOut.create>> }
  | { ok: false; error: string; status: number };

// Shared by the session-protected dashboard form (POST /api/cash-outs) and
// the API-key-protected public endpoint (POST /api/v1/cash-outs) so a
// members-website-initiated withdrawal goes through the exact same
// validation, fee, and VLPAY payout logic as one submitted from the
// dashboard itself.
export async function createCashOut(input: CreateCashOutInput): Promise<CreateCashOutResult> {
  const { amount, bank, destination, recipientName } = input;

  const grossPhp = Number(amount);
  const config = await getGatewayConfig();

  if (!Number.isFinite(grossPhp) || grossPhp < config.minPerTransactionPhp || grossPhp > config.maxPerTransactionPhp) {
    return {
      ok: false,
      error: `Enter an amount between ₱${config.minPerTransactionPhp} and ₱${config.maxPerTransactionPhp}.`,
      status: 422,
    };
  }

  if (
    typeof bank !== "string" ||
    bank.trim() === "" ||
    typeof destination !== "string" ||
    destination.trim() === "" ||
    typeof recipientName !== "string" ||
    recipientName.trim() === ""
  ) {
    return { ok: false, error: "Bank, destination, and recipient name are required.", status: 422 };
  }

  if (!config.cashOutsEnabled) {
    return { ok: false, error: "Cash-outs are currently disabled.", status: 503 };
  }

  const feePhp = config.processingFeePhp;
  const netPhp = Math.max(grossPhp - feePhp, 0);
  const reference = `NW-${Date.now()}-${randomBytes(3).toString("hex")}`;
  const trimmedBank = bank.trim();
  const trimmedDestination = destination.trim();

  const bankInfo = VLPAY_BANK_INFO[trimmedBank];
  const appUrl = process.env.NEXT_PUBLIC_APP_URL;

  let status = "processing";
  let remark: string | null = null;
  let vlpayOrderNo: string | null = null;

  if (!bankInfo || !appUrl) {
    status = "rejected";
    remark = !bankInfo ? `No VLPAY bank mapping for "${trimmedBank}".` : "Missing NEXT_PUBLIC_APP_URL for the VLPAY callback.";
  } else {
    try {
      const result = await createVlpayPayout({
        amountCentavos: Math.round(netPhp * 100),
        accountNumber: bankInfo.isEwallet ? normalizeEwalletNumber(trimmedDestination) : trimmedDestination,
        bankCode: bankInfo.bankCode,
        bankName: bankInfo.bankName,
        recipientName: recipientName.trim(),
        callbackUrl: `${appUrl}/api/vlpay/webhook`,
        referenceId: reference,
        description: "NetWise Pay withdrawal",
      });

      if (result.ok) {
        vlpayOrderNo = result.orderNo;
      } else {
        status = "rejected";
        remark = result.errorMessage;
      }
    } catch (cause) {
      status = "rejected";
      remark = cause instanceof Error ? cause.message : "VLPAY payout request failed.";
    }
  }

  const cashOut = await prisma.cashOut.create({
    data: {
      reference,
      recipientName: recipientName.trim(),
      destination: trimmedDestination,
      bank: trimmedBank,
      grossPhp,
      feePhp,
      netPhp,
      status,
      remark,
      vlpayOrderNo,
    },
  });

  return { ok: true, cashOut };
}
