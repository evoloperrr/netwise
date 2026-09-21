import { NextResponse } from "next/server";

import { createCashIn } from "@/lib/cash-ins";
import { prisma } from "@/lib/prisma";

export async function GET() {
  const cashIns = await prisma.cashIn.findMany({
    orderBy: { createdAt: "desc" },
    take: 100,
  });

  return NextResponse.json({ ok: true, cashIns });
}

export async function POST(request: Request) {
  const body = await request.json().catch(() => null);
  if (!body) {
    return NextResponse.json({ ok: false, error: "Invalid JSON body." }, { status: 400 });
  }

  const { channel, amount } = body as { channel?: unknown; amount?: unknown };
  const result = await createCashIn({ channel, amount });
  if (!result.ok) {
    return NextResponse.json({ ok: false, error: result.error }, { status: result.status });
  }

  return NextResponse.json({ ok: true, cashIn: result.cashIn }, { status: 201 });
}
