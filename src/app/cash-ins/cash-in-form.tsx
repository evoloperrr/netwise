"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";

import styles from "@/components/ui.module.css";
import { CHANNELS } from "@/lib/channels";
import { formatPhp } from "@/lib/format";

type CashInFormProps = {
  vlpayFeePercent: number;
  markupPercent: number;
};

export function CashInForm({ vlpayFeePercent, markupPercent }: CashInFormProps) {
  const router = useRouter();
  const [amount, setAmount] = useState("");
  const [channel, setChannel] = useState<(typeof CHANNELS)[number]>(CHANNELS[0]);
  const [submitting, setSubmitting] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  const totalFeePercent = vlpayFeePercent + markupPercent;
  const numericAmount = Number(amount || 0);
  const vlpayFeePhp = numericAmount > 0 ? Math.round(numericAmount * (vlpayFeePercent / 100) * 100) / 100 : 0;
  const markupFeePhp = numericAmount > 0 ? Math.round(numericAmount * (markupPercent / 100) * 100) / 100 : 0;
  const totalFeePhp = numericAmount > 0 ? Math.round(numericAmount * (totalFeePercent / 100) * 100) / 100 : 0;
  const netCredit = numericAmount > 0 ? Math.max(numericAmount - totalFeePhp, 0) : 0;
  const isValid = numericAmount > 0;

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!isValid) return;
    setSubmitting(true);
    setMessage("");
    setError("");

    try {
      const response = await fetch("/api/cash-ins", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ amount: numericAmount, channel }),
      });
      const payload = await response.json();

      if (!response.ok || !payload.ok) {
        throw new Error(payload.error ?? "The cash-in could not be recorded.");
      }

      setMessage(`Cash-in of ${formatPhp(numericAmount)} recorded.`);
      setAmount("");
      router.refresh();
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : "The cash-in could not be recorded.");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <section className={styles.panel}>
      <div className={styles.panelHead}>
        <div className={styles.panelHeadText}>
          <h2>New cash-in</h2>
          <p>Manually record a payment received outside the API.</p>
        </div>
      </div>

      <form onSubmit={handleSubmit}>
        <div className={styles.formGrid}>
          <div className={styles.field}>
            <label htmlFor="ci-amount">Amount (PHP)</label>
            <input
              id="ci-amount"
              type="number"
              min={0}
              step="0.01"
              placeholder="0.00"
              value={amount}
              onChange={(event) => setAmount(event.target.value)}
              required
            />
          </div>

          <div className={styles.field}>
            <label htmlFor="ci-channel">Channel</label>
            <select
              id="ci-channel"
              value={channel}
              onChange={(event) => setChannel(event.target.value as (typeof CHANNELS)[number])}
            >
              {CHANNELS.map((option) => (
                <option key={option}>{option}</option>
              ))}
            </select>
          </div>
        </div>

        <div className={styles.summaryList}>
          <div className={styles.summaryRow}>
            <span className={styles.summaryRowLabel}>VLPAY fee ({vlpayFeePercent}%)</span>
            <span className={styles.summaryRowValue}>{formatPhp(vlpayFeePhp)}</span>
          </div>
          <div className={styles.summaryRow}>
            <span className={styles.summaryRowLabel}>Our markup ({markupPercent}%)</span>
            <span className={styles.summaryRowValue}>{formatPhp(markupFeePhp)}</span>
          </div>
          <div className={styles.summaryRow}>
            <span className={styles.summaryRowLabel}>Total charge ({totalFeePercent}%)</span>
            <span className={styles.summaryRowValue}>{formatPhp(totalFeePhp)}</span>
          </div>
          <div className={styles.summaryRow}>
            <span className={styles.summaryRowLabel}>Net credit</span>
            <span className={styles.summaryRowValue}>{formatPhp(netCredit)}</span>
          </div>
        </div>

        <div className={styles.formFooter}>
          <span className={styles.hint}>{error || message || "Submits directly to the local database."}</span>
          <button type="submit" className={styles.primaryButton} disabled={!isValid || submitting}>
            {submitting ? "Submitting…" : "Record cash-in"}
          </button>
        </div>
      </form>
    </section>
  );
}
