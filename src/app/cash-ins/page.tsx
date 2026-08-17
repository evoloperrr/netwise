import { PageShell } from "@/components/page-shell";
import { StatusBadge } from "@/components/status-badge";
import styles from "@/components/ui.module.css";
import { prisma } from "@/lib/prisma";
import { formatDate, formatPhp } from "@/lib/format";

export const dynamic = "force-dynamic";

export default async function CashInsPage() {
  const cashIns = await prisma.cashIn.findMany({ orderBy: { createdAt: "desc" } });

  const totalGross = cashIns.reduce((sum, row) => sum + row.grossPhp, 0);
  const totalFees = cashIns.reduce((sum, row) => sum + row.feePhp, 0);

  return (
    <PageShell title="Cash-ins" description="Every payment received through the gateway, across all channels.">
      <section className={styles.panel}>
        <div className={styles.panelHead}>
          <div className={styles.panelHeadText}>
            <h2>Payment activity</h2>
            <p>
              {formatPhp(totalGross)} total gross · {formatPhp(totalFees)} in fees
            </p>
          </div>
          <span className={styles.livePill}>
            <span className={styles.liveDot} />
            Live
          </span>
        </div>
        {cashIns.length === 0 ? (
          <p className={styles.emptyState}>No cash-in records yet.</p>
        ) : (
          <div className={styles.tableWrap}>
            <table>
              <thead>
                <tr>
                  <th>Reference</th>
                  <th>Channel</th>
                  <th>Gross</th>
                  <th>Fee</th>
                  <th>Net credit</th>
                  <th>Status</th>
                  <th>Date</th>
                </tr>
              </thead>
              <tbody>
                {cashIns.map((row) => (
                  <tr key={row.id}>
                    <td className={styles.cellPrimary}>{row.reference}</td>
                    <td>{row.channel}</td>
                    <td className={styles.mono}>{formatPhp(row.grossPhp)}</td>
                    <td className={styles.mono}>{formatPhp(row.feePhp)}</td>
                    <td className={styles.mono}>{formatPhp(row.netCreditPhp)}</td>
                    <td>
                      <StatusBadge status={row.status} />
                    </td>
                    <td className={styles.cellMuted}>{formatDate(row.createdAt.toISOString())}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>
    </PageShell>
  );
}
