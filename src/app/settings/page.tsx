import { PageShell } from "@/components/page-shell";
import styles from "@/components/ui.module.css";
import { getGatewayConfig } from "@/lib/config";
import { formatPhp } from "@/lib/format";

import { AccessList } from "./access-list";
import { ApiKeyCard } from "./api-key-card";

export const dynamic = "force-dynamic";

export default async function SettingsPage() {
  const config = await getGatewayConfig();

  return (
    <PageShell title="Settings" description="Manage who can access this dashboard and how payouts are configured.">
      <section className={styles.panel}>
        <div className={styles.panelHead}>
          <div className={styles.panelHeadText}>
            <h2>Payout configuration</h2>
            <p>Stored in the local database -- wire this up to your real gateway config when ready.</p>
          </div>
        </div>
        <div className={styles.summaryList}>
          <div className={styles.summaryRow}>
            <span className={styles.summaryRowLabel}>Per-transaction limit</span>
            <span className={styles.summaryRowValue}>
              {formatPhp(config.minPerTransactionPhp)} – {formatPhp(config.maxPerTransactionPhp)}
            </span>
          </div>
          <div className={styles.summaryRow}>
            <span className={styles.summaryRowLabel}>Processing fee</span>
            <span className={styles.summaryRowValue}>{formatPhp(config.processingFeePhp)} flat</span>
          </div>
          <div className={styles.summaryRow}>
            <span className={styles.summaryRowLabel}>Cash-outs</span>
            <span className={styles.summaryRowValue}>{config.cashOutsEnabled ? "Enabled" : "Disabled"}</span>
          </div>
        </div>
      </section>

      <ApiKeyCard apiKey={config.apiKey} />

      <AccessList />
    </PageShell>
  );
}
