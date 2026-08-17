"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";

import styles from "@/components/ui.module.css";
import { banks } from "@/lib/banks";
import { formatPhp } from "@/lib/format";

type CashOutFormProps = {
  minPerTransactionPhp: number;
  maxPerTransactionPhp: number;
  processingFeePhp: number;
};

export function CashOutForm({ minPerTransactionPhp, maxPerTransactionPhp, processingFeePhp }: CashOutFormProps) {
  const router = useRouter();
  const [amount, setAmount] = useState("");
  const [bank, setBank] = useState(banks[0]);
  const [accountNumber, setAccountNumber] = useState("");
  const [recipientName, setRecipientName] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  const numericAmount = Number(amount || 0);
  const netPayout = numericAmount > 0 ? Math.max(numericAmount - processingFeePhp, 0) : 0;
  const isValid =
    numericAmount >= minPerTransactionPhp &&
    numericAmount <= maxPerTransactionPhp &&
    accountNumber.trim().length > 0 &&
    recipientName.trim().length > 0;

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!isValid) return;
    setSubmitting(true);
    setMessage("");
    setError("");

    try {
      const response = await fetch("/api/cash-outs", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          amount: numericAmount,
          bank,
          destination: accountNumber,
          recipientName,
        }),
      });
      const payload = await response.json();

      if (!response.ok || !payload.ok) {
        throw new Error(payload.error ?? "The withdrawal could not be submitted.");
      }

      setMessage(`Withdrawal of ${formatPhp(numericAmount)} submitted.`);
      setAmount("");
      setAccountNumber("");
      setRecipientName("");
      router.refresh();
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : "The withdrawal could not be submitted.");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <section className={styles.panel}>
      <div className={styles.panelHead}>
        <div className={styles.panelHeadText}>
          <h2>New withdrawal</h2>
          <p>
            Between {formatPhp(minPerTransactionPhp)} and {formatPhp(maxPerTransactionPhp)} per transaction.
          </p>
        </div>
      </div>

      <form onSubmit={handleSubmit}>
        <div className={styles.formGrid}>
          <div className={styles.field}>
            <label htmlFor="amount">Amount (PHP)</label>
            <input
              id="amount"
              type="number"
              min={minPerTransactionPhp}
              max={maxPerTransactionPhp}
              placeholder="0.00"
              value={amount}
              onChange={(event) => setAmount(event.target.value)}
              required
            />
          </div>

          <div className={styles.field}>
            <label htmlFor="bank">Bank / e-wallet</label>
            <select id="bank" value={bank} onChange={(event) => setBank(event.target.value)}>
              {banks.map((option) => (
                <option key={option}>{option}</option>
              ))}
            </select>
          </div>

          <div className={styles.field}>
            <label htmlFor="accountNumber">Account number</label>
            <input
              id="accountNumber"
              value={accountNumber}
              onChange={(event) => setAccountNumber(event.target.value)}
              placeholder="09XX XXX XXXX"
              required
            />
          </div>

          <div className={styles.field}>
            <label htmlFor="recipientName">Recipient name</label>
            <input
              id="recipientName"
              value={recipientName}
              onChange={(event) => setRecipientName(event.target.value)}
              placeholder="Full name on the account"
              required
            />
          </div>
        </div>

        <div className={styles.summaryList}>
          <div className={styles.summaryRow}>
            <span className={styles.summaryRowLabel}>Processing fee</span>
            <span className={styles.summaryRowValue}>{formatPhp(processingFeePhp)}</span>
          </div>
          <div className={styles.summaryRow}>
            <span className={styles.summaryRowLabel}>Recipient receives</span>
            <span className={styles.summaryRowValue}>{formatPhp(netPayout)}</span>
          </div>
        </div>

        <div className={styles.formFooter}>
          <span className={styles.hint}>{error || message || "Submits directly to the local database."}</span>
          <button type="submit" className={styles.primaryButton} disabled={!isValid || submitting}>
            {submitting ? "Submitting…" : "Submit withdrawal"}
          </button>
        </div>
      </form>
    </section>
  );
}
