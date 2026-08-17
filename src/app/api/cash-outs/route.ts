import { randomBytes } from "crypto";

import { NextResponse } from "next/server";

import { VLPAY_BANK_INFO } from "@/lib/banks";
import { getGatewayConfig } from "@/lib/config";
import { prisma } from "@/lib/prisma";
import { createVlpayPayout } from "@/lib/vlpay";

// E-wallet payouts use the recipient's mobile number as the account number:
// a leading "0" instead of "63" (see VLPAY API Documentation_v1.pdf).
function normalizeEwalletNumber(raw: string) {
  const digits = raw.replace(/\D/g, "");
  if (digits.startsWith("63")) return `0${digits.slice(2)}`;
  if (digits.startsWith("0")) return digits;
  return `0${digits}`;
}

export async function GET() {
  const cashOuts = await prisma.cashOut.findMany({
    orderBy: { createdAt: "desc" },
    take: 100,
  });

  return NextResponse.json({ ok: true, cashOuts });
}

export async function POST(request: Request) {
  const body = await request.json().catch(() => null);

  if (!body) {
    return NextResponse.json({ ok: false, error: "Invalid JSON body." }, { status: 400 });
  }

  const { amount, bank, destination, recipientName } = body as {
    amount?: unknown;
    bank?: unknown;
    destination?: unknown;
    recipientName?: unknown;
  };

  const grossPhp = Number(amount);
  const config = await getGatewayConfig();

  if (
    !Number.isFinite(grossPhp) ||
    grossPhp < config.minPerTransactionPhp ||
    grossPhp > config.maxPerTransactionPhp
  ) {
    return NextResponse.json(
      {
        ok: false,
        error: `Enter an amount between ₱${config.minPerTransactionPhp} and ₱${config.maxPerTransactionPhp}.`,
      },
      { status: 422 },
    );
  }

  if (
    typeof bank !== "string" ||
    bank.trim() === "" ||
    typeof destination !== "string" ||
    destination.trim() === "" ||
    typeof recipientName !== "string" ||
    recipientName.trim() === ""
  ) {
    return NextResponse.json({ ok: false, error: "Bank, destination, and recipient name are required." }, { status: 422 });
  }

  if (!config.cashOutsEnabled) {
    return NextResponse.json({ ok: false, error: "Cash-outs are currently disabled." }, { status: 503 });
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

  return NextResponse.json({ ok: true, cashOut }, { status: 201 });
}
