import { randomBytes } from "crypto";

import { CHANNELS } from "./channels";
import { getGatewayConfig } from "./config";
import { prisma } from "./prisma";

export type CreateCashInInput = {
  reference?: unknown;
  channel: unknown;
  amount: unknown;
};

export type CreateCashInResult =
  | { ok: true; cashIn: Awaited<ReturnType<typeof prisma.cashIn.create>> }
  | { ok: false; error: string; status: number };

// Shared by the session-protected dashboard form (POST /api/cash-ins) and the
// API-key-protected public endpoint (POST /api/v1/cash-ins) so a manually
// recorded cash-in goes through the exact same validation and fee logic as
// one reported by an integration. The dashboard form leaves `reference`
// blank (it has no merchant order id to record); the public API requires it.
export async function createCashIn(input: CreateCashInInput): Promise<CreateCashInResult> {
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

  const config = await getGatewayConfig();
  const feePercent = config.cashInVlpayFeePercent + config.cashInMarkupPercent;
  const feePhp = Math.round(grossPhp * (feePercent / 100) * 100) / 100;
  const netCreditPhp = Math.max(grossPhp - feePhp, 0);

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
