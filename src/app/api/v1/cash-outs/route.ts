import { NextResponse } from "next/server";

import { verifyApiKey } from "@/lib/api-auth";
import { createCashOut } from "@/lib/cash-outs";
import { prisma } from "@/lib/prisma";

// Public API for NetWise's members website to submit a withdrawal on a
// user's behalf. Authenticated with the Settings -> API key (Authorization:
// Bearer <key>), not the dashboard's Google session. Shares the exact same
// validation/fee/VLPAY-payout logic as the dashboard's own withdrawal form
// (see src/lib/cash-outs.ts) so every withdrawal -- regardless of source --
// lands in this settlement dashboard.
export async function POST(request: Request) {
  if (!(await verifyApiKey(request))) {
    return NextResponse.json({ ok: false, error: "Invalid or missing API key." }, { status: 401 });
  }

  const body = await request.json().catch(() => null);
  if (!body) {
    return NextResponse.json({ ok: false, error: "Invalid JSON body." }, { status: 400 });
  }

  const result = await createCashOut(body);
  if (!result.ok) {
    return NextResponse.json({ ok: false, error: result.error }, { status: result.status });
  }

  return NextResponse.json({ ok: true, cashOut: result.cashOut }, { status: 201 });
}

// GET /api/v1/cash-outs?reference=... -- check a withdrawal's status.
export async function GET(request: Request) {
  if (!(await verifyApiKey(request))) {
    return NextResponse.json({ ok: false, error: "Invalid or missing API key." }, { status: 401 });
  }

  const reference = new URL(request.url).searchParams.get("reference");
  if (!reference) {
    return NextResponse.json({ ok: false, error: "reference query param is required." }, { status: 422 });
  }

  const cashOut = await prisma.cashOut.findUnique({ where: { reference } });
  if (!cashOut) {
    return NextResponse.json({ ok: false, error: "Not found." }, { status: 404 });
  }

  return NextResponse.json({ ok: true, cashOut });
}
