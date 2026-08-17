import { PageShell } from "@/components/page-shell";
import { StatusBadge } from "@/components/status-badge";
import styles from "@/components/ui.module.css";
import { getGatewayConfig } from "@/lib/config";
import { prisma } from "@/lib/prisma";
import { formatDate, formatPhp } from "@/lib/format";

import { CashOutForm } from "./cash-out-form";

export const dynamic = "force-dynamic";

export default async function CashOutsPage() {
  const [cashOuts, config] = await Promise.all([
    prisma.cashOut.findMany({ orderBy: { createdAt: "desc" } }),
    getGatewayConfig(),
  ]);

  return (
    <PageShell title="Cash-outs" description="Withdraw from your gateway balance and review past payouts.">
      <div className={styles.twoColumn}>
        <section className={styles.panel}>
          <div className={styles.panelHead}>
            <div className={styles.panelHeadText}>
              <h2>Payout history</h2>
              <p>Most recent withdrawal requests.</p>
            </div>
            <span className={styles.livePill}>
              <span className={styles.liveDot} />
              Live
            </span>
          </div>
          {cashOuts.length === 0 ? (
            <p className={styles.emptyState}>No payout records yet.</p>
          ) : (
            <div className={styles.tableWrap}>
              <table>
                <thead>
                  <tr>
                    <th>Recipient</th>
                    <th>Destination</th>
                    <th>Gross</th>
                    <th>Net payout</th>
                    <th>Status</th>
                    <th>Date</th>
                  </tr>
                </thead>
                <tbody>
                  {cashOuts.map((row) => (
                    <tr key={row.id}>
                      <td className={styles.cellPrimary}>{row.recipientName}</td>
                      <td>
                        {row.bank}
                        <div className={styles.cellMuted}>{row.destination}</div>
                      </td>
                      <td className={styles.mono}>{formatPhp(row.grossPhp)}</td>
                      <td className={styles.mono}>{formatPhp(row.netPhp)}</td>
                      <td>
                        <StatusBadge status={row.status} />
                        {row.remark ? <div className={styles.cellMuted}>{row.remark}</div> : null}
                      </td>
                      <td className={styles.cellMuted}>{formatDate(row.createdAt.toISOString())}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </section>

        <CashOutForm
          minPerTransactionPhp={config.minPerTransactionPhp}
          maxPerTransactionPhp={config.maxPerTransactionPhp}
          processingFeePhp={config.processingFeePhp}
        />
      </div>
    </PageShell>
  );
}
