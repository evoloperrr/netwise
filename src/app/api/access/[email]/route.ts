import { NextResponse } from "next/server";

import { prisma } from "@/lib/prisma";

const ROLES = ["view_only", "withdraw", "manage"] as const;

export async function PATCH(request: Request, { params }: { params: Promise<{ email: string }> }) {
  const { email } = await params;
  const normalized = decodeURIComponent(email).trim().toLowerCase();

  const body = await request.json().catch(() => null);
  const role = typeof body?.role === "string" ? body.role : "";

  if (!ROLES.includes(role as (typeof ROLES)[number])) {
    return NextResponse.json({ ok: false, error: "Invalid role." }, { status: 422 });
  }

  const grant = await prisma.accessGrant.update({
    where: { email: normalized },
    data: { role },
  });

  return NextResponse.json({ ok: true, grant });
}

export async function DELETE(_request: Request, { params }: { params: Promise<{ email: string }> }) {
  const { email } = await params;
  const normalized = decodeURIComponent(email).trim().toLowerCase();

  await prisma.accessGrant.deleteMany({ where: { email: normalized } });

  return NextResponse.json({ ok: true });
}
