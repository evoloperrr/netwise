import { NextResponse } from "next/server";

import { prisma } from "@/lib/prisma";

export async function GET() {
  const grants = await prisma.accessGrant.findMany({
    orderBy: { createdAt: "asc" },
  });

  return NextResponse.json({ ok: true, grants });
}

export async function POST(request: Request) {
  const body = await request.json().catch(() => null);
  const email = typeof body?.email === "string" ? body.email.trim().toLowerCase() : "";

  if (!email || !email.includes("@")) {
    return NextResponse.json({ ok: false, error: "Enter a valid email address." }, { status: 422 });
  }

  const existing = await prisma.accessGrant.findUnique({ where: { email } });
  if (existing) {
    return NextResponse.json({ ok: false, error: "That email already has access." }, { status: 409 });
  }

  const grant = await prisma.accessGrant.create({
    data: { email, role: "view_only" },
  });

  return NextResponse.json({ ok: true, grant }, { status: 201 });
}
