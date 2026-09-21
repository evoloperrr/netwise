import { NextResponse } from "next/server";

import { verifyApiKey } from "@/lib/api-auth";
import { createCashIn } from "@/lib/cash-ins";
import { prisma } from "@/lib/prisma";

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

  const result = await createCashIn({ reference, channel, amount });
  if (!result.ok) {
    return NextResponse.json({ ok: false, error: result.error }, { status: result.status });
  }

  return NextResponse.json({ ok: true, cashIn: result.cashIn }, { status: 201 });
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
