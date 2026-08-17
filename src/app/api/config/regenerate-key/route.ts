import { NextResponse } from "next/server";

import { regenerateApiKey } from "@/lib/config";

export async function POST() {
  const config = await regenerateApiKey();

  return NextResponse.json({ ok: true, apiKey: config.apiKey });
}
