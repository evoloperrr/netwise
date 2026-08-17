import { NextResponse } from "next/server";

import { getGatewayConfig } from "@/lib/config";
import { prisma } from "@/lib/prisma";

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

  const cashOut = await prisma.cashOut.create({
    data: {
      recipientName: recipientName.trim(),
      destination: destination.trim(),
      bank: bank.trim(),
      grossPhp,
      feePhp,
      netPhp,
      status: "processing",
    },
  });

  return NextResponse.json({ ok: true, cashOut }, { status: 201 });
}
