import { NextResponse } from "next/server";

import { prisma } from "@/lib/prisma";

export async function DELETE(_request: Request, { params }: { params: Promise<{ email: string }> }) {
  const { email } = await params;
  const normalized = decodeURIComponent(email).trim().toLowerCase();

  await prisma.accessGrant.deleteMany({ where: { email: normalized } });

  return NextResponse.json({ ok: true });
}
