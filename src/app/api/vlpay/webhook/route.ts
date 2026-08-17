import { NextResponse } from "next/server";

import { prisma } from "@/lib/prisma";

// Per VLPAY API Documentation_v1.pdf: "Please ensure you whitelist our IP for
// security purposes to ensure callback being sent from us."
const VLPAY_WEBHOOK_IPS = ["54.169.119.37", "47.130.172.204"];

function getClientIp(request: Request) {
  const forwardedFor = request.headers.get("x-forwarded-for");
  return forwardedFor?.split(",")[0]?.trim() ?? "";
}

export async function POST(request: Request) {
  if (process.env.VLPAY_WEBHOOK_SKIP_IP_CHECK !== "true") {
    const ip = getClientIp(request);
    if (!VLPAY_WEBHOOK_IPS.includes(ip)) {
      return NextResponse.json({ ok: false, error: "Untrusted source IP." }, { status: 403 });
    }
  }

  const body = await request.json().catch(() => null);
  const data = body?.data as
    | { disburse_no?: string; mch_order_no?: string; bank_reference?: string; state?: number; remark?: string }
    | undefined;

  if (!body?.success || !data?.mch_order_no) {
    return NextResponse.json({ ok: false, error: "Malformed payload." }, { status: 400 });
  }

  // 2 => SUCCESS, 3 => FAILED, 4 => EXPIRED (see VLPAY docs, Webhook section).
  // Anything else is left untouched rather than guessed at.
  const status = data.state === 2 ? "approved" : data.state === 3 || data.state === 4 ? "rejected" : undefined;

  const cashOut = await prisma.cashOut.findUnique({ where: { reference: data.mch_order_no } });
  if (!cashOut) {
    // Not one of ours (or already resolved) -- ack anyway so VLPAY doesn't retry forever.
    return NextResponse.json({ ok: true });
  }

  await prisma.cashOut.update({
    where: { reference: data.mch_order_no },
    data: {
      ...(status ? { status } : {}),
      vlpayOrderNo: data.disburse_no ?? cashOut.vlpayOrderNo,
      remark: data.remark ?? cashOut.remark,
    },
  });

  return NextResponse.json({ ok: true });
}
