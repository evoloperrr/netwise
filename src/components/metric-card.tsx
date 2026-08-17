import type { ReactNode } from "react";

import styles from "./ui.module.css";

type Trend = "up" | "down" | "neutral";

type MetricCardProps = {
  label: string;
  value: string;
  icon: ReactNode;
  trendLabel?: string;
  trend?: Trend;
};

const trendClass: Record<Trend, string> = {
  up: styles.trendUp,
  down: styles.trendDown,
  neutral: styles.trendNeutral,
};

const trendArrow: Record<Trend, string> = {
  up: "↑",
  down: "↓",
  neutral: "•",
};

export function MetricCard({ label, value, icon, trendLabel, trend = "neutral" }: MetricCardProps) {
  return (
    <article className={styles.metricCard}>
      <div className={styles.metricHead}>
        <span className={styles.metricLabel}>{label}</span>
        <span className={styles.metricIcon}>{icon}</span>
      </div>
      <span className={styles.metricValue}>{value}</span>
      {trendLabel ? (
        <span className={`${styles.metricTrend} ${trendClass[trend]}`}>
          {trendArrow[trend]} {trendLabel}
        </span>
      ) : null}
    </article>
  );
}
