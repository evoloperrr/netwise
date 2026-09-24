import { NextResponse } from "next/server";

import { verifyApiKey } from "@/lib/api-auth";
import { createCheckout } from "@/lib/cash-ins";
import { toPublicCashIn } from "@/lib/public-api";

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

  const { id, ...checkout } = toPublicCashIn(result.cashIn);
  return NextResponse.json({ ok: true, checkout }, { status: 201 });
}
