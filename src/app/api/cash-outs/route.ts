import { NextResponse } from "next/server";

import { createCashOut } from "@/lib/cash-outs";
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

  const result = await createCashOut(body);
  if (!result.ok) {
    return NextResponse.json({ ok: false, error: result.error }, { status: result.status });
  }

  return NextResponse.json({ ok: true, cashOut: result.cashOut }, { status: 201 });
}
