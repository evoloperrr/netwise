import { NextResponse } from "next/server";

import { verifyApiKey } from "@/lib/api-auth";
import { createCheckout } from "@/lib/cash-ins";

// Public API: start a hosted checkout for a customer. Returns a checkoutUrl to
// redirect the customer to; poll GET /api/v1/cash-ins?reference=... for the
// outcome. Authenticated with the Settings -> API key, not a dashboard session.
export async function POST(request: Request) {
  if (!(await verifyApiKey(request))) {
    return NextResponse.json({ ok: false, error: "Invalid or missing API key." }, { status: 401 });
  }

  const body = await request.json().catch(() => null);
  if (!body || typeof body !== "object") {
    return NextResponse.json({ ok: false, error: "Invalid JSON body." }, { status: 400 });
  }

  const result = await createCheckout(body);
  if (!result.ok) {
    return NextResponse.json({ ok: false, error: result.error }, { status: result.status });
  }

  const { reference, channel, grossPhp, feePhp, netCreditPhp, status, checkoutUrl, createdAt } = result.cashIn;
  return NextResponse.json(
    { ok: true, checkout: { reference, channel, grossPhp, feePhp, netCreditPhp, status, checkoutUrl, createdAt } },
    { status: 201 },
  );
}
