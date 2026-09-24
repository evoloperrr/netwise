import type { CashIn, CashOut } from "@/generated/prisma/client";

// Shapes returned by the public /api/v1/* endpoints. Fees, net amounts and the
// gateway's own order numbers are internal -- integrators must never see them.
export function toPublicCashIn(row: CashIn) {
  return {
    id: row.id,
    reference: row.reference,
    channel: row.channel,
    grossPhp: row.grossPhp,
    status: row.status,
    checkoutUrl: row.checkoutUrl,
    createdAt: row.createdAt,
  };
}

export function toPublicCashOut(row: CashOut) {
  return {
    id: row.id,
    reference: row.reference,
    recipientName: row.recipientName,
    destination: row.destination,
    bank: row.bank,
    grossPhp: row.grossPhp,
    status: row.status,
    remark: row.remark,
    createdAt: row.createdAt,
  };
}
