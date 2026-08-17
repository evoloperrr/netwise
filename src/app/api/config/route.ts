import { NextResponse } from "next/server";

import { getGatewayConfig } from "@/lib/config";

export async function GET() {
  const config = await getGatewayConfig();

  return NextResponse.json({ ok: true, config });
}
