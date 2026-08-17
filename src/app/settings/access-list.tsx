"use client";

import { useCallback, useEffect, useState } from "react";

import styles from "@/components/ui.module.css";

type AccessRow = {
  email: string;
  role: string;
};

const ROLE_LABELS: Record<string, string> = {
  view_only: "View only",
  withdraw: "Withdraw + view",
  manage: "Withdraw + manage",
};

export function AccessList() {
  const [rows, setRows] = useState<AccessRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [email, setEmail] = useState("");
  const [error, setError] = useState("");

  const load = useCallback(async () => {
    const response = await fetch("/api/access", { cache: "no-store" });
    const payload = await response.json();
    setRows(payload.grants ?? []);
    setLoading(false);
  }, []);

  useEffect(() => {
    void load();
  }, [load]);

  async function addRow(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const trimmed = email.trim();
    if (!trimmed) return;
    setError("");

    const response = await fetch("/api/access", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email: trimmed }),
    });
    const payload = await response.json();

    if (!response.ok || !payload.ok) {
      setError(payload.error ?? "Could not grant access.");
      return;
    }

    setEmail("");
    void load();
  }

  async function removeRow(target: string) {
    await fetch(`/api/access/${encodeURIComponent(target)}`, { method: "DELETE" });
    void load();
  }

  async function changeRole(target: string, role: string) {
    setRows((prev) => prev.map((row) => (row.email === target ? { ...row, role } : row)));
    await fetch(`/api/access/${encodeURIComponent(target)}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ role }),
    });
    void load();
  }

  return (
    <section className={styles.panel}>
      <div className={styles.panelHead}>
        <div className={styles.panelHeadText}>
          <h2>Dashboard access</h2>
          <p>Grant teammates view or manage access to this dashboard.</p>
        </div>
      </div>

      <form onSubmit={addRow}>
        <div className={styles.formGrid}>
          <div className={`${styles.field} ${styles.formGridFull}`}>
            <label htmlFor="grant-email">Add by email</label>
            <input
              id="grant-email"
              type="email"
              placeholder="teammate@example.com"
              value={email}
              onChange={(event) => setEmail(event.target.value)}
            />
          </div>
        </div>
        <div className={styles.formFooter}>
          <span className={styles.hint}>{error || "New grants default to view-only access."}</span>
          <button type="submit" className={styles.primaryButton}>
            Grant access
          </button>
        </div>
      </form>

      <div className={styles.tableWrap}>
        <table>
          <thead>
            <tr>
              <th>Email</th>
              <th>Role</th>
              <th></th>
            </tr>
          </thead>
          <tbody>
            {rows.map((row) => (
              <tr key={row.email}>
                <td className={styles.cellPrimary}>{row.email}</td>
                <td>
                  <select
                    className={styles.roleSelect}
                    value={row.role}
                    onChange={(event) => changeRole(row.email, event.target.value)}
                    aria-label={`Role for ${row.email}`}
                  >
                    {Object.entries(ROLE_LABELS).map(([value, label]) => (
                      <option key={value} value={value}>
                        {label}
                      </option>
                    ))}
                  </select>
                </td>
                <td>
                  <button type="button" className={styles.ghostButton} onClick={() => removeRow(row.email)}>
                    Remove
                  </button>
                </td>
              </tr>
            ))}
            {!loading && rows.length === 0 ? (
              <tr>
                <td colSpan={3} className={styles.emptyState}>
                  No one has been granted access yet.
                </td>
              </tr>
            ) : null}
          </tbody>
        </table>
      </div>
    </section>
  );
}
