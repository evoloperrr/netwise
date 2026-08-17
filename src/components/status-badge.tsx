import styles from "./ui.module.css";

const classFor: Record<string, string> = {
  approved: styles.badgeSuccess,
  processing: styles.badgeWarning,
  pending: styles.badgeWarning,
  rejected: styles.badgeDanger,
};

export function StatusBadge({ status }: { status: string }) {
  const cls = classFor[status] ?? styles.badgeNeutral;
  return <span className={`${styles.badge} ${cls}`}>{status}</span>;
}
