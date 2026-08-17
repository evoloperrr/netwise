import { PageShell } from "@/components/page-shell";
import { MetricCard } from "@/components/metric-card";
import { StatusBadge } from "@/components/status-badge";
import styles from "@/components/ui.module.css";
import { prisma } from "@/lib/prisma";
import { formatDate, formatPhp } from "@/lib/format";

// Queries the database on every request -- without this, Next.js
// prerenders this page once at build time and every visitor sees
// whatever the database contained during `next build`.
export const dynamic = "force-dynamic";

const icons = {
  wallet: (
    <svg viewBox="0 0 20 20" fill="none">
      <rect x="2.5" y="5.5" width="15" height="10" rx="2.2" stroke="currentColor" strokeWidth="1.5" />
      <path d="M2.5 8.5h15" stroke="currentColor" strokeWidth="1.5" />
      <circle cx="14" cy="11.5" r="1" fill="currentColor" />
    </svg>
  ),
  inflow: (
    <svg viewBox="0 0 20 20" fill="none">
      <path d="M5 12.5 9 8.5l2.5 2.5L15 7.5" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M11.5 7.5H15v3.5" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  ),
  fee: (
    <svg viewBox="0 0 20 20" fill="none">
      <circle cx="10" cy="10" r="7" stroke="currentColor" strokeWidth="1.5" />
      <path d="M8 8h1.6a1.2 1.2 0 1 1 0 2.4H8m0 0h1.8a1.2 1.2 0 1 1 0 2.4H8M8 8V6.5m0 8V13" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  ),
  outflow: (
    <svg viewBox="0 0 20 20" fill="none">
      <path d="M5 7.5 9 11.5l2.5-2.5L15 12.5" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M11.5 12.5H15V9" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  ),
};

export default async function DashboardPage() {
  const [approvedCashInAgg, approvedCashOutAgg, recentCashIns, recentCashOuts] = await Promise.all([
    prisma.cashIn.aggregate({
      where: { status: "approved" },
      _sum: { grossPhp: true, feePhp: true, netCreditPhp: true },
    }),
    prisma.cashOut.aggregate({
      where: { status: "approved" },
      _sum: { grossPhp: true },
    }),
    prisma.cashIn.findMany({ orderBy: { createdAt: "desc" }, take: 5 }),
    prisma.cashOut.findMany({ orderBy: { createdAt: "desc" }, take: 5 }),
  ]);

  const totalCashInsPhp = approvedCashInAgg._sum.grossPhp ?? 0;
  const processingFeesPhp = approvedCashInAgg._sum.feePhp ?? 0;
  const totalNetCreditedPhp = approvedCashInAgg._sum.netCreditPhp ?? 0;
  const totalPayoutsPhp = approvedCashOutAgg._sum.grossPhp ?? 0;
  const availableBalancePhp = Math.max(totalNetCreditedPhp - totalPayoutsPhp, 0);

  return (
    <PageShell
      title="Dashboard"
      description="Overview of your gateway balance, cash-ins, and payouts."
      actions={
        <button className={styles.ghostButton} type="button">
          <svg viewBox="0 0 20 20" fill="none">
            <path d="M10 3v9.5M10 12.5 6.7 9.2M10 12.5l3.3-3.3" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
            <path d="M4 14.5v1.8a1 1 0 0 0 1 1h10a1 1 0 0 0 1-1v-1.8" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
          Export report
        </button>
      }
    >
      <div className={styles.metricGrid}>
        <MetricCard label="Available balance" value={formatPhp(availableBalancePhp)} icon={icons.wallet} trendLabel="Approved cash-ins minus payouts" trend="neutral" />
        <MetricCard label="Total cash-ins" value={formatPhp(totalCashInsPhp)} icon={icons.inflow} trendLabel="Approved only" trend="neutral" />
        <MetricCard label="Processing fees" value={formatPhp(processingFeesPhp)} icon={icons.fee} trendLabel="Collected on approved cash-ins" trend="neutral" />
        <MetricCard label="Total payouts" value={formatPhp(totalPayoutsPhp)} icon={icons.outflow} trendLabel="Approved only" trend="neutral" />
      </div>

      <section className={styles.panel}>
        <div className={styles.panelHead}>
          <div className={styles.panelHeadText}>
            <h2>Recent cash-outs</h2>
            <p>Latest withdrawal requests across all channels.</p>
          </div>
          <span className={styles.livePill}>
            <span className={styles.liveDot} />
            Live
          </span>
        </div>
        {recentCashOuts.length === 0 ? (
          <p className={styles.emptyState}>No cash-out records yet.</p>
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
                {recentCashOuts.map((row) => (
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
                    </td>
                    <td className={styles.cellMuted}>{formatDate(row.createdAt.toISOString())}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>

      <section className={styles.panel}>
        <div className={styles.panelHead}>
          <div className={styles.panelHeadText}>
            <h2>Recent cash-ins</h2>
            <p>Latest successful and pending payments.</p>
          </div>
          <span className={styles.livePill}>
            <span className={styles.liveDot} />
            Live
          </span>
        </div>
        {recentCashIns.length === 0 ? (
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
                  <th>Status</th>
                  <th>Date</th>
                </tr>
              </thead>
              <tbody>
                {recentCashIns.map((row) => (
                  <tr key={row.id}>
                    <td className={styles.cellPrimary}>{row.reference}</td>
                    <td>{row.channel}</td>
                    <td className={styles.mono}>{formatPhp(row.grossPhp)}</td>
                    <td className={styles.mono}>{formatPhp(row.feePhp)}</td>
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
