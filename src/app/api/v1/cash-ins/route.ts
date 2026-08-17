import { NextResponse } from "next/server";

import { verifyApiKey } from "@/lib/api-auth";
import { getGatewayConfig } from "@/lib/config";
import { prisma } from "@/lib/prisma";

const CHANNELS = ["GCash", "Maya", "GoTyme", "QRPH", "Card"] as const;

// Public API for NetWise's own site/integrations to record a payment
// received through the gateway. Authenticated with the Settings -> API key
// (Authorization: Bearer <key>), not the dashboard's Google session.
export async function POST(request: Request) {
  if (!(await verifyApiKey(request))) {
    return NextResponse.json({ ok: false, error: "Invalid or missing API key." }, { status: 401 });
  }

  const body = await request.json().catch(() => null);
  const { reference, channel, amount } = (body ?? {}) as { reference?: unknown; channel?: unknown; amount?: unknown };

  if (typeof reference !== "string" || reference.trim() === "") {
    return NextResponse.json({ ok: false, error: "reference is required." }, { status: 422 });
  }

  if (typeof channel !== "string" || !CHANNELS.includes(channel as (typeof CHANNELS)[number])) {
    return NextResponse.json({ ok: false, error: `channel must be one of: ${CHANNELS.join(", ")}.` }, { status: 422 });
  }

  const grossPhp = Number(amount);
  if (!Number.isFinite(grossPhp) || grossPhp <= 0) {
    return NextResponse.json({ ok: false, error: "amount must be a positive number." }, { status: 422 });
  }

  const existing = await prisma.cashIn.findUnique({ where: { reference: reference.trim() } });
  if (existing) {
    return NextResponse.json({ ok: false, error: "That reference already exists." }, { status: 409 });
  }

  const config = await getGatewayConfig();
  const feePhp = Math.round(grossPhp * (config.cashInFeePercent / 100) * 100) / 100;
  const netCreditPhp = Math.max(grossPhp - feePhp, 0);

  const cashIn = await prisma.cashIn.create({
    data: {
      reference: reference.trim(),
      channel,
      grossPhp,
      feePhp,
      netCreditPhp,
      status: "pending",
    },
  });

  return NextResponse.json({ ok: true, cashIn }, { status: 201 });
}

// GET /api/v1/cash-ins?reference=... -- check a payment's status.
export async function GET(request: Request) {
  if (!(await verifyApiKey(request))) {
    return NextResponse.json({ ok: false, error: "Invalid or missing API key." }, { status: 401 });
  }

  const reference = new URL(request.url).searchParams.get("reference");
  if (!reference) {
    return NextResponse.json({ ok: false, error: "reference query param is required." }, { status: 422 });
  }

  const cashIn = await prisma.cashIn.findUnique({ where: { reference } });
  if (!cashIn) {
    return NextResponse.json({ ok: false, error: "Not found." }, { status: 404 });
  }

  return NextResponse.json({ ok: true, cashIn });
}
